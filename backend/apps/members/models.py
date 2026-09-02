"""Modèles Membre et HistoriqueAffectationMembre."""
from __future__ import annotations

from django.core.validators import RegexValidator
from django.db import models

from apps.common.enums import Gender, MaritalStatus, MemberStatus, TransferStatus
from apps.common.models import SoftDeleteModel, TimeStampedModel


class Membre(TimeStampedModel, SoftDeleteModel):
    """Membre d'une église locale."""

    member_number = models.CharField(max_length=30, unique=True, verbose_name="Numéro de membre")
    first_name = models.CharField(max_length=128, verbose_name="Prénom")
    last_name = models.CharField(max_length=128, verbose_name="Nom")
    gender = models.CharField(max_length=10, choices=Gender.choices, verbose_name="Genre")
    birth_date = models.DateField(null=True, blank=True, verbose_name="Date de naissance")
    phone_regex = RegexValidator(regex=r"^\+?[\d\s\-]{8,20}$")
    phone = models.CharField(validators=[phone_regex], max_length=30, blank=True, verbose_name="Téléphone")
    email = models.EmailField(blank=True, verbose_name="Email")
    address = models.CharField(max_length=255, blank=True, verbose_name="Adresse")
    neighborhood = models.CharField(max_length=128, blank=True, verbose_name="Quartier")
    marital_status = models.CharField(
        max_length=20, choices=MaritalStatus.choices, default=MaritalStatus.SINGLE, verbose_name="État civil"
    )
    occupation = models.CharField(max_length=128, blank=True, verbose_name="Profession")
    photo = models.ImageField(upload_to="members/photos/", blank=True, null=True, verbose_name="Photo")
    emergency_contact_name = models.CharField(max_length=128, blank=True, verbose_name="Contact d'urgence (nom)")
    emergency_contact_phone = models.CharField(max_length=30, blank=True, verbose_name="Contact d'urgence (téléphone)")
    membership_date = models.DateField(verbose_name="Date d'adhésion")
    status = models.CharField(
        max_length=20, choices=MemberStatus.choices, default=MemberStatus.ACTIVE, verbose_name="Statut"
    )
    baptism_place = models.CharField(max_length=255, blank=True, verbose_name="Lieu de baptême")
    baptism_date = models.DateField(null=True, blank=True, verbose_name="Date de baptême")
    baptized_by = models.CharField(max_length=255, blank=True, verbose_name="Baptisé par")
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.PROTECT,
        related_name="members",
        verbose_name="Église",
    )
    chapel = models.ForeignKey(
        "churches.Chapelle",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="members",
        verbose_name="Chapelle",
    )
    family = models.ForeignKey(
        "families.Famille",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="members",
        verbose_name="Famille",
    )
    consent_email = models.BooleanField(default=False, verbose_name="Consentement email")
    consent_whatsapp = models.BooleanField(default=False, verbose_name="Consentement WhatsApp")
    consent_data_processing = models.BooleanField(default=False, verbose_name="Consentement traitement des données")

    class Meta:
        verbose_name = "Membre"
        verbose_name_plural = "Membres"
        ordering = ["last_name", "first_name"]
        indexes = [
            models.Index(fields=["church", "status"]),
            models.Index(fields=["last_name", "first_name"]),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.member_number})"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    def save(self, *args, **kwargs):
        if not self.member_number:
            self.member_number = self._generate_member_number()
        super().save(*args, **kwargs)

    def _generate_member_number(self) -> str:
        prefix = "MEM"
        last = (
            Membre.objects.order_by("-id")
            .filter(member_number__startswith=prefix)
            .values_list("member_number", flat=True)
            .first()
        )
        if last:
            try:
                num = int(last.replace(prefix, "")) + 1
            except ValueError:
                num = Membre.objects.count() + 1
        else:
            num = 1
        return f"{prefix}{num:06d}"


class HistoriqueAffectationMembre(TimeStampedModel):
    """Historique des transferts de membres entre églises."""

    member = models.ForeignKey(
        "members.Membre",
        on_delete=models.PROTECT,
        related_name="transfer_history",
        verbose_name="Membre",
    )
    previous_church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        null=True,
        on_delete=models.SET_NULL,
        related_name="transfers_from",
        verbose_name="Église d'origine",
    )
    new_church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        null=True,
        on_delete=models.SET_NULL,
        related_name="transfers_to",
        verbose_name="Église de destination",
    )
    transfer_date = models.DateField(verbose_name="Date du transfert")
    transfer_reason = models.CharField(max_length=500, blank=True, verbose_name="Motif du transfert")
    requested_by = models.ForeignKey(
        "accounts.User",
        null=True,
        on_delete=models.SET_NULL,
        related_name="transfer_requests",
        verbose_name="Demandé par",
    )
    approved_by = models.ForeignKey(
        "accounts.User",
        null=True,
        on_delete=models.SET_NULL,
        related_name="transfer_approvals",
        verbose_name="Approuvé par",
    )
    status = models.CharField(
        max_length=20,
        choices=TransferStatus.choices,
        default=TransferStatus.PENDING,
        verbose_name="Statut",
    )
    notes = models.TextField(blank=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Historique d'affectation"
        verbose_name_plural = "Historiques d'affectation"
        ordering = ["-transfer_date"]

    def __str__(self):
        return f"Transfert de {self.member} — {self.transfer_date}"
