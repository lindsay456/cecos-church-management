from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.pastoral.views import SuiviPastoralViewSet

router = DefaultRouter()
router.register("pastoral-followups", SuiviPastoralViewSet, basename="pastoral-followup")

urlpatterns = [
    path("", include(router.urls)),
]
