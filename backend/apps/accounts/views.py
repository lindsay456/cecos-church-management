"""Vues d'authentification JWT et gestion des utilisateurs."""
from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.permissions import ADMIN_ROLES, LOCAL_LEADER_MANAGEABLE_ROLES, RoleBasedPermission
from apps.accounts.serializers import (
    ChangePasswordSerializer,
    MeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserCreateSerializer,
    UserListSerializer,
    UserUpdateSerializer,
    UserRoleAssignmentSerializer,
)
from apps.audit.services import audit_log
from apps.common.enums import AuditAction, NotificationType, UserRole
from apps.hierarchy.services import entities_in_scope, user_can_manage_user

User = get_user_model()


class LoginSerializer(TokenObtainPairSerializer):
    """Sérialiseur de login enrichi : ajoute le profil utilisateur."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["entity_id"] = user.entity_id
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        from apps.accounts.serializers import MeSerializer

        data["user"] = MeSerializer(user, context=self.context).data
        return data


class LoginView(TokenObtainPairView):
    """POST /api/v1/auth/login/ — connexion, renvoie access + refresh + profil."""

    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
        except Exception:
            audit_log(
                action=AuditAction.LOGIN_FAILED,
                app_label="accounts",
                model_name="user",
                object_repr=request.data.get("email", "inconnu"),
                reason="Échec d'authentification",
                request=request,
            )
            raise
        email = request.data.get("email")
        if email:
            user = User.objects.filter(email__iexact=email).first()
            if user:
                audit_log(
                    action=AuditAction.LOGIN,
                    app_label="accounts",
                    model_name="user",
                    object_id=user.pk,
                    object_repr=user.email,
                    request=request,
                )
        return response


class CustomRefreshView(TokenRefreshView):
    """POST /api/v1/auth/refresh/ — rafraîchit l'access token."""

    pass


class LogoutView(APIView):
    """POST /api/v1/auth/logout/ — invalide le refresh token (blacklist)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get("refresh"))
            token.blacklist()
        except Exception:
            return Response(
                {"detail": "Jeton de rafraîchissement invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        audit_log(
            action=AuditAction.LOGOUT,
            app_label="accounts",
            model_name="user",
            object_id=request.user.pk,
            object_repr=str(request.user),
            request=request,
        )
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(generics.RetrieveAPIView):
    """GET /api/v1/auth/me/ — profil de l'utilisateur connecté."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MeSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """POST /api/v1/auth/change-password/ — changement de mot de passe."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        audit_log(
            action=AuditAction.PASSWORD_CHANGE,
            app_label="accounts",
            model_name="user",
            object_id=request.user.pk,
            object_repr=str(request.user),
            request=request,
        )
        return Response({"detail": "Mot de passe modifié."})


