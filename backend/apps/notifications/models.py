from django.db import models

from apps.common.enums import NotificationChannel, NotificationStatus, NotificationType
from apps.common.models import TimeStampedModel


class Notification(TimeStampedModel):
    recipient_user = models.ForeignKey(
        "accounts.User", null=True, blank=True, on_delete=models.CASCADE, related_name="notifications"
    )
    recipient_member = models.ForeignKey(
        "members.Membre", null=True, blank=True, on_delete=models.CASCADE, related_name="notifications"
    )
    channel = models.CharField(max_length=15, choices=NotificationChannel.choices)
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    related_object_type = models.CharField(max_length=100, null=True, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=15, choices=NotificationStatus.choices, default=NotificationStatus.PENDING
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.channel}] {self.subject}"
