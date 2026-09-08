"""Modèle utilisateur personnalisé basé sur AbstractBaseUser (identifiant : email)."""
from __future__ import annotations

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from apps.common.enums import UserRole
from apps.common.models import TimeStampedModel


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, first_name="", last_name="", **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, first_name="", last_name="", **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", UserRole.LOCAL_LEADER)
        return self.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            **extra_fields,
        )


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    """Utilisateur de la plateforme.

    - identifiant : email unique ;
    - rôle : contrôle l'accès aux modules (RBAC) ;
    - entity : entité hiérarchique de rattachement (périmètre d'accès).
    """

    email = models.EmailField(unique=True, verbose_name="Email")
    first_name = models.CharField(max_length=128, verbose_name="Prénom")
    last_name = models.CharField(max_length=128, verbose_name="Nom")
    phone = models.CharField(max_length=30, blank=True, verbose_name="Téléphone")
    role = models.CharField(
        max_length=30,
        choices=UserRole.choices,
        default=UserRole.MEMBER,
        verbose_name="Rôle",
    )
    entity = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="users",
        verbose_name="Entité de rattachement",
    )
    is_staff = models.BooleanField(default=False, verbose_name="Staff")
    is_active = models.BooleanField(default=True, verbose_name="Actif")

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return self.full_name or self.email

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def is_super_admin(self) -> bool:
        return self.role == UserRole.LOCAL_LEADER

    @property
    def is_finance_role(self) -> bool:
        return self.role in {UserRole.TREASURER, UserRole.AUDITOR, UserRole.LOCAL_LEADER}


class UserRoleAssignment(TimeStampedModel):
    """Attribution d'un role a un utilisateur pour une entite donnee (scope)."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="role_assignments",
        verbose_name="Utilisateur",
    )
    role_code = models.CharField(
        max_length=30,
        choices=UserRole.choices,
        verbose_name="Role",
    )
    scope_entity = models.ForeignKey(
        "hierarchy.EntiteHierarchique",
        on_delete=models.CASCADE,
        related_name="role_assignments",
        verbose_name="Entite de portee",
    )
    can_manage_descendants = models.BooleanField(default=False, verbose_name="Peut gerer les descendants")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    starts_at = models.DateField(null=True, blank=True, verbose_name="Date de debut")
    ends_at = models.DateField(null=True, blank=True, verbose_name="Date de fin")
    assigned_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_roles",
        verbose_name="Attribue par",
    )

    class Meta:
        verbose_name = "Attribution de role"
        verbose_name_plural = "Attributions de roles"
        unique_together = ["user", "role_code", "scope_entity"]

    def __str__(self):
        return f"{self.user} — {self.get_role_code_display()} @ {self.scope_entity}"
