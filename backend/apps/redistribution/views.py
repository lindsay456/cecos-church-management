from django.db.models import Sum
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import ADMIN_ROLES, RoleBasedPermission
from apps.common.enums import UserRole
from apps.hierarchy.services import entities_in_scope
from apps.redistribution.models import FondsAffecte, Redistribution, RegleReversement
from apps.redistribution.serializers import (
    FondsAffecteSerializer,
    RedistributionSerializer,
    RegleReversementDetailSerializer,
    RegleReversementListSerializer,
)


class FondsAffecteViewSet(viewsets.ModelViewSet):
    serializer_class = FondsAffecteSerializer
    filterset_fields = ["is_active"]
    search_fields = ["name", "code"]

    def get_permissions(self):
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES + [UserRole.TREASURER])]

    def get_queryset(self):
        return FondsAffecte.objects.all()


class RegleReversementViewSet(viewsets.ModelViewSet):
    serializer_class = RegleReversementListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["denomination", "donation_type", "source_entity_type", "status"]
    search_fields = ["name"]
    ordering_fields = ["effective_start_date", "version", "created_at"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [RoleBasedPermission(allowed_roles=[UserRole.SUPER_ADMIN])]
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES + [UserRole.TREASURER])]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return RegleReversementDetailSerializer
        return RegleReversementListSerializer

    def get_queryset(self):
        return RegleReversement.objects.prefetch_related("lines").all()

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        rule = self.get_object()
        if rule.status == "ACTIVE":
            return Response({"detail": "La règle est déjà active."}, status=400)
        rule.status = "ACTIVE"
        rule.save(update_fields=["status", "updated_at"])
        return Response({"detail": "Règle activée."})

    @action(detail=True, methods=["get"])
    def validate_total(self, request, pk=None):
        rule = self.get_object()
        total = rule.total_percentage
        return Response({"total_percentage": str(total), "is_complete": total == 100})


class RedistributionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RedistributionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["donation", "source_entity", "destination_type", "status"]
    ordering_fields = ["calculation_date", "transferred_amount"]

    def get_permissions(self):
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES + [UserRole.TREASURER, UserRole.AUDITOR])]

    def get_queryset(self):
        qs = Redistribution.objects.select_related(
            "donation", "rule_version", "source_entity", "destination_entity", "designated_fund"
        )
        user = self.request.user
        if user.is_super_admin or user.role == UserRole.AUDITOR:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(source_entity_id__in=scope.values_list("id", flat=True))

    @action(detail=False, methods=["get"])
    def summary(self, request):
        qs = self.get_queryset()
        total = qs.aggregate(
            total_received=Sum("received_amount"),
            total_transferred=Sum("transferred_amount"),
        )
        return Response(total)
