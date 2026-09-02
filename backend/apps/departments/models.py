"""Modèles Departement et MembreDepartement."""
from __future__ import annotations

from django.db import models
from django.core.validators import MinValueValidator

from apps.common.enums import DepartmentType
from apps.common.models import TimeStampedModel


class Departement(TimeStampedModel):
    name = models.CharField(max_length=255, verbose_name="Nom")
    code = models.CharField(max_length=50, unique=True, verbose_name="Code")
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.PROTECT,
        related_name="departments",
        verbose_name="Église",
    )
    department_type = models.CharField(
        max_length=30, choices=DepartmentType.choices, default=DepartmentType.OTHER, verbose_name="Type"
    )
    leader = models.ForeignKey(
        "members.Membre",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="led_departments",
        verbose_name="Responsable",
    )
    deputy_leader = models.ForeignKey(
        "members.Membre",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="deputy_departments",
        verbose_name="Adjoint",
    )
    annual_budget = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)], verbose_name="Budget annuel",
    )
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(null=True, blank=True, verbose_name="Date de fin")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    notes = models.TextField(blank=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Département"
        verbose_name_plural = "Départements"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.church.name})"


class MembreDepartement(TimeStampedModel):
    member = models.ForeignKey(
        "members.Membre",
        on_delete=models.PROTECT,
        related_name="department_memberships",
        verbose_name="Membre",
    )
    department = models.ForeignKey(
        Departement,
        on_delete=models.CASCADE,
        related_name="memberships",
        verbose_name="Département",
    )
    year = models.PositiveIntegerField(verbose_name="Année")
    role_in_department = models.CharField(max_length=100, blank=True, verbose_name="Rôle")
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(null=True, blank=True, verbose_name="Date de fin")
    is_active = models.BooleanField(default=True, verbose_name="Actif")

    class Meta:
        verbose_name = "Membre du département"
        verbose_name_plural = "Membres du département"
        unique_together = ["member", "department", "year"]

    def __str__(self):
        return f"{self.member} → {self.department.name} ({self.year})"


class PlanAnnuel(TimeStampedModel):
    """Activite ou evenement annuel d'un departement."""

    department = models.ForeignKey(
        Departement,
        on_delete=models.CASCADE,
        related_name="annual_plans",
        verbose_name="Departement",
    )
    year = models.PositiveIntegerField(verbose_name="Annee")
    title = models.CharField(max_length=255, verbose_name="Titre")
    description = models.TextField(blank=True, verbose_name="Description")
    planned_date = models.DateField(null=True, blank=True, verbose_name="Date prevue")
    status = models.CharField(
        max_length=20,
        choices=[("PLANNED", "Planifie"), ("IN_PROGRESS", "En cours"), ("DONE", "Termine"), ("CANCELLED", "Annule")],
        default="PLANNED",
        verbose_name="Statut",
    )
    responsible = models.ForeignKey(
        "members.Membre",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="planned_activities",
        verbose_name="Responsable",
    )
    budget = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)], verbose_name="Budget prevu",
    )

    class Meta:
        verbose_name = "Plan annuel"
        verbose_name_plural = "Plans annuels"
        ordering = ["planned_date"]

    def __str__(self):
        return f"{self.title} ({self.year})"
