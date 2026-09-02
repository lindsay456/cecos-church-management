from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import ADMIN_ROLES, RoleBasedPermission
from apps.audit.services import audit_create
from apps.attendance.models import PresenceMembre, SessionCulte
from apps.attendance.serializers import PresenceMembreSerializer, SessionCulteSerializer
from apps.hierarchy.services import entities_in_scope


class SessionCulteViewSet(viewsets.ModelViewSet):
    serializer_class = SessionCulteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["church", "chapel", "service_type", "date"]
    search_fields = ["notes"]
    ordering_fields = ["date", "created_at"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES)]
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES, read_only=True)]

    def get_queryset(self):
        qs = SessionCulte.objects.select_related("church", "chapel", "leader")
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
                first_church = EntiteHierarchique.objects.filter(is_active=True).first()
                if first_church:
                    kwargs["church"] = first_church
        instance = serializer.save(**kwargs)
        audit_create(instance, user=self.request.user, request=self.request)

    @action(detail=True, methods=["get", "post"])
    def presences(self, request, pk=None):
        session = self.get_object()
        if request.method == "GET":
            presences = session.presences.all()
            return Response(PresenceMembreSerializer(presences, many=True).data)
        serializer = PresenceMembreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(session=session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        qs = self.get_queryset()
        from django.utils import timezone

        year = request.query_params.get("year", timezone.now().year)
        stats = qs.filter(date__year=year).aggregate(
            total_sessions=Count("id"),
            total_men=Count("id"),  # Simplified — for real stats use aggregation
        )
        return Response(stats)
