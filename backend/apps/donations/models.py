"""Modèles Don et Recu."""
from __future__ import annotations

from django.core.validators import MinValueValidator
from django.db import models

from apps.common.enums import (
    DonationStatus,
    DonationType,
    PaymentMethod,
    ReceiptStatus,
)
from apps.common.models import TimeStampedModel


class Don(TimeStampedModel):
    donation_number = models.CharField(max_length=30, unique=True, verbose_name="Numéro de don")
    member = models.ForeignKey(
        "members.Membre",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="donations",
        verbose_name="Membre",
    )
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.PROTECT,
        related_name="donations",
        verbose_name="Église",
    )
    donation_type = models.CharField(
        max_length=30, choices=DonationType.choices, verbose_name="Type de don"
    )
    amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name="Montant",
    )
    donation_date = models.DateField(verbose_name="Date du don")
    received_at = models.DateTimeField(auto_now_add=True, verbose_name="Enregistré le")
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices,
        default=PaymentMethod.CASH, verbose_name="Mode de paiement",
    )
    reference = models.CharField(max_length=100, blank=True, verbose_name="Référence")
    status = models.CharField(
        max_length=30, choices=DonationStatus.choices,
        default=DonationStatus.PENDING_VALIDATION, verbose_name="Statut",
    )
    recorded_by = models.ForeignKey(
        "accounts.User",
        null=True,
        on_delete=models.SET_NULL,
        related_name="recorded_donations",
        verbose_name="Enregistré par",
    )
    validated_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="validated_donations",
        verbose_name="Validé par",
    )
    validated_at = models.DateTimeField(null=True, blank=True, verbose_name="Validé le")
    cancellation_reason = models.CharField(max_length=500, blank=True, verbose_name="Motif d'annulation")
    cancelled_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="cancelled_donations",
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Don"
        verbose_name_plural = "Dons"
        ordering = ["-donation_date"]

    def __str__(self):
        return f"Don {self.donation_number} — {self.amount}"

    def save(self, *args, **kwargs):
        if not self.donation_number:
            self.donation_number = self._generate_number()
        super().save(*args, **kwargs)

    def _generate_number(self) -> str:
        prefix = "DON"
        last = (
            Don.objects.order_by("-id")
            .filter(donation_number__startswith=prefix)
            .values_list("donation_number", flat=True)
            .first()
        )
        if last:
            try:
                num = int(last.replace(prefix, "")) + 1
            except ValueError:
                num = Don.objects.count() + 1
        else:
            num = 1
        return f"{prefix}{num:06d}"


class Recu(TimeStampedModel):
    receipt_number = models.CharField(max_length=30, unique=True, verbose_name="Numéro de reçu")
    donation = models.OneToOneField(
        Don,
        on_delete=models.PROTECT,
        related_name="receipt",
        verbose_name="Don",
    )
    issued_at = models.DateTimeField(auto_now_add=True, verbose_name="Émis le")
    pdf_file = models.FileField(upload_to="receipts/", blank=True, null=True)
    sent_by_email = models.BooleanField(default=False, verbose_name="Envoyé par email")
    sent_by_whatsapp = models.BooleanField(default=False, verbose_name="Envoyé par WhatsApp")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="Envoyé le")
    status = models.CharField(
        max_length=20, choices=ReceiptStatus.choices,
        default=ReceiptStatus.ISSUED, verbose_name="Statut",
    )

    class Meta:
        verbose_name = "Reçu"
        verbose_name_plural = "Reçus"

    def __str__(self):
        return f"Reçu {self.receipt_number}"

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = self._generate_number()
        super().save(*args, **kwargs)

    def _generate_number(self) -> str:
        prefix = "REC"
        last = (
            Recu.objects.order_by("-id")
            .filter(receipt_number__startswith=prefix)
            .values_list("receipt_number", flat=True)
            .first()
        )
        if last:
            try:
                num = int(last.replace(prefix, "")) + 1
            except ValueError:
                num = Recu.objects.count() + 1
        else:
            num = 1
        return f"{prefix}{num:06d}"
