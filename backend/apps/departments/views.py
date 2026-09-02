from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from apps.accounts.permissions import ADMIN_ROLES, RoleBasedPermission
from apps.audit.services import audit_create, audit_update
from apps.departments.models import Departement, MembreDepartement, PlanAnnuel
from apps.departments.serializers import (
    DepartementDetailSerializer,
    DepartementListSerializer,
    MembreDepartementSerializer,
    PlanAnnuelSerializer,
)
from apps.hierarchy.models import EntiteHierarchique
from apps.hierarchy.services import entities_in_scope


def _auto_church(serializer, user):
    if not serializer.validated_data.get("church"):
        if hasattr(user, "entity") and user.entity:
            return {"church": user.entity}
        first = EntiteHierarchique.objects.filter(is_active=True).first()
        if first:
            return {"church": first}
    return {}


class DepartementViewSet(viewsets.ModelViewSet):
    serializer_class = DepartementListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["church", "department_type", "is_active"]
    search_fields = ["name", "code"]
    ordering_fields = ["name", "created_at"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES)]
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES, read_only=True)]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return DepartementDetailSerializer
        return DepartementListSerializer

    def get_queryset(self):
        qs = Departement.objects.select_related("church", "leader").annotate(
            members_count=Count("memberships", filter=Q(memberships__is_active=True))
        )
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(church_id__in=scope.values_list("id", flat=True))

    def perform_create(self, serializer):
        instance = serializer.save(**_auto_church(serializer, self.request.user))
        audit_create(instance, user=self.request.user, request=self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit_update(instance, user=self.request.user, request=self.request)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])


class MembreDepartementViewSet(viewsets.ModelViewSet):
    serializer_class = MembreDepartementSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["department", "member", "year", "is_active"]

    def get_permissions(self):
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES)]

    def get_queryset(self):
        qs = MembreDepartement.objects.select_related("member", "department")
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(department__church_id__in=scope.values_list("id", flat=True))


class PlanAnnuelViewSet(viewsets.ModelViewSet):
    serializer_class = PlanAnnuelSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["department", "year", "status"]
    search_fields = ["title"]
    ordering_fields = ["planned_date", "year"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES)]
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES, read_only=True)]

    def get_queryset(self):
        qs = PlanAnnuel.objects.select_related("department", "responsible")
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(department__church_id__in=scope.values_list("id", flat=True))

    def perform_create(self, serializer):
        instance = serializer.save()
        audit_create(instance, user=self.request.user, request=self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit_update(instance, user=self.request.user, request=self.request)

    def perform_destroy(self, instance):
        instance.delete()
