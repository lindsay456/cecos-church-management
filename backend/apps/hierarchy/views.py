"""Vues de la hiérarchie et endpoint arbre."""
from __future__ import annotations

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import ADMIN_ROLES, RoleBasedPermission
from apps.audit.services import audit_create, audit_update
from apps.common.enums import UserRole
from apps.hierarchy.models import EntiteHierarchique
from apps.hierarchy.serializers import (
    EntityBriefSerializer,
    EntitySerializer,
    EntityTreeSerializer,
)
from apps.hierarchy.services import entities_in_scope


class EntiteHierarchiqueViewSet(viewsets.ModelViewSet):
    """CRUD sécurisé des entités hiérarchiques (églises, Fédérations, etc.)."""

    queryset = EntiteHierarchique.objects.select_related("parent", "responsible").all()
    serializer_class = EntitySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        "denomination",
        "entity_type",
        "country",
        "continent",
        "is_active",
        "parent",
    ]
    search_fields = ["name", "code", "country", "address"]
    ordering_fields = ["name", "code", "created_at"]

    def get_permissions(self):
        admin_roles = ADMIN_ROLES
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [RoleBasedPermission(allowed_roles=admin_roles)]
        return [RoleBasedPermission(allowed_roles=admin_roles, read_only=True)]

    def get_queryset(self):
        qs = super().get_queryset()
        scope = entities_in_scope(self.request.user)
        if scope is not None:
            qs = qs.filter(id__in=scope.values_list("id", flat=True))
        return qs

    def perform_create(self, serializer):
        instance = serializer.save()
        audit_create(instance, user=self.request.user, request=self.request)

    def perform_update(self, serializer):
        old = serializer.instance
        old_values = {
            "name": old.name,
            "parent": old.parent_id,
            "is_active": old.is_active,
            "denomination": old.denomination,
            "entity_type": old.entity_type,
        }
        instance = serializer.save()
        audit_update(instance, user=self.request.user, request=self.request, old_values=old_values)

    def perform_destroy(self, instance):
        instance.soft_delete()
        audit_update(
            instance,
            user=self.request.user,
            request=self.request,
            old_values={"is_active": True},
            extra={"is_active": False},
            reason="Désactivation logique",
        )

    @action(detail=False, methods=["get"], url_path="tree")
    def tree(self, request):
        """GET /api/v1/hierarchy/tree/ — arborescence complète."""
        scope = entities_in_scope(request.user)
        roots = (
            scope.filter(parent__isnull=True, is_active=True)
            if scope is not None
            else self.get_queryset().filter(parent__isnull=True, is_active=True)
        )
        serializer = EntityTreeSerializer(roots, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def map(self, request):
        """Entités avec coordonnées GPS pour la cartographie."""
        scope = entities_in_scope(request.user)
        qs = self.get_queryset() if scope is None else scope
        qs = qs.filter(gps_lat__isnull=False, gps_lng__isnull=False, is_active=True)
        return Response(EntityBriefSerializer(qs, many=True, context={"request": request}).data)
