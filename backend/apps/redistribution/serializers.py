from rest_framework import serializers

from apps.redistribution.models import (
    FondsAffecte,
    LigneReversement,
    Redistribution,
    RegleReversement,
)


class FondsAffecteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FondsAffecte
        fields = ["id", "name", "code", "description", "is_active"]


class LigneReversementSerializer(serializers.ModelSerializer):
    target_entity_name = serializers.CharField(source="target_entity.name", read_only=True)
    designated_fund_name = serializers.CharField(source="designated_fund.name", read_only=True)

    class Meta:
        model = LigneReversement
        fields = [
            "id", "rule", "destination_type", "target_entity_type", "target_entity",
            "target_entity_name", "designated_fund", "designated_fund_name",
            "percentage", "calculation_order", "notes",
        ]


class RegleReversementListSerializer(serializers.ModelSerializer):
    total_percentage = serializers.DecimalField(max_digits=6, decimal_places=2, read_only=True)
    denomination_display = serializers.CharField(source="get_denomination_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = RegleReversement
        fields = [
            "id", "name", "denomination", "denomination_display", "source_entity_type",
            "donation_type", "version", "effective_start_date", "effective_end_date",
            "status", "status_display", "is_complete", "total_percentage", "created_at",
        ]


class RegleReversementDetailSerializer(RegleReversementListSerializer):
    lines = LigneReversementSerializer(many=True, read_only=True)

    class Meta(RegleReversementListSerializer.Meta):
        fields = RegleReversementListSerializer.Meta.fields + [
            "created_by", "approved_by", "notes", "lines",
        ]


class RedistributionSerializer(serializers.ModelSerializer):
    donation_number = serializers.CharField(source="donation.donation_number", read_only=True)
    rule_name = serializers.CharField(source="rule_version.name", read_only=True)
    source_entity_name = serializers.CharField(source="source_entity.name", read_only=True)
    destination_entity_name = serializers.CharField(source="destination_entity.name", read_only=True)
    designated_fund_name = serializers.CharField(source="designated_fund.name", read_only=True)

    class Meta:
        model = Redistribution
        fields = [
            "id", "donation", "donation_number", "rule_version", "rule_name",
            "source_entity", "source_entity_name", "destination_type",
            "destination_entity", "destination_entity_name",
            "designated_fund", "designated_fund_name",
            "received_amount", "applied_percentage", "retained_amount",
            "transferred_amount", "calculation_date", "status", "notes",
        ]
