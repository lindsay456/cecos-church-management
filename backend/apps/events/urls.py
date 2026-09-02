from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.events.views import EvenementViewSet

router = DefaultRouter()
router.register("events", EvenementViewSet, basename="event")

urlpatterns = [
    path("", include(router.urls)),
]
