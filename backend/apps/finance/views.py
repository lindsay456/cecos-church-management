"""Vues financières : recettes, dépenses, budgets, catégories."""
from __future__ import annotations

from django.db import models, transaction
from django.db.models import Sum, Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import FINANCE_ROLES, RoleBasedPermission
from apps.audit.services import audit_create, audit_log, audit_update
from apps.common.enums import AuditAction, FinancialStatus, UserRole
from apps.finance.models import (
    Budget,
    CategorieFinanciere,
    Depense,
    LigneBudget,
    Recette,
    ValidationFinanciere,
)
from apps.finance.serializers import (
    BudgetSerializer,
    CategorieFinanciereSerializer,
    DepenseSerializer,
    LigneBudgetSerializer,
    RecetteSerializer,
)
from apps.hierarchy.services import entities_in_scope


class CategorieFinanciereViewSet(viewsets.ModelViewSet):
    serializer_class = CategorieFinanciereSerializer
    filterset_fields = ["category_type", "church", "is_active"]
    search_fields = ["name", "code"]

    def get_permissions(self):
        return [RoleBasedPermission(allowed_roles=FINANCE_ROLES)]

    def get_queryset(self):
        qs = CategorieFinanciere.objects.all()
        user = self.request.user
        if user.is_super_admin or user.role == UserRole.TREASURER:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(models.Q(church__in=scope) | models.Q(church__isnull=True))


