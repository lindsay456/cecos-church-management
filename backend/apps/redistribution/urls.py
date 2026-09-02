from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.redistribution.views import (
    FondsAffecteViewSet,
    RedistributionViewSet,
    RegleReversementViewSet,
)

router = DefaultRouter()
router.register("designated-funds", FondsAffecteViewSet, basename="designated-fund")
router.register("redistribution-rules", RegleReversementViewSet, basename="redistribution-rule")
router.register("redistributions", RedistributionViewSet, basename="redistribution")

urlpatterns = [
    path("", include(router.urls)),
]
