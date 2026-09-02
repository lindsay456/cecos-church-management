"""Modèle Visiteur."""
from __future__ import annotations

from django.db import models

from apps.common.enums import VisitorStatus
from apps.common.models import TimeStampedModel


class Visiteur(TimeStampedModel):
    first_name = models.CharField(max_length=128, blank=True, verbose_name="Prénom")
    last_name = models.CharField(max_length=128, blank=True, verbose_name="Nom")
    phone = models.CharField(max_length=30, blank=True, verbose_name="Téléphone")
    email = models.EmailField(blank=True, verbose_name="Email")
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.PROTECT,
        related_name="visitors",
        verbose_name="Église visitée",
    )
    first_visit_date = models.DateField(verbose_name="Date de première visite")
    invited_by = models.ForeignKey(
        "members.Membre",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="invited_visitors",
        verbose_name="Invité par",
    )
    reason_for_visit = models.CharField(max_length=255, blank=True, verbose_name="Motif de visite")
    wants_follow_up = models.BooleanField(default=False, verbose_name="Souhaite un suivi")
    consent_contact = models.BooleanField(default=False, verbose_name="Consentement de contact")
    follow_up_status = models.CharField(
        max_length=20, choices=VisitorStatus.choices, default=VisitorStatus.NEW, verbose_name="Statut de suivi"
    )
    notes = models.TextField(blank=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Visiteur"
        verbose_name_plural = "Visiteurs"
        ordering = ["-first_visit_date"]

    def __str__(self):
        name = self.full_name
        return name if name else f"Visiteur du {self.first_visit_date}"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()
