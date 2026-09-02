"""Permissions RBAC et vérification du périmètre hiérarchique."""
from __future__ import annotations

from typing import Iterable, Optional

from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.common.enums import UserRole

ADMIN_ROLES = [
    UserRole.LOCAL_LEADER,
    UserRole.TREASURER,
    UserRole.CHAPEL_LEADER,
]

FINANCE_ROLES = [
    UserRole.TREASURER,
]

LOCAL_LEADER_MANAGEABLE_ROLES = [
    UserRole.TREASURER,
    UserRole.DEPARTMENT_LEADER,
    UserRole.PASTORAL_LEADER,
    UserRole.CHAPEL_LEADER,
]


class RoleBasedPermission(BasePermission):
    """Autorise selon le rôle de l'utilisateur.

    - `allowed_roles` : rôles autorisés.
    - `read_only` : si True, les méthodes GET/HEAD/OPTIONS sont toujours autorisées
      pour tout utilisateur authentifié (utile pour les listes dont l'accès
      est ensuite affiné par `get_queryset`).
    """

    def __init__(self, allowed_roles: Optional[Iterable[str]] = None, read_only: bool = False):
        self.allowed_roles = set(allowed_roles or [])
        self.read_only = read_only

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.role == UserRole.LOCAL_LEADER:
            return True
        if self.read_only and request.method in SAFE_METHODS:
            return True
        return user.role in self.allowed_roles


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_super_admin)


class IsAuditorOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.is_super_admin or user.role == UserRole.AUDITOR


class ScopePermission(BasePermission):
    """Permission d'objet : vérifie que `obj` appartient au périmètre de l'utilisateur.

    `scope_field` : nom de l'attribut de `obj` (ou chemin 'a.b') menant à
    l'entité hiérarchique. Si None, on cherche un attribut `church` ou `entity`.
    """

    scope_field = None

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_super_admin:
            return True
        from apps.hierarchy.services import user_can_access_entity

        entity = _resolve_scope_entity(obj, self.scope_field)
        if entity is None:
            return False
        return user_can_access_entity(user, entity)


def _resolve_scope_entity(obj, scope_field: Optional[str]):
    if scope_field is None:
        for candidate in ("church", "entity", "source_entity", "destination_entity"):
            if hasattr(obj, candidate):
                value = getattr(obj, candidate)
                if value is None:
                    continue
                from apps.hierarchy.models import EntiteHierarchique

                if isinstance(value, EntiteHierarchique):
                    return value
        return None
    current = obj
    for part in scope_field.split("."):
        current = getattr(current, part, None)
        if current is None:
            return None
    return current
