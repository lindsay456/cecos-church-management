from django.http import HttpResponse
from rest_framework.permissions import BasePermission
from rest_framework.views import APIView

from apps.audit.services import audit_log
from apps.common.enums import AuditAction, UserRole


class IsReportAllowed(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and (
            user.is_super_admin or user.role in (
                UserRole.LOCAL_LEADER, UserRole.TREASURER, UserRole.AUDITOR,
            )
        )


class MembersReportView(APIView):
    permission_classes = [IsReportAllowed]

    def get(self, request):
        from apps.hierarchy.services import entities_in_scope
        from apps.members.models import Membre
        from apps.reports.generators import generate_members_pdf

        church_id = request.query_params.get("church")
        qs = Membre.objects.filter(is_active=True)
        if church_id:
            qs = qs.filter(church_id=church_id)
        scope = entities_in_scope(request.user)
        if scope is not None:
            qs = qs.filter(church_id__in=scope.values_list("id", flat=True))

        audit_log(
            action=AuditAction.EXPORT, app_label="reports", model_name="members_report",
            user=request.user, request=request,
        )
        buf = generate_members_pdf(queryset=qs)
        response = HttpResponse(buf.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="rapport_membres.pdf"'
        return response


class DonationsReportView(APIView):
    permission_classes = [IsReportAllowed]

    def get(self, request):
        from apps.hierarchy.services import entities_in_scope
        from apps.donations.models import Don
        from apps.reports.generators import generate_donations_pdf

        church_id = request.query_params.get("church")
        qs = Don.objects.filter(status="VALIDATED").select_related("member", "church")
        if church_id:
            qs = qs.filter(church_id=church_id)
        scope = entities_in_scope(request.user)
        if scope is not None:
            qs = qs.filter(church_id__in=scope.values_list("id", flat=True))

        audit_log(
            action=AuditAction.EXPORT, app_label="reports", model_name="donations_report",
            user=request.user, request=request,
        )
        buf = generate_donations_pdf(queryset=qs)
        response = HttpResponse(buf.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="rapport_dimes_offrandes.pdf"'
        return response


class FinancialReportView(APIView):
    permission_classes = [IsReportAllowed]

    def get(self, request):
        from apps.hierarchy.services import entities_in_scope
        from apps.finance.models import Recette, Depense
        from apps.reports.generators import generate_financial_pdf

        church_id = request.query_params.get("church")
        recettes = Recette.objects.filter(status="APPROVED").select_related("church", "category")
        depenses = Depense.objects.filter(status="APPROVED").select_related("church", "category")
        if church_id:
            recettes = recettes.filter(church_id=church_id)
            depenses = depenses.filter(church_id=church_id)
        scope = entities_in_scope(request.user)
        if scope is not None:
            ids = scope.values_list("id", flat=True)
            recettes = recettes.filter(church_id__in=ids)
            depenses = depenses.filter(church_id__in=ids)

        audit_log(
            action=AuditAction.EXPORT, app_label="reports", model_name="financial_report",
            user=request.user, request=request,
        )
        buf = generate_financial_pdf(recettes=recettes, depenses=depenses)
        response = HttpResponse(buf.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="rapport_financier.pdf"'
        return response


class AttendanceReportView(APIView):
    permission_classes = [IsReportAllowed]

    def get(self, request):
        from apps.hierarchy.services import entities_in_scope
        from apps.attendance.models import SessionCulte
        from apps.reports.generators import generate_attendance_pdf

        church_id = request.query_params.get("church")
        qs = SessionCulte.objects.select_related("church", "chapel").order_by("-date")
        if church_id:
            qs = qs.filter(church_id=church_id)
        scope = entities_in_scope(request.user)
        if scope is not None:
            qs = qs.filter(church_id__in=scope.values_list("id", flat=True))

        audit_log(
            action=AuditAction.EXPORT, app_label="reports", model_name="attendance_report",
            user=request.user, request=request,
        )
        buf = generate_attendance_pdf(queryset=qs)
        response = HttpResponse(buf.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="rapport_presences.pdf"'
        return response


class PastoralReportView(APIView):
    permission_classes = [IsReportAllowed]

    def get(self, request):
        from apps.hierarchy.services import entities_in_scope
        from apps.pastoral.models import SuiviPastoral
        from apps.reports.generators import generate_pastoral_pdf

        church_id = request.query_params.get("church")
        qs = SuiviPastoral.objects.select_related("member", "assigned_to", "church").order_by("-action_date")
        if church_id:
            qs = qs.filter(church_id=church_id)
        scope = entities_in_scope(request.user)
        if scope is not None:
            qs = qs.filter(church_id__in=scope.values_list("id", flat=True))

        audit_log(
            action=AuditAction.EXPORT, app_label="reports", model_name="pastoral_report",
            user=request.user, request=request,
        )
        buf = generate_pastoral_pdf(queryset=qs)
        response = HttpResponse(buf.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="rapport_pastoral.pdf"'
        return response


class AuditReportView(APIView):
    permission_classes = [IsReportAllowed]

    def get(self, request):
        from apps.audit.models import JournalAudit
        from apps.reports.generators import generate_audit_pdf

        qs = JournalAudit.objects.select_related("user").order_by("-timestamp")

        audit_log(
            action=AuditAction.EXPORT, app_label="reports", model_name="audit_report",
            user=request.user, request=request,
        )
        buf = generate_audit_pdf(queryset=qs)
        response = HttpResponse(buf.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="rapport_audit.pdf"'
        return response
