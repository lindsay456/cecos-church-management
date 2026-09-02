"""Modèles financiers : catégories, recettes, dépenses, budgets."""
from __future__ import annotations

from django.core.validators import MinValueValidator
from django.db import models

from apps.common.enums import (
    BudgetStatus,
    CategoryType,
    FinancialStatus,
    PaymentMethod,
)
from apps.common.models import TimeStampedModel


class CategorieFinanciere(TimeStampedModel):
    name = models.CharField(max_length=128, verbose_name="Nom")
    code = models.CharField(max_length=50, unique=True, verbose_name="Code")
    category_type = models.CharField(max_length=10, choices=CategoryType.choices, verbose_name="Type")
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="financial_categories",
        verbose_name="Église (null = global)",
    )
    is_active = models.BooleanField(default=True, verbose_name="Actif")

    class Meta:
        verbose_name = "Catégorie financière"
        verbose_name_plural = "Catégories financières"
        ordering = ["category_type", "name"]

    def __str__(self):
        return f"{self.get_category_type_display()} — {self.name}"


class Recette(TimeStampedModel):
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.PROTECT,
        related_name="recettes",
        verbose_name="Église",
    )
    department = models.ForeignKey(
        "departments.Departement",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="recettes",
        verbose_name="Département",
    )
    category = models.ForeignKey(
        CategorieFinanciere,
        on_delete=models.PROTECT,
        related_name="recettes",
        verbose_name="Catégorie",
    )
    amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name="Montant",
    )
    date = models.DateField(verbose_name="Date")
    source = models.CharField(max_length=255, blank=True, verbose_name="Source")
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH, verbose_name="Mode de paiement"
    )
    reference = models.CharField(max_length=100, blank=True, verbose_name="Référence")
    description = models.TextField(blank=True, verbose_name="Description")
    status = models.CharField(
        max_length=20, choices=FinancialStatus.choices,
        default=FinancialStatus.DRAFT, verbose_name="Statut",
    )
    created_by = models.ForeignKey(
        "accounts.User",
        null=True,
        on_delete=models.SET_NULL,
        related_name="created_recettes",
        verbose_name="Créé par",
    )
    approved_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_recettes",
        verbose_name="Approuvé par",
    )
    attachment = models.FileField(upload_to="finance/recettes/", blank=True, null=True)

    class Meta:
        verbose_name = "Recette"
        verbose_name_plural = "Recettes"
        ordering = ["-date"]

    def __str__(self):
        return f"Recette {self.amount} — {self.date}"


class Depense(TimeStampedModel):
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.PROTECT,
        related_name="depenses",
        verbose_name="Église",
    )
    department = models.ForeignKey(
        "departments.Departement",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="depenses",
        verbose_name="Département",
    )
    category = models.ForeignKey(
        CategorieFinanciere,
        on_delete=models.PROTECT,
        related_name="depenses",
        verbose_name="Catégorie",
    )
    amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name="Montant",
    )
    date = models.DateField(verbose_name="Date")
    beneficiary = models.CharField(max_length=255, blank=True, verbose_name="Bénéficiaire")
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH, verbose_name="Mode de paiement"
    )
    reference = models.CharField(max_length=100, blank=True, verbose_name="Référence")
    description = models.TextField(blank=True, verbose_name="Description")
    status = models.CharField(
        max_length=20, choices=FinancialStatus.choices,
        default=FinancialStatus.DRAFT, verbose_name="Statut",
    )
    created_by = models.ForeignKey(
        "accounts.User",
        null=True,
        on_delete=models.SET_NULL,
        related_name="created_depenses",
        verbose_name="Créé par",
    )
    approved_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_depenses",
        verbose_name="Approuvé par",
    )
    attachment = models.FileField(upload_to="finance/depenses/", blank=True, null=True)

    class Meta:
        verbose_name = "Dépense"
        verbose_name_plural = "Dépenses"
        ordering = ["-date"]

    def __str__(self):
        return f"Dépense {self.amount} — {self.date}"


class Budget(TimeStampedModel):
    church = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.PROTECT,
        related_name="budgets",
        verbose_name="Église",
    )
    department = models.ForeignKey(
        "departments.Departement",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="budgets",
        verbose_name="Département",
    )
    fiscal_year = models.PositiveIntegerField(verbose_name="Exercice fiscal")
    name = models.CharField(max_length=255, verbose_name="Nom")
    status = models.CharField(
        max_length=20, choices=BudgetStatus.choices,
        default=BudgetStatus.DRAFT, verbose_name="Statut",
    )
    created_by = models.ForeignKey(
        "accounts.User",
        null=True,
        on_delete=models.SET_NULL,
        related_name="created_budgets",
    )
    approved_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_budgets",
    )

    class Meta:
        verbose_name = "Budget"
        verbose_name_plural = "Budgets"
        unique_together = ["church", "department", "fiscal_year"]

    def __str__(self):
        return f"{self.name} ({self.fiscal_year})"

    @property
    def total_planned(self):
        return self.lines.aggregate(total=models.Sum("planned_amount"))["total"] or 0


class LigneBudget(TimeStampedModel):
    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name="lines",
        verbose_name="Budget",
    )
    category = models.ForeignKey(
        CategorieFinanciere,
        on_delete=models.PROTECT,
        related_name="budget_lines",
        verbose_name="Catégorie",
    )
    planned_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Montant prévu",
    )
    notes = models.TextField(blank=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Ligne budgétaire"
        verbose_name_plural = "Lignes budgétaires"
        unique_together = ["budget", "category"]

    def __str__(self):
        return f"{self.category.name} : {self.planned_amount}"


class Justificatif(TimeStampedModel):
    recette = models.ForeignKey(
        Recette,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="justificatifs",
        verbose_name="Recette",
    )
    depense = models.ForeignKey(
        Depense,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="justificatifs",
        verbose_name="Dépense",
    )
    file = models.FileField(upload_to="finance/justificatifs/", verbose_name="Fichier")
    description = models.CharField(max_length=255, blank=True, verbose_name="Description")

    class Meta:
        verbose_name = "Justificatif"

    def __str__(self):
        return self.description or f"Justificatif {self.pk}"


class ValidationFinanciere(TimeStampedModel):
    recette = models.ForeignKey(
        Recette,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="validations",
    )
    depense = models.ForeignKey(
        Depense,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="validations",
    )
    validated_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.PROTECT,
        related_name="financial_validations",
    )
    decision = models.CharField(
        max_length=20, choices=[("APPROVED", "Approuvé"), ("REJECTED", "Rejeté")],
        verbose_name="Décision",
    )
    reason = models.CharField(max_length=500, blank=True, verbose_name="Motif")
    validated_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, verbose_name="Notes")

    class Meta:
        verbose_name = "Validation financière"
