from django.urls import path

from apps.reports.views import (
    DonationsReportView, MembersReportView, FinancialReportView,
    AttendanceReportView, PastoralReportView, AuditReportView,
)

urlpatterns = [
    path("reports/members/", MembersReportView.as_view(), name="report-members"),
    path("reports/donations/", DonationsReportView.as_view(), name="report-donations"),
    path("reports/financial/", FinancialReportView.as_view(), name="report-financial"),
    path("reports/attendance/", AttendanceReportView.as_view(), name="report-attendance"),
    path("reports/pastoral/", PastoralReportView.as_view(), name="report-pastoral"),
    path("reports/audit/", AuditReportView.as_view(), name="report-audit"),
]