class RecetteViewSet(viewsets.ModelViewSet):
    serializer_class = RecetteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["church", "category", "status", "payment_method", "date"]
    search_fields = ["source", "reference", "description"]
    ordering_fields = ["date", "amount", "created_at"]

    def get_permissions(self):
        return [RoleBasedPermission(allowed_roles=FINANCE_ROLES)]

    def get_queryset(self):
        qs = Recette.objects.select_related("church", "category", "created_by", "approved_by")
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(church_id__in=scope.values_list("id", flat=True))

    def perform_create(self, serializer):
        kwargs = {"created_by": self.request.user}
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
        old = {"status": serializer.instance.status, "amount": str(serializer.instance.amount)}
        instance = serializer.save()
        audit_update(instance, user=self.request.user, request=self.request, old_values=old)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        recette = self.get_object()
        if recette.status != FinancialStatus.SUBMITTED:
            return Response(
                {"detail": "Seules les recettes soumises peuvent être approuvées."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        with transaction.atomic():
            recette.status = FinancialStatus.APPROVED
            recette.approved_by = request.user
            recette.save(update_fields=["status", "approved_by", "updated_at"])
            ValidationFinanciere.objects.create(
                recette=recette, validated_by=request.user, decision="APPROVED"
            )
            audit_log(
                action=AuditAction.VALIDATE, app_label="finance", model_name="recette",
                object_id=recette.pk, object_repr=str(recette),
                user=request.user, request=request,
            )
        return Response({"detail": "Recette approuvée."})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        recette = self.get_object()
        reason = request.data.get("reason", "")
        if recette.status != FinancialStatus.SUBMITTED:
            return Response(
                {"detail": "Seules les recettes soumises peuvent être rejetées."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        with transaction.atomic():
            recette.status = FinancialStatus.REJECTED
            recette.save(update_fields=["status", "updated_at"])
            ValidationFinanciere.objects.create(
                recette=recette, validated_by=request.user, decision="REJECTED", reason=reason
            )
            audit_log(
                action=AuditAction.REJECT, app_label="finance", model_name="recette",
                object_id=recette.pk, object_repr=str(recette),
                user=request.user, request=request, reason=reason,
            )
        return Response({"detail": "Recette rejetée."})


class DepenseViewSet(viewsets.ModelViewSet):
    serializer_class = DepenseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["church", "category", "status", "payment_method", "date"]
    search_fields = ["beneficiary", "reference", "description"]
    ordering_fields = ["date", "amount", "created_at"]

    def get_permissions(self):
        return [RoleBasedPermission(allowed_roles=FINANCE_ROLES)]

    def get_queryset(self):
        qs = Depense.objects.select_related("church", "category", "created_by", "approved_by")
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(church_id__in=scope.values_list("id", flat=True))

    def perform_create(self, serializer):
        kwargs = {"created_by": self.request.user}
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

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        depense = self.get_object()
        if depense.status != FinancialStatus.SUBMITTED:
            return Response({"detail": "Seules les dépenses soumises peuvent être approuvées."}, status=400)
        with transaction.atomic():
            depense.status = FinancialStatus.APPROVED
            depense.approved_by = request.user
            depense.save(update_fields=["status", "approved_by", "updated_at"])
            ValidationFinanciere.objects.create(depense=depense, validated_by=request.user, decision="APPROVED")
            audit_log(action=AuditAction.VALIDATE, app_label="finance", model_name="depense",
                      object_id=depense.pk, object_repr=str(depense), user=request.user, request=request)
        return Response({"detail": "Dépense approuvée."})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        depense = self.get_object()
        reason = request.data.get("reason", "")
        if depense.status != FinancialStatus.SUBMITTED:
            return Response({"detail": "Seules les dépenses soumises peuvent être rejetées."}, status=400)
        with transaction.atomic():
            depense.status = FinancialStatus.REJECTED
            depense.save(update_fields=["status", "updated_at"])
            ValidationFinanciere.objects.create(depense=depense, validated_by=request.user, decision="REJECTED", reason=reason)
            audit_log(action=AuditAction.REJECT, app_label="finance", model_name="depense",
                      object_id=depense.pk, object_repr=str(depense), user=request.user, request=request, reason=reason)
        return Response({"detail": "Dépense rejetée."})


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["church", "department", "fiscal_year", "status"]

    def get_permissions(self):
        return [RoleBasedPermission(allowed_roles=FINANCE_ROLES)]

    def get_queryset(self):
        qs = Budget.objects.select_related("church", "created_by")
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(church_id__in=scope.values_list("id", flat=True))

    def perform_create(self, serializer):
        kwargs = {"created_by": self.request.user}
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

    @action(detail=True, methods=["get"])
    def report(self, request, pk=None):
        budget = self.get_object()
        lines = LigneBudget.objects.filter(budget=budget).select_related("category")
        lines_data = LigneBudgetSerializer(lines, many=True).data
        for line in lines_data:
            cat_id = line["category"]
            actual = Recette.objects.filter(
                church=budget.church, category_id=cat_id, date__year=budget.fiscal_year, status="APPROVED"
            ).aggregate(total=Sum("amount"))["total"] or 0
            line["actual_amount"] = actual
            line["variance"] = actual - line["planned_amount"]
        return Response(lines_data)


class LigneBudgetViewSet(viewsets.ModelViewSet):
    serializer_class = LigneBudgetSerializer
    filterset_fields = ["budget", "category"]

    def get_permissions(self):
        return [RoleBasedPermission(allowed_roles=FINANCE_ROLES)]

    def get_queryset(self):
        qs = LigneBudget.objects.select_related("budget", "category")
        return qs


class FinancialReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if user.is_super_admin:
            qs_r = Recette.objects.all()
            qs_d = Depense.objects.all()
        else:
            scope = entities_in_scope(user)
            if scope is None:
                return Response({"recettes": 0, "depenses": 0, "solde": 0, "by_category": []})
            church_ids = scope.values_list("id", flat=True)
            qs_r = Recette.objects.filter(church_id__in=church_ids)
            qs_d = Depense.objects.filter(church_id__in=church_ids)

        if start_date:
            qs_r = qs_r.filter(date__gte=start_date)
            qs_d = qs_d.filter(date__gte=start_date)
        if end_date:
            qs_r = qs_r.filter(date__lte=end_date)
            qs_d = qs_d.filter(date__lte=end_date)

        total_recettes = qs_r.filter(status='APPROVED').aggregate(total=Sum('amount'))['total'] or 0
        total_depenses = qs_d.filter(status='APPROVED').aggregate(total=Sum('amount'))['total'] or 0

        recettes_by_cat = qs_r.filter(status='APPROVED').values('category__name').annotate(
            total=Sum('amount'), count=Count('id')
        ).order_by('-total')

        depenses_by_cat = qs_d.filter(status='APPROVED').values('category__name').annotate(
            total=Sum('amount'), count=Count('id')
        ).order_by('-total')

        return Response({
            "recettes": float(total_recettes),
            "depenses": float(total_depenses),
            "solde": float(total_recettes - total_depenses),
            "recettes_by_category": list(recettes_by_cat),
            "depenses_by_category": list(depenses_by_cat),
        })
