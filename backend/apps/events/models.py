"""Modèles Evenement et ParticipantEvenement."""
from __future__ import annotations

from django.core.validators import MinValueValidator
from django.db import models

from apps.common.enums import EventStatus, EventType, ParticipantStatus
from apps.common.models import TimeStampedModel


class Evenement(TimeStampedModel):
    title = models.CharField(max_length=255, verbose_name="Titre")
    event_type = models.CharField(max_length=30, choices=EventType.choices, verbose_name="Type")
    description = models.TextField(blank=True, verbose_name="Description")
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.PROTECT,
        related_name="events",
        verbose_name="Église",
    )
    department = models.ForeignKey(
        "departments.Departement",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="events",
        verbose_name="Département",
    )
    organizer = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="organized_events",
        verbose_name="Organisateur",
    )
    president_or_leader = models.CharField(max_length=255, blank=True, verbose_name="Président / Responsable")
    location = models.CharField(max_length=255, blank=True, verbose_name="Lieu")
    start_datetime = models.DateTimeField(verbose_name="Début")
    end_datetime = models.DateTimeField(verbose_name="Fin")
    expected_budget = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)], verbose_name="Budget prévu",
    )
    actual_budget = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)], verbose_name="Budget réel",
    )
    status = models.CharField(
        max_length=20, choices=EventStatus.choices, default=EventStatus.DRAFT, verbose_name="Statut"
    )
    attachment = models.FileField(upload_to="events/attachments/", blank=True, null=True)

    class Meta:
        verbose_name = "Événement"
        verbose_name_plural = "Événements"
        ordering = ["-start_datetime"]

    def __str__(self):
        return f"{self.title} ({self.start_datetime:%Y-%m-%d})"

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.end_datetime and self.start_datetime and self.end_datetime <= self.start_datetime:
            raise ValidationError("La date de fin doit être postérieure à la date de début.")


class ParticipantEvenement(TimeStampedModel):
    event = models.ForeignKey(
        Evenement,
        on_delete=models.CASCADE,
        related_name="participants",
        verbose_name="Événement",
    )
    member = models.ForeignKey(
        "members.Membre",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="event_participations",
        verbose_name="Membre",
    )
    visitor = models.ForeignKey(
        "visitors.Visiteur",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="event_participations",
        verbose_name="Visiteur",
    )
    status = models.CharField(
        max_length=20, choices=ParticipantStatus.choices,
        default=ParticipantStatus.INVITED, verbose_name="Statut",
    )
    registered_at = models.DateTimeField(auto_now_add=True)
    attendance_time = models.DateTimeField(null=True, blank=True, verbose_name="Heure de présence")
    notes = models.TextField(blank=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Participant"
        verbose_name_plural = "Participants"
        unique_together = [("event", "member"), ("event", "visitor")]
