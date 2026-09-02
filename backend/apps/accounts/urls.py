from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import (
    ChangePasswordView,
    CustomRefreshView,
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    TeamViewSet,
    UserViewSet,
    UserRoleAssignmentViewSet,
)

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")
router.register("team", TeamViewSet, basename="team")
router.register("role-assignments", UserRoleAssignmentViewSet, basename="role-assignment")

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", CustomRefreshView.as_view(), name="auth-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="auth-password-reset"),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="auth-password-reset-confirm",
    ),
    path("", include(router.urls)),
]
