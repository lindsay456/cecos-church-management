from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from apps.accounts.permissions import ADMIN_ROLES, RoleBasedPermission
from apps.audit.services import audit_create, audit_update
from apps.families.models import Famille
from apps.families.serializers import FamilleDetailSerializer, FamilleListSerializer
from apps.hierarchy.services import entities_in_scope


class FamilleViewSet(viewsets.ModelViewSet):
    serializer_class = FamilleListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["church", "status"]
    search_fields = ["name", "family_code", "main_phone", "main_email"]
    ordering_fields = ["name", "created_at"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES)]
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES, read_only=True)]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return FamilleDetailSerializer
        return FamilleListSerializer

    def get_queryset(self):
        qs = Famille.objects.select_related("church", "household_head").annotate(
            members_count=Count("members", filter=Q(members__is_active=True))
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
                first_church = EntiteHierarchique.objects.filter(is_active=True).first()
                if first_church:
                    kwargs["church"] = first_church
        instance = serializer.save(**kwargs)
        audit_create(instance, user=self.request.user, request=self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit_update(instance, user=self.request.user, request=self.request)

    def perform_destroy(self, instance):
        if instance.members.filter(is_active=True).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Impossible de supprimer une famille contenant des membres actifs.")
        instance.delete()
