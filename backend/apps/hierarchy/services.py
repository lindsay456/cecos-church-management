"""Services de périmètre hiérarchique (scope RBAC)."""
from __future__ import annotations

from django.db.models import QuerySet

from apps.common.enums import UserRole


def _descendant_ids(start_id: int) -> set[int]:
    """Renvoie tous les ids descendants de `start_id` (recherche en mémoire)."""
    from apps.hierarchy.models import EntiteHierarchique

    pairs = list(
        EntiteHierarchique.objects.filter(parent_id__isnull=False).values_list("parent_id", "id")
    )
    children = {}
    for parent_id, child_id in pairs:
        children.setdefault(parent_id, []).append(child_id)

    result: set[int] = set()
    stack = [start_id]
    while stack:
        current = stack.pop()
        for child in children.get(current, []):
            if child not in result:
                result.add(child)
                stack.append(child)
    return result


def entities_in_scope(user) -> QuerySet:
    """Entités accessibles à `user` (son entité + descendants).

    Retourne `None` si l'utilisateur est super-admin ou superuser (accès global).
    """
    from apps.hierarchy.models import EntiteHierarchique

    if user is None or not user.is_authenticated:
        return EntiteHierarchique.objects.none()
    if user.is_super_admin or user.is_superuser:
        return EntiteHierarchique.objects.all()
    if user.entity_id is None:
        return EntiteHierarchique.objects.none()
    ids = {user.entity_id} | _descendant_ids(user.entity_id)
    return EntiteHierarchique.objects.filter(id__in=ids, is_active=True)


def user_can_access_entity(user, entity) -> bool:
    """Vrai si `entity` est dans le périmètre de `user`."""
    if user is None or not user.is_authenticated:
        return False
    if user.is_super_admin or user.is_superuser:
        return True
    if user.entity_id is None or entity is None:
        return False
    if user.entity_id == entity.id:
        return True
    return entity.id in _descendant_ids(user.entity_id)


def user_can_manage_user(user, target_user) -> bool:
    """Un admin ne peut gérer que les utilisateurs de son propre périmètre."""
    if user.is_super_admin or user.is_superuser:
        return True
    if target_user.entity_id is None:
        return False
    return user_can_access_entity(user, target_user.entity)


def is_administrative_role(role) -> bool:
    return role in {
        UserRole.SUPER_ADMIN,
        UserRole.DIVISION_ADMIN,
        UserRole.UNION_ADMIN,
        UserRole.FEDERATION_ADMIN,
        UserRole.LOCAL_LEADER,
    }
