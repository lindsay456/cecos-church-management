from rest_framework import serializers

from apps.visitors.models import Visiteur


class VisiteurListSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    invited_by_name = serializers.CharField(source="invited_by.full_name", read_only=True)
    full_name = serializers.CharField(read_only=True)
    follow_up_status_display = serializers.CharField(source="get_follow_up_status_display", read_only=True)

    class Meta:
        model = Visiteur
        fields = [
            "id", "full_name", "first_name", "last_name", "phone", "email",
            "church", "church_name", "first_visit_date", "invited_by",
            "invited_by_name", "wants_follow_up", "consent_contact",
            "follow_up_status", "follow_up_status_display", "created_at",
        ]
        extra_kwargs = {"church": {"required": False, "allow_null": True}}


class VisiteurDetailSerializer(VisiteurListSerializer):
    class Meta(VisiteurListSerializer.Meta):
        fields = VisiteurListSerializer.Meta.fields + [
            "reason_for_visit", "notes", "updated_at",
        ]
