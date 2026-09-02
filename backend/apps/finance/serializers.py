from rest_framework import serializers

from apps.finance.models import (
    Budget,
    CategorieFinanciere,
    Depense,
    LigneBudget,
    Recette,
)


class CategorieFinanciereSerializer(serializers.ModelSerializer):
    category_type_display = serializers.CharField(source="get_category_type_display", read_only=True)

    class Meta:
        model = CategorieFinanciere
        fields = ["id", "name", "code", "category_type", "category_type_display", "church", "is_active"]


class RecetteSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.full_name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Recette
        fields = [
            "id", "church", "church_name", "department", "category", "category_name",
            "amount", "date", "source", "payment_method", "reference",
            "description", "status", "status_display",
            "created_by", "created_by_name", "approved_by", "approved_by_name",
            "attachment", "created_at",
        ]
        extra_kwargs = {"church": {"required": False, "allow_null": True}, "date": {"required": False}}
        read_only_fields = ["created_by", "created_at"]

    def validate(self, attrs):
        if self.instance and self.instance.status in ("APPROVED", "CANCELLED"):
            raise serializers.ValidationError("Une opération validée ou annulée ne peut pas être modifiée.")
        return attrs


class DepenseSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.full_name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Depense
        fields = [
            "id", "church", "church_name", "department", "category", "category_name",
            "amount", "date", "beneficiary", "payment_method", "reference",
            "description", "status", "status_display",
            "created_by", "created_by_name", "approved_by", "approved_by_name",
            "attachment", "created_at",
        ]
        extra_kwargs = {"church": {"required": False, "allow_null": True}, "date": {"required": False}}
        read_only_fields = ["created_by", "created_at"]

    def validate(self, attrs):
        if self.instance and self.instance.status in ("APPROVED", "CANCELLED"):
            raise serializers.ValidationError("Une opération validée ou annulée ne peut pas être modifiée.")
        return attrs


class BudgetSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    total_planned = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Budget
        fields = [
            "id", "church", "church_name", "department", "fiscal_year",
            "name", "status", "total_planned", "created_by", "created_at",
        ]
        extra_kwargs = {"church": {"required": False, "allow_null": True}}
        read_only_fields = ["created_by", "created_at"]


class LigneBudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = LigneBudget
        fields = ["id", "budget", "category", "category_name", "planned_amount", "notes"]
