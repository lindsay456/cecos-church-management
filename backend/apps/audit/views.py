from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from apps.accounts.permissions import IsAuditorOrSuperAdmin, RoleBasedPermission
from apps.audit.models import JournalAudit
from apps.audit.serializers import JournalAuditSerializer
from apps.common.enums import UserRole


class JournalAuditViewSet(viewsets.ReadOnlyModelViewSet):
    """Journal d'audit : lecture seule (append-only), réservé aux auditeurs et admins."""

    queryset = JournalAudit.objects.select_related("user").all()
    serializer_class = JournalAuditSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["action", "app_label", "model_name", "object_id", "user", "created_at"]
    search_fields = ["object_repr", "reason", "app_label", "model_name"]
    ordering_fields = ["created_at", "action"]

    def get_permissions(self):
        return [
            RoleBasedPermission(
                allowed_roles=[
                    UserRole.SUPER_ADMIN,
                    UserRole.DIVISION_ADMIN,
                    UserRole.UNION_ADMIN,
                    UserRole.FEDERATION_ADMIN,
                    UserRole.AUDITOR,
                ]
            )
        ] if hasattr(self, "request") else [IsAuditorOrSuperAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == UserRole.SUPER_ADMIN:
            return qs
        from apps.hierarchy.services import entities_in_scope

        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        entity_ids = list(scope.values_list("id", flat=True))
        # Les logs des utilisateurs du périmètre, ou portant sur des objets du périmètre
        return qs.filter(
            user__entity_id__in=entity_ids,
        ).distinct()
