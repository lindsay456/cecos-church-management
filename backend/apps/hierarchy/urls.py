from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.hierarchy.views import EntiteHierarchiqueViewSet

router = DefaultRouter()
router.register("hierarchy", EntiteHierarchiqueViewSet, basename="hierarchy")

urlpatterns = [
    path("", include(router.urls)),
]
