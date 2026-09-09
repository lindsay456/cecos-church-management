"""Service de redistribution comptable et workflow des dons."""
from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.audit.services import audit_log
from apps.common.enums import (
    AuditAction,
    DonationStatus,
    Denomination,
    RedistributionStatus,
)


def validate_donation(don, user):
    """Valide un don et déclenche la redistribution si applicable.

    Transactionnel : si la redistribution échoue, le don ne passe pas à l'état validé.
    """
    if don.status != DonationStatus.PENDING_VALIDATION:
        raise ValueError("Seuls les dons en attente de validation peuvent être validés.")

    with transaction.atomic():
        # Mettre à jour le statut du don
        don.status = DonationStatus.VALIDATED
        don.validated_by = user
        don.validated_at = timezone.now()
        don.save(update_fields=["status", "validated_by", "validated_at", "updated_at"])

        # Redistribution UNIQUEMENT pour les Adventistes
        if don.church.denomination == Denomination.ADVENTIST:
            from apps.redistribution.services import compute_redistributions
            compute_redistributions(don)

        # Générer le reçu
        from apps.donations.models import Recu
        receipt = Recu.objects.create(donation=don, status="ISSUED")

        # Envoyer le reçu par email au membre
        member_email = getattr(don, 'member_email', None) or (don.member.email if don.member else None)
        if member_email:
            from apps.notifications.services import notify
            from apps.common.enums import NotificationType
            from apps.donations.receipt_generator import generate_donation_receipt_pdf
            pdf_buffer = generate_donation_receipt_pdf(receipt, don)

            notify(
                recipient_user=user,
                channel="EMAIL",
                notification_type=NotificationType.RECEIPT,
                subject=f"Reçu de don {receipt.receipt_number} — {don.amount} FCFA",
                message=(
                    f"Bonjour,\n\n"
                    f"Un don de {don.amount} FCFA ({don.get_donation_type_display()}) "
                    f"a été validé et enregistré sous le numéro {don.donation_number}.\n\n"
                    f"Numéro de reçu : {receipt.receipt_number}\n"
                    f"Date : {don.donation_date}\n"
                    f"Montant : {don.amount} FCFA\n\n"
                    f"Vous trouverez le reçu en pièce jointe.\n\n"
                    f"L'equipe Cecos Church Management"
                ),
                related_object=don,
                send=True,
            )
            receipt.sent_by_email = True
            receipt.sent_at = timezone.now()
            receipt.save(update_fields=["sent_by_email", "sent_at", "updated_at"])

        # Journal d'audit
        audit_log(
            action=AuditAction.VALIDATE,
            app_label="donations",
            model_name="don",
            object_id=don.pk,
            object_repr=str(don),
            new_values={"amount": str(don.amount), "status": DonationStatus.VALIDATED},
            user=user,
        )

    return don


def cancel_donation(don, user, reason=""):
    """Annule un don validé via une écriture corrective."""
    if don.status not in (DonationStatus.VALIDATED, DonationStatus.PENDING_VALIDATION):
        raise ValueError("Le don ne peut pas être annulé dans son statut actuel.")

    with transaction.atomic():
        don.status = DonationStatus.CANCELLED
        don.cancelled_by = user
        don.cancelled_at = timezone.now()
        don.cancellation_reason = reason
        don.save(update_fields=[
            "status", "cancelled_by", "cancelled_at", "cancellation_reason", "updated_at"
        ])

        audit_log(
            action=AuditAction.CANCEL,
            app_label="donations",
            model_name="don",
            object_id=don.pk,
            object_repr=str(don),
            new_values={"status": DonationStatus.CANCELLED},
            user=user,
            reason=reason,
        )
    return don
