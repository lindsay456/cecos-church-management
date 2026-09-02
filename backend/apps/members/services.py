"""Services métier pour les membres."""
from __future__ import annotations

from typing import Optional

from django.db.models import Q, QuerySet


def detect_duplicate_members(
    *,
    first_name: str,
    last_name: str,
    birth_date=None,
    phone: str = "",
    email: str = "",
    exclude_id: Optional[int] = None,
) -> QuerySet:
    from apps.members.models import Membre

    qs = Membre.objects.filter(is_active=True)
    if exclude_id is not None:
        qs = qs.exclude(pk=exclude_id)
    conditions = Q(
        first_name__iexact=first_name.strip(),
        last_name__iexact=last_name.strip(),
    )
    if birth_date:
        conditions |= Q(birth_date=birth_date)
    if phone:
        conditions |= Q(phone__iexact=phone.strip())
    if email:
        conditions |= Q(email__iexact=email.strip())
    return qs.filter(conditions)


def transfer_member(member, new_church, *, requested_by=None, reason="", notes=""):
    from django.db import transaction
    from django.utils import timezone

    from apps.common.enums import AuditAction, TransferStatus
    from apps.members.models import HistoriqueAffectationMembre

    with transaction.atomic():
        old_church_id = member.church_id
        member.church = new_church
        member.status = "TRANSFERRED"
        member.save(update_fields=["church", "status", "updated_at"])

        record = HistoriqueAffectationMembre.objects.create(
            member=member,
            previous_church_id=old_church_id,
            new_church=new_church,
            transfer_date=timezone.now().date(),
            transfer_reason=reason,
            requested_by=requested_by,
            approved_by=requested_by,
            status=TransferStatus.APPROVED,
            notes=notes,
        )

        from apps.audit.services import audit_log

        audit_log(
            action=AuditAction.TRANSFER,
            app_label="members",
            model_name="membre",
            object_id=member.pk,
            object_repr=str(member),
            old_values={"church_id": old_church_id},
            new_values={"church_id": new_church.id},
            user=requested_by,
            reason=reason,
        )

    return record
