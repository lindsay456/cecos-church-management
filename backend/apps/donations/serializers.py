from rest_framework import serializers

from apps.donations.models import Don, Recu


class RecuSerializer(serializers.ModelSerializer):
    receipt_number = serializers.CharField(read_only=True)

    class Meta:
        model = Recu
        fields = [
            "id", "receipt_number", "donation", "issued_at",
            "sent_by_email", "sent_by_whatsapp", "sent_at", "status",
        ]


class DonListSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.full_name", read_only=True)
    church_name = serializers.CharField(source="church.name", read_only=True)
    donation_type_display = serializers.CharField(source="get_donation_type_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    recorded_by_name = serializers.CharField(source="recorded_by.full_name", read_only=True)

    class Meta:
        model = Don
        fields = [
            "id", "donation_number", "member", "member_name", "church", "church_name",
            "donation_type", "donation_type_display", "amount", "donation_date",
            "payment_method", "status", "status_display",
            "recorded_by", "recorded_by_name", "notes", "created_at",
        ]
        read_only_fields = ["donation_number"]
        extra_kwargs = {"church": {"required": False, "allow_null": True}}


class DonDetailSerializer(DonListSerializer):
    receipt = RecuSerializer(read_only=True)

    class Meta(DonListSerializer.Meta):
        fields = DonListSerializer.Meta.fields + [
            "reference", "validated_by", "validated_at", "notes",
            "cancellation_reason", "cancelled_by", "cancelled_at", "receipt",
        ]
