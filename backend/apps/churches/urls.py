from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.churches.views import ChapelleViewSet, ChurchViewSet, RegistrationView

router = DefaultRouter()
router.register("churches", ChurchViewSet, basename="church")
router.register("chapels", ChapelleViewSet, basename="chapelle")

urlpatterns = [
    path("register/", RegistrationView.as_view(), name="register"),
    path("", include(router.urls)),
]
