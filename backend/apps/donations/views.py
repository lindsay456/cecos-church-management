"""Vues des dîmes et offrandes."""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import ADMIN_ROLES, RoleBasedPermission
from apps.audit.services import audit_log
from apps.common.enums import AuditAction, DonationStatus, UserRole
from apps.donations.models import Don, Recu
from apps.donations.serializers import DonDetailSerializer, DonListSerializer, RecuSerializer
from apps.donations.services import cancel_donation, validate_donation
from apps.hierarchy.services import entities_in_scope


class DonViewSet(viewsets.ModelViewSet):
    serializer_class = DonListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["church", "donation_type", "status", "payment_method", "member"]
    search_fields = ["donation_number", "reference", "notes"]
    ordering_fields = ["donation_date", "amount", "created_at"]

    def get_permissions(self):
        if self.action in ("create",):
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES + [UserRole.TREASURER, UserRole.MEMBER])]
        if self.action in ("update", "partial_update", "destroy"):
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES + [UserRole.TREASURER])]
        if self.action in ("validate", "reject", "cancel"):
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES + [UserRole.TREASURER])]
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES + [UserRole.TREASURER], read_only=True)]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return DonDetailSerializer
        return DonListSerializer

    def get_queryset(self):
        qs = Don.objects.select_related("member", "church", "recorded_by", "validated_by")
        user = self.request.user
        if user.is_super_admin or user.role == UserRole.AUDITOR:
            return qs
        if user.role == UserRole.MEMBER:
            from apps.members.models import Membre
            member = Membre.objects.filter(email=user.email, church=user.entity).first()
            if member:
                return qs.filter(member=member)
            return qs.none()
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(church_id__in=scope.values_list("id", flat=True))

    def perform_create(self, serializer):
        kwargs = {"recorded_by": self.request.user}
        user = self.request.user
        # Auto-set church
        if not serializer.validated_data.get("church"):
            if hasattr(user, "entity") and user.entity:
                kwargs["church"] = user.entity
            else:
                from apps.hierarchy.models import EntiteHierarchique
                first = EntiteHierarchique.objects.filter(is_active=True).first()
                if first:
                    kwargs["church"] = first
        # Auto-set member if the user is a MEMBER making their own donation
        if user.role == UserRole.MEMBER and not serializer.validated_data.get("member"):
            from apps.members.models import Membre
            member = Membre.objects.filter(email=user.email, church=user.entity).first()
            if member:
                kwargs["member"] = member
        instance = serializer.save(**kwargs)

    @action(detail=True, methods=["post"])
    def validate_don(self, request, pk=None):
        don = self.get_object()
        try:
            don = validate_donation(don, request.user)
            return Response({"detail": "Don validé.", "status": don.status})
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        don = self.get_object()
        reason = request.data.get("reason", "")
        if not reason:
            return Response({"detail": "Le motif du rejet est obligatoire."}, status=400)
        if don.status != DonationStatus.PENDING_VALIDATION:
            return Response({"detail": "Seuls les dons en attente de validation peuvent être rejetés."}, status=400)
        don.status = DonationStatus.REJECTED
        don.cancellation_reason = reason
        don.save(update_fields=["status", "cancellation_reason", "updated_at"])
        audit_log(
            action=AuditAction.REJECT,
            app_label="donations",
            model_name="don",
            object_id=don.pk,
            object_repr=str(don),
            new_values={"status": DonationStatus.REJECTED},
            user=request.user,
            reason=reason,
        )
        return Response({"detail": "Don rejeté."})

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        don = self.get_object()
        reason = request.data.get("reason", "")
        if not reason:
            return Response({"detail": "Le motif d'annulation est obligatoire."}, status=400)
        try:
            don = cancel_donation(don, request.user, reason)
            return Response({"detail": "Don annulé."})
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path="export/excel")
    def export_excel(self, request):
        qs = self.filter_queryset(self.get_queryset())
        from apps.reports.generators import generate_report_excel
        headers = ["N\u00b0", "Membre", "Type", "Montant", "Date", "Statut", "Methode", "Eglise"]
        rows = []
        for d in qs[:2000]:
            rows.append([
                d.donation_number,
                d.member.full_name if d.member else "Anonyme",
                d.get_donation_type_display(),
                f"{d.amount:,.0f}",
                str(d.donation_date),
                d.get_status_display(),
                d.get_payment_method_display() if hasattr(d, 'get_payment_method_display') else d.payment_method,
                d.church.name if d.church else "",
            ])
        buf = generate_report_excel("Dons", headers, rows)
        from django.http import HttpResponse
        response = HttpResponse(buf.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = 'attachment; filename="dons.xlsx"'
        return response

    @action(detail=True, methods=["get"])
    def receipt(self, request, pk=None):
        don = self.get_object()
        receipt = Recu.objects.filter(donation=don).first()
        if not receipt:
            return Response({"detail": "Aucun recu pour ce don."}, status=404)
        if receipt.pdf_file:
            from django.http import FileResponse
            return FileResponse(receipt.pdf_file.open(), content_type="application/pdf", filename=f"recu_{receipt.receipt_number}.pdf")
        from apps.donations.receipt_generator import generate_donation_receipt_pdf
        buf = generate_donation_receipt_pdf(receipt, don)
        from django.http import HttpResponse
        response = HttpResponse(buf.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = f'inline; filename="recu_{receipt.receipt_number}.pdf"'
        return response


class RecuViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RecuSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["status"]
    search_fields = ["receipt_number"]

    def get_queryset(self):
        qs = Recu.objects.select_related("donation")
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(donation__church_id__in=scope.values_list("id", flat=True))

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        receipt = self.get_object()
        if receipt.pdf_file:
            from django.http import FileResponse
            return FileResponse(receipt.pdf_file.open(), content_type="application/pdf", filename=f"recu_{receipt.receipt_number}.pdf")
        don = receipt.donation
        from apps.donations.receipt_generator import generate_donation_receipt_pdf
        buf = generate_donation_receipt_pdf(receipt, don)
        from django.http import HttpResponse
        response = HttpResponse(buf.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = f'inline; filename="recu_{receipt.receipt_number}.pdf"'
        return response
