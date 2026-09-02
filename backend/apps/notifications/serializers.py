from rest_framework import serializers
from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source="get_notification_type_display", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id", "recipient_user", "channel", "notification_type",
            "notification_type_display", "subject", "message",
            "related_object_type", "related_object_id", "status",
            "sent_at", "created_at",
        ]
        read_only_fields = ["sent_at", "created_at"]
