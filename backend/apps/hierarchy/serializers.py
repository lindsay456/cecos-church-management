"""Sérialiseurs de la hiérarchie."""
from __future__ import annotations

from rest_framework import serializers

from apps.hierarchy.models import EntiteHierarchique, validate_entity_coherence


class EntityBriefSerializer(serializers.ModelSerializer):
    entity_type_display = serializers.CharField(source="get_entity_type_display", read_only=True)
    denomination_display = serializers.CharField(source="get_denomination_display", read_only=True)

    class Meta:
        model = EntiteHierarchique
        fields = [
            "id",
            "name",
            "code",
            "entity_type",
            "entity_type_display",
            "denomination",
            "denomination_display",
            "parent",
            "country",
            "continent",
            "is_active",
        ]


class EntitySerializer(serializers.ModelSerializer):
    entity_type_display = serializers.CharField(source="get_entity_type_display", read_only=True)
    denomination_display = serializers.CharField(source="get_denomination_display", read_only=True)
    responsible_name = serializers.CharField(source="responsible.full_name", read_only=True)
    children_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = EntiteHierarchique
        fields = [
            "id",
            "name",
            "code",
            "entity_type",
            "entity_type_display",
            "parent",
            "denomination",
            "denomination_display",
            "responsible",
            "responsible_name",
            "country",
            "continent",
            "address",
            "phone",
            "email",
            "gps_lat",
            "gps_lng",
            "is_active",
            "created_at",
            "updated_at",
            "children_count",
        ]
        read_only_fields = ["created_at", "updated_at", "children_count"]

    def validate(self, attrs):
        instance = self.instance
        entity_type = attrs.get("entity_type", instance.entity_type if instance else None)
        denomination = attrs.get("denomination", instance.denomination if instance else None)
        parent = attrs.get("parent", instance.parent if instance else None)
        provisional = EntiteHierarchique(
            entity_type=entity_type, denomination=denomination, parent=parent
        )
        validate_entity_coherence(provisional)
        if parent is not None and instance is not None:
            # Vérification anti-cycle : le parent ne doit pas être un descendant.
            from apps.hierarchy.services import _descendant_ids

            if instance.id in _descendant_ids(parent.id):
                raise serializers.ValidationError(
                    {"parent": "Le parent choisi créerait une boucle hiérarchique."}
                )
        return attrs


class EntityTreeSerializer(serializers.Serializer):
    """Arbre imbriqué : une entité et ses enfants récursivement."""

    id = serializers.IntegerField()
    name = serializers.CharField()
    code = serializers.CharField()
    entity_type = serializers.CharField()
    entity_type_display = serializers.CharField()
    denomination = serializers.CharField()
    country = serializers.CharField()
    continent = serializers.CharField()
    gps_lat = serializers.DecimalField(max_digits=9, decimal_places=6, allow_null=True)
    gps_lng = serializers.DecimalField(max_digits=9, decimal_places=6, allow_null=True)
    responsible_name = serializers.CharField(source="responsible.full_name", allow_null=True)
    children = serializers.SerializerMethodField()

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by("name")
        return EntityTreeSerializer(children, many=True, context=self.context).data