class PasswordResetRequestView(generics.GenericAPIView):
    """POST /api/v1/auth/password-reset/ — envoie un lien de réinitialisation."""

    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is None:
            return Response(
                {"detail": "Si cet email existe, un lien a été envoyé."},
                status=status.HTTP_200_OK,
            )
        from apps.notifications.services import notify

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
        notify(
            recipient_user=user,
            channel="EMAIL",
            notification_type=NotificationType.PASSWORD_RESET,
            subject="Réinitialisation de votre mot de passe",
            message=f"Cliquez sur ce lien pour réinitialiser votre mot de passe : {link}",
            related_object=None,
            send=True,
        )
        return Response(
            {"detail": "Si cet email existe, un lien a été envoyé."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    """POST /api/v1/auth/password-reset/confirm/ — valide le lien et change le mot de passe."""

    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            uid = urlsafe_base64_decode(data["uidb64"]).decode()
            user = User.objects.get(pk=uid, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Lien de réinitialisation invalide."}, status=400)
        if not default_token_generator.check_token(user, data["token"]):
            return Response(
                {"detail": "Lien de réinitialisation invalide ou expiré."}, status=400
            )
        user.set_password(data["new_password"])
        user.save(update_fields=["password"])
        audit_log(
            action=AuditAction.PASSWORD_CHANGE,
            app_label="accounts",
            model_name="user",
            object_id=user.pk,
            object_repr=str(user),
            reason="Réinitialisation de mot de passe",
        )
        return Response({"detail": "Mot de passe réinitialisé."})


class UserViewSet(viewsets.ModelViewSet):
    """CRUD des utilisateurs, réservé aux administrateurs du périmètre."""

    serializer_class = UserListSerializer
    filterset_fields = ["role", "entity", "is_active"]
    search_fields = ["email", "first_name", "last_name", "phone"]
    ordering_fields = ["last_name", "first_name", "created_at"]

    def get_permissions(self):
        admin_roles = [UserRole.SUPER_ADMIN, UserRole.DIVISION_ADMIN, UserRole.UNION_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.LOCAL_LEADER]
        return [RoleBasedPermission(allowed_roles=admin_roles)]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        if self.action in ("update", "partial_update"):
            return UserUpdateSerializer
        return UserListSerializer

    def get_queryset(self):
        qs = User.objects.select_related("entity").all()
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(entity_id__in=scope.values_list("id", flat=True))

    def perform_create(self, serializer):
        user = serializer.save()
        audit_log(
            action=AuditAction.CREATE,
            app_label="accounts",
            model_name="user",
            object_id=user.pk,
            object_repr=str(user),
            new_values={"email": user.email, "role": user.role, "entity": user.entity_id},
            user=self.request.user,
            request=self.request,
        )

    def perform_update(self, serializer):
        target = serializer.instance
        if not user_can_manage_user(self.request.user, target):
            raise PermissionDenied(
                "Vous ne pouvez gérer que les utilisateurs de votre périmètre."
            )
        instance = serializer.save()
        audit_log(
            action=AuditAction.UPDATE,
            app_label="accounts",
            model_name="user",
            object_id=instance.pk,
            object_repr=str(instance),
            new_values={"role": instance.role, "entity": instance.entity_id},
            user=self.request.user,
            request=self.request,
        )


class TeamViewSet(viewsets.ModelViewSet):
    """CRUD equipe locale - le responsable local cree les membres de son equipe."""

    serializer_class = UserListSerializer
    filterset_fields = ["role", "is_active"]
    search_fields = ["email", "first_name", "last_name", "phone"]

    def get_permissions(self):
        allowed = [UserRole.SUPER_ADMIN, UserRole.LOCAL_LEADER]
        return [RoleBasedPermission(allowed_roles=allowed)]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        if self.action in ("update", "partial_update"):
            return UserUpdateSerializer
        return UserListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        serializer.instance.refresh_from_db()
        return Response(
            {
                "detail": "Membre cree avec succes.",
                "generated_password": getattr(self, "_generated_password", None),
                "user": UserListSerializer(serializer.instance, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin:
            return User.objects.select_related("entity").all()
        if not user.entity:
            return User.objects.none()
        return User.objects.select_related("entity").filter(entity=user.entity)

    def perform_create(self, serializer):
        import secrets
        import string

        user = self.request.user
        role = self.request.data.get("role", UserRole.MEMBER)
        if role not in LOCAL_LEADER_MANAGEABLE_ROLES and not user.is_super_admin:
            raise PermissionDenied(
                "Vous ne pouvez creer que des utilisateurs avec les roles: "
                + ", ".join(LOCAL_LEADER_MANAGEABLE_ROLES)
            )

        # Auto-generate password
        alphabet = string.ascii_letters + string.digits + "!@#$%&*"
        generated_password = ''.join(secrets.choice(alphabet) for _ in range(12))

        save_kwargs = {}
        if user.entity:
            save_kwargs["entity"] = user.entity
        save_kwargs["is_staff"] = True
        new_user = serializer.save(**save_kwargs)
        new_user.set_password(generated_password)
        new_user.save()

        # Send email with credentials
        from apps.notifications.services import notify
        from apps.common.enums import NotificationType
        notify(
            recipient_user=new_user,
            channel="EMAIL",
            notification_type=NotificationType.WELCOME,
            subject="Bienvenue dans Cecos Church Management",
            message=(
                f"Bonjour {new_user.first_name} {new_user.last_name},\n\n"
                f"Vous avez ete invite(e) a rejoindre l'equipe en tant que {new_user.get_role_display()}.\n\n"
                f"Vos identifiants de connexion:\n"
                f"Email: {new_user.email}\n"
                f"Mot de passe: {generated_password}\n\n"
                f"Connectez-vous et changez votre mot de passe apres la premiere connexion.\n\n"
                f"L'equipe Cecos Church Management"
            ),
            related_object=new_user,
            send=True,
        )

        audit_log(
            action=AuditAction.CREATE,
            app_label="accounts",
            model_name="user",
            object_id=new_user.pk,
            object_repr=str(new_user),
            new_values={"email": new_user.email, "role": new_user.role, "entity": new_user.entity_id},
            user=self.request.user,
            request=self.request,
        )

        # Store generated password in response
        self._generated_password = generated_password

    def perform_update(self, serializer):
        target = serializer.instance
        user = self.request.user
        if not user.is_super_admin and target.entity_id != user.entity_id:
            raise PermissionDenied("Vous ne pouvez modifier que les utilisateurs de votre entite.")
        instance = serializer.save()
        audit_log(
            action=AuditAction.UPDATE,
            app_label="accounts",
            model_name="user",
            object_id=instance.pk,
            object_repr=str(instance),
            new_values={"role": instance.role},
            user=self.request.user,
            request=self.request,
        )


class UserRoleAssignmentViewSet(viewsets.ModelViewSet):
    """CRUD des attributions de role par entite (scope)."""

    serializer_class = UserRoleAssignmentSerializer
    filterset_fields = ["user", "role_code", "scope_entity", "is_active"]
    search_fields = ["user__email", "user__first_name", "user__last_name"]

    def get_permissions(self):
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES)]

    def get_queryset(self):
        from apps.accounts.models import UserRoleAssignment

        qs = UserRoleAssignment.objects.select_related("user", "scope_entity", "assigned_by")
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(scope_entity_id__in=scope.values_list("id", flat=True))

    def perform_create(self, serializer):
        from apps.accounts.models import UserRoleAssignment

        instance = serializer.save(assigned_by=self.request.user)
        audit_log(
            action=AuditAction.CREATE,
            app_label="accounts",
            model_name="userroleassignment",
            object_id=instance.pk,
            object_repr=str(instance),
            new_values={"user": instance.user_id, "role": instance.role_code, "scope": instance.scope_entity_id},
            user=self.request.user,
            request=self.request,
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        audit_log(
            action=AuditAction.UPDATE,
            app_label="accounts",
            model_name="userroleassignment",
            object_id=instance.pk,
            object_repr=str(instance),
            new_values={"is_active": instance.is_active, "role": instance.role_code},
            user=self.request.user,
            request=self.request,
        )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ — inscription du premier responsable local.

    Cree un compte LOCAL_LEADER + une entite eglise locale + premiere chapelle.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        from apps.hierarchy.models import EntiteHierarchique
        from apps.churches.models import Chapelle
        from apps.common.enums import Denomination, EntityType

        # Creer l'entite eglise locale
        church_code = data.get("church_code") or data["church_name"][:20].upper().replace(" ", "-")
        church = EntiteHierarchique.objects.create(
            name=data["church_name"],
            code=church_code,
            entity_type=EntityType.LOCAL_CHURCH,
            denomination=data.get("denomination", "ADVENTIST"),
            country=data.get("country", "Cameroun"),
            city=data.get("city", ""),
            address=data.get("address", ""),
        )

        # Creer l'utilisateur LOCAL_LEADER
        user = User.objects.create_user(
            email=data["email"],
            password=data["password"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone=data.get("phone", ""),
            role=UserRole.LOCAL_LEADER,
            entity=church,
        )

        # Creer la premiere chapelle si fournie
        chapel_name = data.get("chapel_name")
        if chapel_name:
            chapel_code = data.get("chapel_code") or "CH-001"
            Chapelle.objects.create(
                name=chapel_name,
                code=chapel_code,
                church=church,
                city=data.get("chapel_city", data.get("city", "")),
                address=data.get("chapel_address", ""),
                is_active=True,
            )

        # Generer les tokens JWT
        refresh = RefreshToken.for_user(user)
        from apps.accounts.serializers import MeSerializer

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": MeSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )
