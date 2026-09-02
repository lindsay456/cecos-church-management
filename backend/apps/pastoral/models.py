"""Modèle SuiviPastoral."""
from __future__ import annotations

from django.db import models

from apps.common.enums import ConfidentialityLevel, PastoralActionType, PastoralStatus
from apps.common.models import TimeStampedModel


class SuiviPastoral(TimeStampedModel):
    member = models.ForeignKey(
        "members.Membre",
        on_delete=models.PROTECT,
        related_name="pastoral_followups",
        verbose_name="Membre",
    )
    assigned_to = models.ForeignKey(
        "accounts.User",
        null=True,
        on_delete=models.SET_NULL,
        related_name="assigned_followups",
        verbose_name="Responsable assigné",
    )
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.PROTECT,
        related_name="pastoral_followups",
        verbose_name="Église",
    )
    reason = models.CharField(max_length=255, verbose_name="Motif")
    action_type = models.CharField(
        max_length=30, choices=PastoralActionType.choices, verbose_name="Type d'action"
    )
    action_date = models.DateField(verbose_name="Date de l'action")
    next_action_date = models.DateField(null=True, blank=True, verbose_name="Prochaine action")
    status = models.CharField(
        max_length=20, choices=PastoralStatus.choices,
        default=PastoralStatus.OPEN, verbose_name="Statut",
    )
    confidentiality_level = models.CharField(
        max_length=30, choices=ConfidentialityLevel.choices,
        default=ConfidentialityLevel.STANDARD, verbose_name="Niveau de confidentialité",
    )
    details = models.TextField(blank=True, verbose_name="Détails")
    notes = models.TextField(blank=True, verbose_name="Notes internes")
    created_by = models.ForeignKey(
        "accounts.User",
        null=True,
        on_delete=models.SET_NULL,
        related_name="created_followups",
        verbose_name="Créé par",
    )
    closed_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="closed_followups",
        verbose_name="Clôturé par",
    )
    closed_at = models.DateTimeField(null=True, blank=True, verbose_name="Clôturé le")

    class Meta:
        verbose_name = "Suivi pastoral"
        verbose_name_plural = "Suivis pastoraux"
        ordering = ["-action_date"]

    def __str__(self):
        return f"Suivi {self.member} — {self.reason}"
