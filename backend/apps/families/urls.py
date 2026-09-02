from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.families.views import FamilleViewSet

router = DefaultRouter()
router.register("families", FamilleViewSet, basename="family")

urlpatterns = [
    path("", include(router.urls)),
]
