"""Modèles SessionCulte et PresenceMembre."""
from __future__ import annotations

from django.db import models

from apps.common.enums import PresenceStatus, ServiceType
from apps.common.models import TimeStampedModel


class SessionCulte(TimeStampedModel):
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.PROTECT,
        related_name="worship_sessions",
        verbose_name="Église",
    )
    chapel = models.ForeignKey(
        "churches.Chapelle",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="worship_sessions",
        verbose_name="Chapelle",
    )
    service_type = models.CharField(
        max_length=20, choices=ServiceType.choices, default=ServiceType.SABBATH, verbose_name="Type de culte"
    )
    date = models.DateField(verbose_name="Date")
    leader = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="led_sessions",
        verbose_name="Responsable",
    )
    men_count = models.PositiveIntegerField(default=0, verbose_name="Hommes")
    women_count = models.PositiveIntegerField(default=0, verbose_name="Femmes")
    children_count = models.PositiveIntegerField(default=0, verbose_name="Enfants")
    visitors_count = models.PositiveIntegerField(default=0, verbose_name="Visiteurs")
    notes = models.TextField(blank=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Session de culte"
        verbose_name_plural = "Sessions de culte"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.get_service_type_display()} — {self.date}"

    @property
    def total_count(self):
        return self.men_count + self.women_count + self.children_count + self.visitors_count


class PresenceMembre(TimeStampedModel):
    session = models.ForeignKey(
        SessionCulte,
        on_delete=models.CASCADE,
        related_name="presences",
        verbose_name="Session",
    )
    member = models.ForeignKey(
        "members.Membre",
        on_delete=models.CASCADE,
        related_name="presences",
        verbose_name="Membre",
    )
    status = models.CharField(
        max_length=10, choices=PresenceStatus.choices, default=PresenceStatus.PRESENT, verbose_name="Statut"
    )
    check_in_time = models.DateTimeField(null=True, blank=True, verbose_name="Heure d'arrivée")
    notes = models.TextField(blank=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Présence"
        verbose_name_plural = "Présences"
        unique_together = ["session", "member"]
