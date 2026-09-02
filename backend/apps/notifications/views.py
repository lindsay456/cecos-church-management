from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    filterset_fields = ["channel", "notification_type", "status"]

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Notification.objects.all()
        user = self.request.user
        if user.is_superuser or user.role == "SUPER_ADMIN":
            return qs
        return qs.filter(recipient_user=user)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.status = "READ"
        notif.save(update_fields=["status"])
        return Response({"detail": "Marquée comme lue."})

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        updated = Notification.objects.filter(
            recipient_user=request.user, status="PENDING"
        ).update(status="READ", sent_at=timezone.now())
        return Response({"detail": f"{updated} notifications marquées comme lues.", "count": updated})

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = Notification.objects.filter(
            recipient_user=request.user, status="PENDING"
        ).count()
        return Response({"count": count})
