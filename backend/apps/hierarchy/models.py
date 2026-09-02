"""Entité hiérarchique : églises, Fédérations, Unions, Divisions, etc."""
from __future__ import annotations

from django.core.exceptions import ValidationError
from django.db import models

from apps.common.enums import Denomination, EntityType
from apps.common.models import SoftDeleteModel, TimeStampedModel


class EntiteHierarchique(TimeStampedModel, SoftDeleteModel):
    """Nœud de l'arborescence hiérarchique des dénominations."""

    name = models.CharField(max_length=255, verbose_name="Nom")
    code = models.CharField(max_length=50, unique=True, verbose_name="Code")
    entity_type = models.CharField(max_length=40, choices=EntityType.choices, verbose_name="Type")
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="children",
        verbose_name="Entité parente",
    )
    denomination = models.CharField(
        max_length=30, choices=Denomination.choices, verbose_name="Dénomination"
    )
    responsible = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="responsible_entities",
        verbose_name="Responsable",
    )
    country = models.CharField(max_length=100, blank=True, verbose_name="Pays")
    city = models.CharField(max_length=128, blank=True, verbose_name="Ville")
    continent = models.CharField(max_length=50, blank=True, verbose_name="Continent")
    address = models.CharField(max_length=255, blank=True, verbose_name="Adresse")
    phone = models.CharField(max_length=30, blank=True, verbose_name="Téléphone")
    email = models.EmailField(blank=True, verbose_name="Email")
    gps_lat = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True, verbose_name="Latitude"
    )
    gps_lng = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True, verbose_name="Longitude"
    )

    class Meta:
        verbose_name = "Entité hiérarchique"
        verbose_name_plural = "Entités hiérarchiques"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["entity_type"]),
            models.Index(fields=["denomination"]),
            models.Index(fields=["parent"]),
        ]

    def __str__(self):
        return f"{self.get_entity_type_display()} — {self.name}"

    @property
    def is_local_church(self) -> bool:
        return self.entity_type in LOCAL_CHURCH_TYPES

    def clean(self):
        super().clean()
        validate_entity_coherence(self)

    def delete(self, *args, **kwargs):
        raise ValidationError(
            "Une entité hiérarchique ne peut pas être supprimée physiquement. "
            "Utilisez la désactivation logique (archivage)."
        )


# Types d'entités représentant des églises locales de culte
LOCAL_CHURCH_TYPES = [EntityType.LOCAL_CHURCH, EntityType.PARISH, EntityType.PROTESTANT_CHURCH]

# Denomination par type d'entité
DENOMINATION_BY_TYPE = {
    EntityType.GENERAL_CONFERENCE: Denomination.ADVENTIST,
    EntityType.DIVISION: Denomination.ADVENTIST,
    EntityType.UNION: Denomination.ADVENTIST,
    EntityType.FEDERATION: Denomination.ADVENTIST,
    EntityType.MISSION: Denomination.ADVENTIST,
    EntityType.LOCAL_CHURCH: Denomination.ADVENTIST,
    EntityType.DIOCESE: Denomination.CATHOLIC,
    EntityType.PARISH: Denomination.CATHOLIC,
    EntityType.PROTESTANT_UNION: Denomination.PROTESTANT,
    EntityType.PROTESTANT_CHURCH: Denomination.PROTESTANT,
}

# Parents autorisés par type d'entité
ALLOWED_PARENTS = {
    EntityType.GENERAL_CONFERENCE: [],
    EntityType.DIVISION: [EntityType.GENERAL_CONFERENCE],
    EntityType.UNION: [EntityType.DIVISION],
    EntityType.FEDERATION: [EntityType.UNION],
    EntityType.MISSION: [EntityType.UNION],
    EntityType.LOCAL_CHURCH: [EntityType.FEDERATION, EntityType.MISSION],
    EntityType.DIOCESE: [],
    EntityType.PARISH: [EntityType.DIOCESE],
    EntityType.PROTESTANT_UNION: [],
    EntityType.PROTESTANT_CHURCH: [EntityType.PROTESTANT_UNION],
}


def validate_entity_coherence(entity) -> None:
    """Vérifie la cohérence du rattachement parent/enfant et de la dénomination."""
    errors = []
    expected_denomination = DENOMINATION_BY_TYPE.get(entity.entity_type)
    if expected_denomination is not None and entity.denomination != expected_denomination:
        errors.append(
            f"L'entité de type {entity.get_entity_type_display()} doit appartenir "
            f"à la dénomination {expected_denomination.label}."
        )

    if entity.parent is not None:
        allowed = ALLOWED_PARENTS.get(entity.entity_type, [])
        if entity.parent.entity_type not in allowed:
            errors.append(
                f"Une entité {entity.get_entity_type_display()} ne peut pas être rattachée "
                f"à une entité de type {entity.parent.get_entity_type_display()}."
            )
        if entity.parent.denomination != entity.denomination:
            errors.append("Parent et enfant doivent appartenir à la même dénomination.")
        if entity.parent_id == entity.id:
            errors.append("Une entité ne peut pas être son propre parent.")

    if errors:
        raise ValidationError(errors)
