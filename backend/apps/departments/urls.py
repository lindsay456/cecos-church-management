from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.departments.views import DepartementViewSet, MembreDepartementViewSet, PlanAnnuelViewSet

router = DefaultRouter()
router.register("departments", DepartementViewSet, basename="department")
router.register("department-memberships", MembreDepartementViewSet, basename="department-membership")
router.register("annual-plans", PlanAnnuelViewSet, basename="annual-plan")

urlpatterns = [
    path("", include(router.urls)),
]
