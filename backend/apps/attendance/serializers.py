from rest_framework import serializers

from apps.attendance.models import PresenceMembre, SessionCulte


class SessionCulteSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    chapel_name = serializers.CharField(source="chapel.name", read_only=True, default="")
    leader_name = serializers.CharField(source="leader.full_name", read_only=True)
    total_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = SessionCulte
        fields = [
            "id", "church", "church_name", "chapel", "chapel_name", "service_type", "date",
            "leader", "leader_name", "men_count", "women_count",
            "children_count", "visitors_count", "total_count", "notes",
            "created_at",
        ]
        extra_kwargs = {"church": {"required": False, "allow_null": True}}


class PresenceMembreSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.full_name", read_only=True)
    member_number = serializers.CharField(source="member.member_number", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = PresenceMembre
        fields = [
            "id", "session", "member", "member_name", "member_number",
            "status", "status_display", "check_in_time", "notes",
        ]
