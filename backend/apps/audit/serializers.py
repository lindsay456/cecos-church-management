from rest_framework import serializers

from apps.audit.models import JournalAudit


class JournalAuditSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = JournalAudit
        fields = [
            "id",
            "user",
            "user_full_name",
            "action",
            "app_label",
            "model_name",
            "object_id",
            "object_repr",
            "old_values",
            "new_values",
            "reason",
            "ip_address",
            "user_agent",
            "created_at",
        ]
        read_only_fields = fields
