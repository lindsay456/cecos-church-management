from rest_framework import serializers

from apps.families.models import Famille
from apps.members.serializers import MembreListSerializer


class FamilleListSerializer(serializers.ModelSerializer):
    members_count = serializers.IntegerField(read_only=True)
    church_name = serializers.CharField(source="church.name", read_only=True)
    household_head_name = serializers.CharField(source="household_head.full_name", read_only=True)

    class Meta:
        model = Famille
        fields = [
            "id", "family_code", "name", "church", "church_name",
            "address", "main_phone", "main_email",
            "household_head", "household_head_name",
            "status", "members_count", "created_at",
        ]
        extra_kwargs = {"family_code": {"required": False}, "church": {"required": False, "allow_null": True}}


class FamilleDetailSerializer(FamilleListSerializer):
    members = serializers.SerializerMethodField()

    class Meta(FamilleListSerializer.Meta):
        fields = FamilleListSerializer.Meta.fields + ["notes", "members", "updated_at"]

    def get_members(self, obj):
        return MembreListSerializer(
            obj.members.filter(is_active=True), many=True, context=self.context
        ).data
