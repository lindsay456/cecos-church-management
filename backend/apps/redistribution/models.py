from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.common.enums import (
    Denomination, DonationType, RedistributionStatus,
    RuleDestinationType, RuleStatus,
)
from apps.common.models import TimeStampedModel


class FondsAffecte(TimeStampedModel):
    name = models.CharField(max_length=128, verbose_name="Nom")
    code = models.CharField(max_length=50, unique=True, verbose_name="Code")
    description = models.TextField(blank=True, verbose_name="Description")
    is_active = models.BooleanField(default=True, verbose_name="Actif")

    class Meta:
        verbose_name = "Fonds affecté"
        verbose_name_plural = "Fonds affectés"

    def __str__(self):
        return f"{self.name} ({self.code})"


class RegleReversement(TimeStampedModel):
    name = models.CharField(max_length=255, verbose_name="Nom de la règle")
    denomination = models.CharField(max_length=30, choices=Denomination.choices)
    source_entity_type = models.CharField(max_length=40, verbose_name="Type d'entité source")
    donation_type = models.CharField(max_length=30, choices=DonationType.choices)
    version = models.PositiveIntegerField(default=1, verbose_name="Version")
    effective_start_date = models.DateField(verbose_name="Date de début d'effet")
    effective_end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=RuleStatus.choices, default=RuleStatus.DRAFT)
    is_complete = models.BooleanField(default=False)
    created_by = models.ForeignKey("accounts.User", null=True, on_delete=models.SET_NULL,
                                   related_name="created_redistribution_rules")
    approved_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL,
                                    related_name="approved_redistribution_rules")
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Règle de reversement"
        verbose_name_plural = "Règles de reversement"
        ordering = ["-effective_start_date", "-version"]
        unique_together = ["denomination", "source_entity_type", "donation_type", "version"]

    def __str__(self):
        return f"{self.name} v{self.version} ({self.denomination})"

    @property
    def total_percentage(self):
        from django.db.models import Sum
        return self.lines.aggregate(total=Sum("percentage"))["total"] or 0


class LigneReversement(TimeStampedModel):
    rule = models.ForeignKey(RegleReversement, on_delete=models.CASCADE, related_name="lines")
    destination_type = models.CharField(max_length=20, choices=RuleDestinationType.choices)
    target_entity_type = models.CharField(max_length=40, null=True, blank=True)
    target_entity = models.ForeignKey("hierarchy.EntiteHierarchique", null=True, blank=True,
                                      on_delete=models.SET_NULL)
    designated_fund = models.ForeignKey(FondsAffecte, null=True, blank=True, on_delete=models.SET_NULL)
    percentage = models.DecimalField(max_digits=6, decimal_places=2,
                                      validators=[MinValueValidator(0), MaxValueValidator(100)])
    calculation_order = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Ligne de reversement"
        ordering = ["calculation_order"]


class Redistribution(TimeStampedModel):
    donation = models.ForeignKey("donations.Don", on_delete=models.PROTECT, related_name="redistributions")
    rule_version = models.ForeignKey(RegleReversement, on_delete=models.PROTECT, related_name="redistributions")
    source_entity = models.ForeignKey("hierarchy.EntiteHierarchique", on_delete=models.PROTECT,
                                       related_name="outgoing_redistributions")
    destination_type = models.CharField(max_length=20, choices=RuleDestinationType.choices)
    destination_entity = models.ForeignKey("hierarchy.EntiteHierarchique", null=True, blank=True,
                                            on_delete=models.SET_NULL, related_name="incoming_redistributions")
    designated_fund = models.ForeignKey(FondsAffecte, null=True, blank=True, on_delete=models.SET_NULL)
    received_amount = models.DecimalField(max_digits=12, decimal_places=2)
    applied_percentage = models.DecimalField(max_digits=6, decimal_places=2)
    retained_amount = models.DecimalField(max_digits=12, decimal_places=2)
    transferred_amount = models.DecimalField(max_digits=12, decimal_places=2)
    calculation_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=RedistributionStatus.choices,
                               default=RedistributionStatus.COMPUTED)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Redistribution"
        verbose_name_plural = "Redistributions"
        ordering = ["-calculation_date"]
