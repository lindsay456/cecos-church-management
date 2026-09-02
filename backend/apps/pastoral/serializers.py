from rest_framework import serializers

from apps.pastoral.models import SuiviPastoral


class SuiviPastoralListSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.full_name", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.full_name", read_only=True)
    church_name = serializers.CharField(source="church.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    action_type_display = serializers.CharField(source="get_action_type_display", read_only=True)

    class Meta:
        model = SuiviPastoral
        fields = [
            "id", "member", "member_name", "assigned_to", "assigned_to_name",
            "church", "church_name", "reason", "action_type", "action_type_display",
            "action_date", "next_action_date", "status", "status_display",
            "confidentiality_level", "created_at",
        ]
        extra_kwargs = {"church": {"required": False, "allow_null": True}}
        read_only_fields = ["created_at"]


class SuiviPastoralDetailSerializer(SuiviPastoralListSerializer):
    class Meta(SuiviPastoralListSerializer.Meta):
        fields = SuiviPastoralListSerializer.Meta.fields + [
            "details", "notes", "created_by", "closed_by", "closed_at", "updated_at",
        ]
