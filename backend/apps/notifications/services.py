"""Service d'envoi de notifications — sync en dev, async via Celery en prod."""
from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

logger = logging.getLogger("ecclesia")


def notify(
    *,
    recipient_user=None,
    recipient_member=None,
    channel: str = "IN_APP",
    notification_type: str = "OTHER",
    subject: str = "",
    message: str = "",
    related_object=None,
    send: bool = True,
):
    from apps.notifications.models import Notification

    obj_type, obj_id = None, None
    if related_object is not None:
        obj_type = related_object._meta.model_name
        obj_id = related_object.pk

    notif = Notification.objects.create(
        recipient_user=recipient_user,
        recipient_member=recipient_member,
        channel=channel,
        notification_type=notification_type,
        subject=subject,
        message=message,
        related_object_type=obj_type,
        related_object_id=obj_id,
    )

    if send:
        _dispatch(notif)

    return notif


def _dispatch(notif):
    from apps.notifications.models import Notification

    try:
        if notif.channel == "EMAIL":
            _send_email(notif)
        elif notif.channel == "WHATSAPP":
            _send_whatsapp(notif)
        # IN_APP ne nécessite pas d'envoi
        notif.status = "SENT"
        notif.sent_at = timezone.now()
    except Exception as e:
        notif.status = "FAILED"
        notif.error_message = str(e)[:500]
        logger.error("Échec envoi notification %s: %s", notif.id, e)
    notif.save(update_fields=["status", "sent_at", "error_message"])


def _send_email(notif):
    recipient = None
    if notif.recipient_user:
        recipient = notif.recipient_user.email
    elif notif.recipient_member and notif.recipient_member.email:
        recipient = notif.recipient_member.email
    if not recipient:
        raise ValueError("Pas d'adresse email destinataire")
    send_mail(
        subject=notif.subject,
        message=notif.message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient],
        fail_silently=False,
    )


def _send_whatsapp(notif):
    """Provider factice pour WhatsApp — log le message."""
    logger.info(
        "WhatsApp (fake) -> %s: %s",
        notif.recipient_member.phone if notif.recipient_member else "N/A",
        notif.message,
    )
