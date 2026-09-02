"""Vues des églises, chapelles et inscription 3 étapes."""
from __future__ import annotations

import uuid

from django.contrib.auth import get_user_model
from django.db import models, transaction
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import ADMIN_ROLES, RoleBasedPermission
from apps.audit.services import audit_create, audit_update
from apps.churches.models import Chapelle
from apps.churches.serializers import (
    ChapelleSerializer,
    ChurchDetailSerializer,
    ChurchSerializer,
    RegistrationStep1Serializer,
    RegistrationStep2Serializer,
    RegistrationStep3Serializer,
)
from apps.common.enums import Denomination, EntityType
from apps.hierarchy.models import EntiteHierarchique
from apps.hierarchy.services import entities_in_scope


class ChurchViewSet(viewsets.ModelViewSet):
    serializer_class = ChurchSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["denomination", "entity_type", "country", "is_active"]
    search_fields = ["name", "code", "country"]
    ordering_fields = ["name", "code"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES)]
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES, read_only=True)]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ChurchDetailSerializer
        return ChurchSerializer

    def get_queryset(self):
        from apps.common.enums import EntityType
        LOCAL_TYPES = [EntityType.LOCAL_CHURCH, EntityType.PARISH, EntityType.PROTESTANT_CHURCH]
        qs = EntiteHierarchique.objects.select_related("parent", "responsible").filter(
            entity_type__in=LOCAL_TYPES
        ).annotate(
            members_count=Count("members", filter=Q(members__is_active=True)),
            families_count=Count("families", distinct=True),
        )
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        return qs.filter(id__in=scope.values_list("id", flat=True))

    def perform_create(self, serializer):
        instance = serializer.save()
        audit_create(instance, user=self.request.user, request=self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit_update(instance, user=self.request.user, request=self.request)

    def perform_destroy(self, instance):
        instance.soft_delete()
        audit_update(instance, user=self.request.user, request=self.request, reason="Désactivation")


class ChapelleViewSet(viewsets.ModelViewSet):
    serializer_class = ChapelleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["church", "is_active", "leader"]
    search_fields = ["name", "code", "city", "neighborhood"]
    ordering_fields = ["name", "created_at"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update"):
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES)]
        if self.action == "destroy":
            return [RoleBasedPermission(allowed_roles=ADMIN_ROLES)]
        return [RoleBasedPermission(allowed_roles=ADMIN_ROLES, read_only=True)]

    def get_queryset(self):
        qs = Chapelle.objects.select_related("church", "leader")
        user = self.request.user
        if user.is_super_admin:
            return qs
        scope = entities_in_scope(user)
        if scope is None:
            return qs.none()
        qs = qs.filter(church_id__in=scope.values_list("id", flat=True))
        if user.entity and user.entity.denomination:
            qs = qs.filter(church__denomination=user.entity.denomination)
        return qs

    def destroy(self, request, *args, **kwargs):
        chapel = self.get_object()
        from apps.members.models import Membre
        member_count = Membre.objects.filter(chapel=chapel, is_active=True).count()
        if member_count > 0:
            return Response(
                {"detail": f"Impossible de supprimer: {member_count} membre(s) rattache(s) a cette chapelle."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        chapel.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_create(self, serializer):
        kwargs = {}
        if not serializer.validated_data.get("church"):
            user = self.request.user
            if hasattr(user, "entity") and user.entity:
                kwargs["church"] = user.entity
            else:
                first_church = EntiteHierarchique.objects.filter(is_active=True).first()
                if first_church:
                    kwargs["church"] = first_church
        instance = serializer.save(**kwargs)
        audit_create(instance, user=self.request.user, request=self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit_update(instance, user=self.request.user, request=self.request)


class RegistrationView(APIView):
    """Inscription en 3 étapes : 1) Église, 2) Personnel, 3) Chapelle."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if self._has_all_data(request.data):
            return self._single_call(request)

        step = request.data.get("step", 1)
        session = request.session

        if step == 1:
            return self._step1(request, session)
        elif step == 2:
            return self._step2(request, session)
        elif step == 3:
            return self._step3(request, session)

        return Response({"detail": "Etape invalide."}, status=400)

    def _has_all_data(self, data):
        church_fields = ["church_name", "denomination"]
        personal_fields = ["first_name", "last_name", "email", "password"]
        chapel_fields = ["chapel_name"]
        return all(f in data for f in church_fields + personal_fields + chapel_fields)

    def _single_call(self, request):
        data = request.data

        email = data.get("email", "").lower()
        if not email.endswith("@gmail.com"):
            return Response(
                {"detail": "Seules les adresses email @gmail.com sont acceptees."},
                status=400,
            )

        denomination = data.get("denomination")
        church_type_map = {
            "CATHOLIC": EntityType.PARISH,
            "PROTESTANT": EntityType.PROTESTANT_CHURCH,
            "ADVENTIST": EntityType.LOCAL_CHURCH,
        }

        with transaction.atomic():
            church_code = data.get("church_code") or f"CH-{uuid.uuid4().hex[:8].upper()}"
            church = EntiteHierarchique.objects.create(
                name=data["church_name"],
                code=church_code,
                entity_type=church_type_map.get(denomination, EntityType.LOCAL_CHURCH),
                denomination=denomination,
                country=data.get("country", ""),
                city=data.get("city", ""),
                address=data.get("address", ""),
                is_active=True,
            )

            User = get_user_model()
            user = User.objects.create_user(
                email=email,
                password=data["password"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                phone=data.get("phone", ""),
                role="LOCAL_LEADER",
                entity=church,
                is_staff=True,
            )

            chapel_code = data.get("chapel_code") or f"CP-{uuid.uuid4().hex[:8].upper()}"
            Chapelle.objects.create(
                name=data["chapel_name"],
                code=chapel_code,
                church=church,
                address=data.get("chapel_address", ""),
                city=data.get("chapel_city", ""),
                leader=user,
                is_active=True,
            )

            church.responsible = user
            church.save(update_fields=["responsible", "updated_at"])

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            "detail": "Compte cree avec succes.",
            "user": {"id": user.id, "email": user.email, "role": user.role},
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)

    def _step1(self, request, session):
        serializer = RegistrationStep1Serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        session["reg_step1"] = {
            "church_name": data["church_name"],
            "denomination": data["denomination"],
            "church_address": data.get("church_address", ""),
            "church_city": data.get("church_city", ""),
            "church_country": data.get("church_country", ""),
            "church_phone": data.get("church_phone", ""),
            "church_email": data.get("church_email", ""),
            "gps_lat": str(data.get("gps_lat", "")) if data.get("gps_lat") else None,
            "gps_lng": str(data.get("gps_lng", "")) if data.get("gps_lng") else None,
        }
        return Response({"detail": "Étape 1 enregistrée. Passez à l'étape 2.", "step": 1})

    def _step2(self, request, session):
        if "reg_step1" not in session:
            return Response({"detail": "Veuillez commencer par l'étape 1."}, status=400)
        serializer = RegistrationStep2Serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        session["reg_step2"] = {
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "email": data["email"],
            "phone": data.get("phone", ""),
            "password": data["password"],
        }
        return Response({"detail": "Étape 2 enregistrée. Passez à l'étape 3.", "step": 2})

    def _step3(self, request, session):
        if "reg_step1" not in session or "reg_step2" not in session:
            return Response({"detail": "Veuillez compléter les étapes précédentes."}, status=400)
        serializer = RegistrationStep3Serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            s1 = session["reg_step1"]
            s2 = session["reg_step2"]

            denomination = s1["denomination"]
            church_type_map = {
                "CATHOLIC": EntityType.PARISH,
                "PROTESTANT": EntityType.PROTESTANT_CHURCH,
                "ADVENTIST": EntityType.LOCAL_CHURCH,
            }
            church_code = f"CH-{uuid.uuid4().hex[:8].upper()}"
            church = EntiteHierarchique.objects.create(
                name=s1["church_name"],
                code=church_code,
                entity_type=church_type_map[denomination],
                denomination=denomination,
                country=s1.get("church_country", ""),
                address=s1.get("church_address", ""),
                phone=s1.get("church_phone", ""),
                email=s1.get("church_email", ""),
                gps_lat=s1.get("gps_lat"),
                gps_lng=s1.get("gps_lng"),
                is_active=True,
            )

            User = get_user_model()
            user = User.objects.create_user(
                email=s2["email"],
                password=s2["password"],
                first_name=s2["first_name"],
                last_name=s2["last_name"],
                phone=s2.get("phone", ""),
                role="LOCAL_LEADER",
                entity=church,
                is_staff=True,
            )

            chapel_code = f"CP-{uuid.uuid4().hex[:8].upper()}"
            Chapelle.objects.create(
                name=data["chapel_name"],
                code=chapel_code,
                church=church,
                address=data.get("chapel_address", ""),
                city=data.get("chapel_city", ""),
                neighborhood=data.get("chapel_neighborhood", ""),
                country=s1.get("church_country", ""),
                gps_lat=data.get("gps_lat"),
                gps_lng=data.get("gps_lng"),
                leader=user,
                is_active=True,
            )

            church.responsible = user
            church.save(update_fields=["responsible", "updated_at"])

        del session["reg_step1"]
        del session["reg_step2"]

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            "detail": "Compte créé avec succès.",
            "user": {"id": user.id, "email": user.email, "role": user.role},
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)
