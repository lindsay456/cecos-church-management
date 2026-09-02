from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.attendance.views import SessionCulteViewSet

router = DefaultRouter()
router.register("worship-sessions", SessionCulteViewSet, basename="worship-session")

urlpatterns = [
    path("", include(router.urls)),
]
