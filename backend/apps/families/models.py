"""Modèle Famille."""
from __future__ import annotations

from django.db import models

from apps.common.enums import FamilyStatus
from apps.common.models import TimeStampedModel


class Famille(TimeStampedModel):
    family_code = models.CharField(max_length=30, unique=True, verbose_name="Code famille")
    name = models.CharField(max_length=255, verbose_name="Nom de famille")
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.PROTECT,
        related_name="families",
        verbose_name="Église",
    )
    address = models.CharField(max_length=255, blank=True, verbose_name="Adresse")
    main_phone = models.CharField(max_length=30, blank=True, verbose_name="Téléphone principal")
    main_email = models.EmailField(blank=True, verbose_name="Email principal")
    household_head = models.ForeignKey(
        "members.Membre",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="headed_families",
        verbose_name="Chef de famille",
    )
    status = models.CharField(
        max_length=20, choices=FamilyStatus.choices, default=FamilyStatus.ACTIVE, verbose_name="Statut"
    )
    notes = models.TextField(blank=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Famille"
        verbose_name_plural = "Familles"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.family_code})"

    def save(self, *args, **kwargs):
        if not self.family_code:
            self.family_code = self._generate_code()
        super().save(*args, **kwargs)

    def _generate_code(self) -> str:
        prefix = "FAM"
        last = (
            Famille.objects.order_by("-id")
            .filter(family_code__startswith=prefix)
            .values_list("family_code", flat=True)
            .first()
        )
        if last:
            try:
                num = int(last.replace(prefix, "")) + 1
            except ValueError:
                num = Famille.objects.count() + 1
        else:
            num = 1
        return f"{prefix}{num:06d}"
