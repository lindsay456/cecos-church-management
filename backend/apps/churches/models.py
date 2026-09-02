"""Modèle Chapelle / Paroisse rattachée à une Église."""
from __future__ import annotations

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.common.models import TimeStampedModel


class Chapelle(TimeStampedModel):
    """Chapelle (Catholique/Protestant) ou lieu de culte secondaire (Adventiste)."""

    name = models.CharField(max_length=255, verbose_name="Nom de la chapelle")
    code = models.CharField(max_length=50, verbose_name="Code")
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.CASCADE,
        related_name="chapels",
        verbose_name="Église mère",
    )
    address = models.CharField(max_length=255, blank=True, verbose_name="Adresse")
    city = models.CharField(max_length=128, blank=True, verbose_name="Ville")
    neighborhood = models.CharField(max_length=128, blank=True, verbose_name="Quartier")
    country = models.CharField(max_length=100, blank=True, verbose_name="Pays")
    phone = models.CharField(max_length=30, blank=True, verbose_name="Téléphone")
    leader = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="led_chapels",
        verbose_name="Responsable de chapelle",
    )
    capacity = models.PositiveIntegerField(null=True, blank=True, verbose_name="Capacité")
    worship_schedule = models.CharField(max_length=255, blank=True, verbose_name="Horaires de culte")
    observations = models.TextField(blank=True, verbose_name="Observations")
    gps_lat = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        verbose_name="Latitude",
    )
    gps_lng = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
        verbose_name="Longitude",
    )
    is_active = models.BooleanField(default=True, verbose_name="Actif")

    class Meta:
        verbose_name = "Chapelle"
        verbose_name_plural = "Chapelles"
        ordering = ["name"]
        unique_together = ["code", "church"]

    def __str__(self):
        return f"{self.name} ({self.church.name})"
