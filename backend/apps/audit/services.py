"""Service d'écriture du journal d'audit + middleware de contexte."""
from __future__ import annotations

import threading
from typing import Any, Optional

from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

_local = threading.local()


class AuditContextMiddleware:
    """Capture l'IP et le user-agent de la requête courante."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip = None
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        if xff:
            ip = xff.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR")
        _local.ip_address = ip
        _local.user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]
        try:
            return self.get_response(request)
        finally:
            _local.ip_address = None
            _local.user_agent = None


def audit_log(
    *,
    action: str,
    app_label: str,
    model_name: str,
    object_id: Any = None,
    object_repr: Optional[str] = None,
    old_values: Optional[dict] = None,
    new_values: Optional[dict] = None,
    reason: Optional[str] = None,
    user=None,
    request=None,
    commit: bool = True,
):
    """Écrit une entrée dans le journal d'audit.

    L'audit est toujours écrit en dehors de toute transaction appelante pour
    garantir que l'information de sécurité n'est jamais perdue si l'opération
    métier échoue ensuite. Il faut néanmoins l'utiliser dans la transaction
    métier quand l'opération doit être atomique.
    """
    from apps.audit.models import JournalAudit

    if user is None and request is not None:
        user = getattr(request, "user", None)
    if user is not None and not user.is_authenticated:
        user = None

    ip = getattr(_local, "ip_address", None)
    ua = getattr(_local, "user_agent", None)
    if request is not None:
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        ip = (xff.split(",")[0].strip() if xff else request.META.get("REMOTE_ADDR")) or ip
        ua = request.META.get("HTTP_USER_AGENT", "")[:500] or ua

    entry = JournalAudit(
        user=user,
        action=action,
        app_label=app_label,
        model_name=model_name,
        object_id=str(object_id) if object_id is not None else None,
        object_repr=(object_repr or "")[:255],
        old_values=old_values,
        new_values=new_values,
        reason=reason,
        ip_address=ip,
        user_agent=ua,
    )
    if commit:
        entry.save()
    else:
        transaction.on_commit(entry.save)
    return entry


def audit_create(instance, *, user=None, request=None, extra: Optional[dict] = None, reason=None):
    return audit_log(
        action="CREATE",
        app_label=instance._meta.app_label,
        model_name=instance._meta.model_name,
        object_id=instance.pk,
        object_repr=str(instance),
        new_values={**(instance_to_dict(instance)), **(extra or {})},
        user=user,
        request=request,
        reason=reason,
    )


def audit_update(instance, *, user=None, request=None, old_values=None, extra=None, reason=None):
    return audit_log(
        action="UPDATE",
        app_label=instance._meta.app_label,
        model_name=instance._meta.model_name,
        object_id=instance.pk,
        object_repr=str(instance),
        old_values=old_values,
        new_values={**(instance_to_dict(instance)), **(extra or {})},
        user=user,
        request=request,
        reason=reason,
    )


def audit_view(instance, *, user=None, request=None, reason=None):
    return audit_log(
        action="VIEW",
        app_label=instance._meta.app_label,
        model_name=instance._meta.model_name,
        object_id=instance.pk,
        object_repr=str(instance),
        user=user,
        request=request,
        reason=reason,
    )


def instance_to_dict(instance) -> dict:
    """Sérialise un modèle en dict JSON-safe (FK => pk, dates => ISO, Decimal => str)."""
    from decimal import Decimal
    from django.db.models.fields.files import FieldFile
    from django.db.models.fields.related import ForeignKey
    from django.utils.timezone import is_aware

    data = {}
    for field in instance._meta.concrete_fields:
        value = getattr(instance, field.attname)
        if isinstance(field, ForeignKey):
            data[field.name + "_id"] = value
            continue
        if isinstance(value, FieldFile):
            data[field.name] = value.name if value else None
        elif isinstance(value, Decimal):
            data[field.name] = str(value)
        elif hasattr(value, "isoformat"):
            data[field.name] = value.isoformat()
        else:
            data[field.name] = value
    return data
