from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.donations.views import DonViewSet, RecuViewSet

router = DefaultRouter()
router.register("donations", DonViewSet, basename="don")
router.register("receipts", RecuViewSet, basename="receipt")

urlpatterns = [
    path("", include(router.urls)),
]
