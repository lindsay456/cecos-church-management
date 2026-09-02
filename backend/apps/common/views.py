"""Vue dashboard : statistiques globales (role-based)."""
from __future__ import annotations

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.members.models import Membre
from apps.families.models import Famille
from apps.attendance.models import SessionCulte
from apps.visitors.models import Visiteur
from apps.finance.models import Recette, Depense, Budget
from apps.donations.models import Don
from apps.pastoral.models import SuiviPastoral
from apps.events.models import Evenement
from apps.churches.models import Chapelle
from apps.departments.models import Departement
from apps.common.enums import MemberStatus, FinancialStatus, DonationStatus, PastoralStatus, UserRole


def health_check(request):
    return JsonResponse({"status": "ok"})


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        church = user.entity
        if not church:
            return Response({
                "active_members": 0, "families": 0, "chapels": 0, "last_worship_count": 0,
                "visitors": 0, "upcoming_events": 0,
                "month_recettes": 0, "month_depenses": 0, "budget_consumed": 0,
                "month_tithes": 0, "month_offerings": 0,
                "open_pastoral": 0, "departments": 0,
                "role": user.role, "notifications_unread": 0,
            })

        role = user.role

        # --- Common: always return all stats ---
        members_count = Membre.objects.filter(church=church, is_active=True).count()
        families_count = Famille.objects.filter(church=church).count()
        chapels_count = Chapelle.objects.filter(church=church, is_active=True).count()

        last_session = SessionCulte.objects.filter(church=church).order_by('-date').first()
        last_worship = 0
        if last_session:
            last_worship = (last_session.men_count or 0) + (last_session.women_count or 0) + (last_session.children_count or 0) + (last_session.visitors_count or 0)

        visitors_count = Visiteur.objects.filter(church=church).count()
        upcoming_events = Evenement.objects.filter(church=church, start_datetime__gte=now).count()

        month_recettes = Recette.objects.filter(
            church=church, date__gte=month_start.date(), status=FinancialStatus.APPROVED
        ).aggregate(total=Sum('amount'))['total'] or 0

        month_depenses = Depense.objects.filter(
            church=church, date__gte=month_start.date(), status=FinancialStatus.APPROVED
        ).aggregate(total=Sum('amount'))['total'] or 0

        month_tithes = Don.objects.filter(
            church=church, donation_date__gte=month_start.date(),
            donation_type='TITHE', status=DonationStatus.VALIDATED
        ).aggregate(total=Sum('amount'))['total'] or 0

        month_offerings = Don.objects.filter(
            church=church, donation_date__gte=month_start.date(),
            donation_type__in=['GENERAL_OFFERING', 'SPECIAL_OFFERING'],
            status=DonationStatus.VALIDATED
        ).aggregate(total=Sum('amount'))['total'] or 0

        budget = Budget.objects.filter(church=church, fiscal_year=now.year).first()
        budget_consumed = 0
        if budget:
            planned = budget.lines.aggregate(total=Sum('planned_amount'))['total'] or 0
            if planned > 0:
                budget_consumed = round(float(month_depenses) / float(planned) * 100, 1)

        open_pastoral = SuiviPastoral.objects.filter(
            church=church, status__in=[PastoralStatus.OPEN, PastoralStatus.IN_PROGRESS]
        ).count()

        departments_count = Departement.objects.filter(church=church, is_active=True).count()

        # --- Notifications ---
        from apps.notifications.models import Notification
        unread_notifs = Notification.objects.filter(recipient_user=user, status='PENDING').count()

        # --- Chapel leader: attendance for their chapel ---
        chapel_attendance = []
        if role == UserRole.CHAPEL_LEADER:
            user_chapels = Chapelle.objects.filter(church=church, leader=user)
            if user_chapels.exists():
                sessions = SessionCulte.objects.filter(
                    chapel__in=user_chapels, church=church
                ).order_by('-date')[:10]
                chapel_attendance = [
                    {
                        "id": s.id,
                        "date": s.date.isoformat(),
                        "service_type": s.service_type,
                        "chapel_name": s.chapel.name if s.chapel else "",
                        "men_count": s.men_count,
                        "women_count": s.women_count,
                        "children_count": s.children_count,
                        "visitors_count": s.visitors_count,
                        "total": s.total_count,
                    }
                    for s in sessions
                ]

        # --- Historical chart data: last 6 months ---
        six_months_ago = now - timezone.timedelta(days=180)
        month_start_6 = six_months_ago.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        revenue_history = (
            Recette.objects.filter(
                church=church, date__gte=month_start_6.date(),
                status=FinancialStatus.APPROVED
            )
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )

        expense_history = (
            Depense.objects.filter(
                church=church, date__gte=month_start_6.date(),
                status=FinancialStatus.APPROVED
            )
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )

        tithe_history = (
            Don.objects.filter(
                church=church, donation_date__gte=month_start_6.date(),
                donation_type='TITHE', status=DonationStatus.VALIDATED
            )
            .annotate(month=TruncMonth('donation_date'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )

        attendance_history = (
            SessionCulte.objects.filter(church=church, date__gte=month_start_6.date())
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(
                total_attendees=Sum('men_count') + Sum('women_count') + Sum('children_count') + Sum('visitors_count'),
                sessions=Count('id'),
            )
            .order_by('month')
        )

        months_fr = {
            1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Avr', 5: 'Mai', 6: 'Jun',
            7: 'Jul', 8: 'Aou', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec',
        }

        chart_revenue_labels = []
        chart_revenue_income = []
        chart_revenue_expenses = []
        chart_tithes = []
        chart_attendance_labels = []
        chart_attendance_total = []
        chart_attendance_sessions = []

        for row in revenue_history:
            m = row['month']
            chart_revenue_labels.append(months_fr.get(m.month, ''))
            chart_revenue_income.append(float(row['total'] or 0))

        for row in expense_history:
            m = row['month']
            label = months_fr.get(m.month, '')
            if label not in chart_revenue_labels:
                chart_revenue_labels.append(label)
                chart_revenue_income.append(0)
            idx = chart_revenue_labels.index(label)
            chart_revenue_expenses.insert(idx, float(row['total'] or 0))

        for row in tithe_history:
            m = row['month']
            label = months_fr.get(m.month, '')
            if label not in chart_revenue_labels:
                chart_revenue_labels.append(label)
                chart_revenue_income.append(0)
                chart_revenue_expenses.append(0)
            idx = chart_revenue_labels.index(label)
            while len(chart_tithes) < idx:
                chart_tithes.append(0)
            chart_tithes.insert(idx, float(row['total'] or 0))

        for row in attendance_history:
            m = row['month']
            chart_attendance_labels.append(months_fr.get(m.month, ''))
            chart_attendance_total.append(int(row['total_attendees'] or 0))
            chart_attendance_sessions.append(int(row['sessions'] or 0))

        while len(chart_revenue_expenses) < len(chart_revenue_labels):
            chart_revenue_expenses.append(0)
        while len(chart_tithes) < len(chart_revenue_labels):
            chart_tithes.append(0)

        return Response({
            "active_members": members_count,
            "families": families_count,
            "chapels": chapels_count,
            "last_worship_count": last_worship,
            "visitors": visitors_count,
            "upcoming_events": upcoming_events,
            "month_recettes": float(month_recettes),
            "month_depenses": float(month_depenses),
            "budget_consumed": budget_consumed,
            "month_tithes": float(month_tithes),
            "month_offerings": float(month_offerings),
            "open_pastoral": open_pastoral,
            "departments": departments_count,
            "role": role,
            "notifications_unread": unread_notifs,
            "chapel_attendance": chapel_attendance,
            "chart": {
                "revenue_labels": chart_revenue_labels,
                "revenue_income": chart_revenue_income,
                "revenue_expenses": chart_revenue_expenses,
                "revenue_tithes": chart_tithes,
                "attendance_labels": chart_attendance_labels,
                "attendance_total": chart_attendance_total,
                "attendance_sessions": chart_attendance_sessions,
            },
        })
