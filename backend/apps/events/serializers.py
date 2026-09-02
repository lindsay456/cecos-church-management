from rest_framework import serializers

from apps.events.models import Evenement, ParticipantEvenement


class EvenementListSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    event_type_display = serializers.CharField(source="get_event_type_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    participants_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Evenement
        fields = [
            "id", "title", "event_type", "event_type_display", "church", "church_name",
            "department", "start_datetime", "end_datetime", "location", "status",
            "status_display", "expected_budget", "participants_count", "created_at",
        ]
        extra_kwargs = {"church": {"required": False, "allow_null": True}}


class EvenementDetailSerializer(EvenementListSerializer):
    class Meta(EvenementListSerializer.Meta):
        fields = EvenementListSerializer.Meta.fields + [
            "description", "organizer", "president_or_leader",
            "actual_budget", "attachment", "updated_at",
        ]


class ParticipantEvenementSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.full_name", read_only=True)
    visitor_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ParticipantEvenement
        fields = [
            "id", "event", "member", "member_name", "visitor", "visitor_name",
            "status", "status_display", "registered_at", "attendance_time", "notes",
        ]

    def get_visitor_name(self, obj):
        if obj.visitor:
            return obj.visitor.full_name
        return None
