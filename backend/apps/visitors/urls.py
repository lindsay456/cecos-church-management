from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.visitors.views import VisiteurViewSet

router = DefaultRouter()
router.register("visitors", VisiteurViewSet, basename="visitor")

urlpatterns = [
    path("", include(router.urls)),
]
