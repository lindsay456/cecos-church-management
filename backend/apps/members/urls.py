from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.members.views import MembreViewSet

router = DefaultRouter()
router.register("members", MembreViewSet, basename="member")

urlpatterns = [
    path("", include(router.urls)),
]
