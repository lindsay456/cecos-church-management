from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import ADMIN_ROLES, RoleBasedPermission
from apps.audit.services import audit_create, audit_update
from apps.events.models import Evenement, ParticipantEvenement
from apps.events.serializers import (
    EvenementDetailSerializer,
    EvenementListSerializer,
    ParticipantEvenementSerializer,
)
from apps.hierarchy.services import entities_in_scope


class EvenementViewSet(viewsets.ModelViewSet):
    serializer_class = EvenementListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["church", "department", "event_type", "status"]
    search_fields = ["title", "description", "location"]
    ordering_fields = ["start_datetime", "created_at"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES)]
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES, read_only=True)]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return EvenementDetailSerializer
        return EvenementListSerializer

    def get_queryset(self):
        qs = Evenement.objects.select_related("church", "department", "organizer").annotate(
            participants_count=Count("participants")
        )
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(church_id__in=scope.values_list("id", flat=True))

    def perform_create(self, serializer):
        kwargs = {}
        if not serializer.validated_data.get("church"):
            user = self.request.user
            if hasattr(user, "entity") and user.entity:
                kwargs["church"] = user.entity
            else:
                from apps.hierarchy.models import EntiteHierarchique
                first = EntiteHierarchique.objects.filter(is_active=True).first()
                if first:
                    kwargs["church"] = first
        instance = serializer.save(**kwargs)
        audit_create(instance, user=self.request.user, request=self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit_update(instance, user=self.request.user, request=self.request)

    def perform_destroy(self, instance):
        instance.soft_delete() if hasattr(instance, "soft_delete") else instance.delete()

    @action(detail=True, methods=["get", "post"])
    def participants(self, request, pk=None):
        event = self.get_object()
        if request.method == "GET":
            participants = event.participants.all()
            serializer = ParticipantEvenementSerializer(participants, many=True)
            return Response(serializer.data)
        serializer = ParticipantEvenementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(event=event)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=["get"], url_path="calendar")
    def calendar(self, request, pk=None):
        event = self.get_object()
        data = {
            "id": event.id,
            "title": event.title,
            "start": event.start_datetime.isoformat(),
            "end": event.end_datetime.isoformat(),
            "location": event.location,
            "status": event.status,
        }
        return Response(data)
