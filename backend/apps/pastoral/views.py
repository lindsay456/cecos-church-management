"""Vues du suivi pastoral — contrôle strict des permissions et de la confidentialité."""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import RoleBasedPermission
from apps.audit.services import audit_create, audit_log, audit_update
from apps.common.enums import AuditAction, ConfidentialityLevel, UserRole
from apps.hierarchy.services import entities_in_scope
from apps.pastoral.models import SuiviPastoral
from apps.pastoral.serializers import SuiviPastoralDetailSerializer, SuiviPastoralListSerializer


class SuiviPastoralViewSet(viewsets.ModelViewSet):
    serializer_class = SuiviPastoralListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["member", "church", "status", "action_type", "confidentiality_level"]
    search_fields = ["reason", "details"]
    ordering_fields = ["action_date", "created_at"]

    def get_permissions(self):
        allowed = [UserRole.SUPER_ADMIN, UserRole.PASTORAL_LEADER, UserRole.LOCAL_LEADER]
        return [RoleBasedPermission(allowed_roles=allowed)]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return SuiviPastoralDetailSerializer
        return SuiviPastoralListSerializer

    def get_queryset(self):
        qs = SuiviPastoral.objects.select_related(
            "member", "assigned_to", "church", "created_by"
        )
        user = self.request.user
        if user.is_super_admin:
            return qs
        if user.role not in (UserRole.PASTORAL_LEADER, UserRole.LOCAL_LEADER):
            # Auditors see count only, not details
            return qs.none()
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        qs = qs.filter(church_id__in=scope.values_list("id", flat=True))
        # Restrict highly confidential for non-admin pastoral leaders
        if user.role == UserRole.PASTORAL_LEADER:
            qs = qs.exclude(confidentiality_level=ConfidentialityLevel.HIGHLY_CONFIDENTIAL)
        return qs

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
        instance = serializer.save()
        audit_update(instance, user=self.request.user, request=self.request)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        audit_log(
            action=AuditAction.VIEW,
            app_label="pastoral",
            model_name="suivipastoral",
            object_id=instance.pk,
            object_repr=str(instance),
            user=request.user,
            request=request,
            reason=f"Consultation suivi pastoral (confidentialité: {instance.confidentiality_level})",
        )
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        from django.utils import timezone

        instance = self.get_object()
        instance.status = "CLOSED"
        instance.closed_by = request.user
        instance.closed_at = timezone.now()
        instance.save(update_fields=["status", "closed_by", "closed_at", "updated_at"])
        audit_log(
            action=AuditAction.UPDATE, app_label="pastoral", model_name="suivipastoral",
            object_id=instance.pk, object_repr=str(instance),
            user=request.user, request=request, reason="Clôture du suivi pastoral",
        )
        return Response({"detail": "Suivi clôturé."})
