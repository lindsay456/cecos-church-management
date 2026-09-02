"""Aggrégation des routes API versionnées (/api/v1/)."""
from __future__ import annotations

from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.accounts.urls")),
    path("", include("apps.hierarchy.urls")),
    path("", include("apps.churches.urls")),
    path("", include("apps.members.urls")),
    path("", include("apps.families.urls")),
    path("", include("apps.departments.urls")),
    path("", include("apps.events.urls")),
    path("", include("apps.attendance.urls")),
    path("", include("apps.visitors.urls")),
    path("", include("apps.finance.urls")),
    path("", include("apps.pastoral.urls")),
    path("", include("apps.donations.urls")),
    path("", include("apps.redistribution.urls")),
    path("", include("apps.notifications.urls")),
    path("", include("apps.reports.urls")),
    path("", include("apps.audit.urls")),
]
