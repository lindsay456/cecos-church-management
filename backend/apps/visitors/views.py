from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from apps.accounts.permissions import ADMIN_ROLES, RoleBasedPermission
from apps.audit.services import audit_create, audit_update
from apps.hierarchy.services import entities_in_scope
from apps.visitors.models import Visiteur
from apps.visitors.serializers import VisiteurDetailSerializer, VisiteurListSerializer


class VisiteurViewSet(viewsets.ModelViewSet):
    serializer_class = VisiteurListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["church", "follow_up_status", "wants_follow_up"]
    search_fields = ["first_name", "last_name", "phone", "email"]
    ordering_fields = ["first_visit_date", "created_at"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES)]
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES, read_only=True)]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return VisiteurDetailSerializer
        return VisiteurListSerializer

    def get_queryset(self):
        qs = Visiteur.objects.select_related("church", "invited_by")
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
