from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions
from rest_framework import serializers

from apps.common.enums import UserRole

User = get_user_model()


class UserListSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    entity_name = serializers.CharField(source="entity.name", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "role_display",
            "entity",
            "entity_name",
            "is_active",
            "last_login",
            "created_at",
        ]
        read_only_fields = ["last_login", "created_at"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "password",
            "role",
            "entity",
            "is_active",
        ]

    def validate_email(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cet email est deja utilise.")
        return value.lower()

    def validate_password(self, value):
        try:
            validate_password(value)
        except django_exceptions.ValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def validate_role(self, value):
        if self.context.get("request") and value == UserRole.SUPER_ADMIN:
            raise serializers.ValidationError(
                "Le rôle SUPER_ADMIN ne peut être attribué que via l'administration."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone", "role", "entity", "is_active"]

    def update(self, instance, validated_data):
        old_role = instance.role
        instance = super().update(instance, validated_data)
        if old_role != instance.role:
            from apps.audit.services import audit_log
            from apps.common.enums import AuditAction

            audit_log(
                action=AuditAction.ROLE_CHANGE,
                app_label="accounts",
                model_name="user",
                object_id=instance.pk,
                object_repr=str(instance),
                old_values={"role": old_role},
                new_values={"role": instance.role},
                user=self.context["request"].user,
                request=self.context["request"],
            )
        return instance


class MeSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    entity_name = serializers.CharField(source="entity.name", read_only=True)
    entity_code = serializers.CharField(source="entity.code", read_only=True)
    entity_type = serializers.CharField(source="entity.entity_type", read_only=True)
    entity_denomination = serializers.CharField(source="entity.denomination", read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
            "role_display",
            "entity",
            "entity_name",
            "entity_code",
            "entity_type",
            "entity_denomination",
            "is_active",
            "last_login",
            "created_at",
        ]
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["entity_scope"] = instance.entity_id or None
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("L'ancien mot de passe est incorrect.")
        return value

    def validate_new_password(self, value):
        user = self.context["request"].user
        try:
            validate_password(value, user)
        except django_exceptions.ValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except django_exceptions.ValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value


class UserRoleAssignmentSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    scope_name = serializers.CharField(source="scope_entity.name", read_only=True)
    assigned_by_name = serializers.CharField(source="assigned_by.full_name", read_only=True, default="")

    class Meta:
        from apps.accounts.models import UserRoleAssignment

        model = UserRoleAssignment
        fields = [
            "id", "user", "user_email", "user_name", "role_code",
            "scope_entity", "scope_name", "can_manage_descendants",
            "is_active", "starts_at", "ends_at", "assigned_by", "assigned_by_name",
            "created_at",
        ]
        read_only_fields = ["assigned_by", "created_at"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    first_name = serializers.CharField(max_length=128)
    last_name = serializers.CharField(max_length=128)
    phone = serializers.CharField(max_length=30, required=False, default="")
    church_name = serializers.CharField(max_length=255, help_text="Nom de l'eglise locale")
    church_code = serializers.CharField(max_length=50, required=False, default="")
    denomination = serializers.ChoiceField(
        choices=[("ADVENTIST", "Adventiste"), ("CATHOLIC", "Catholique"), ("PROTESTANT", "Protestante")],
        default="ADVENTIST",
    )
    country = serializers.CharField(max_length=100, required=False, default="Cameroun")
    city = serializers.CharField(max_length=128, required=False, default="")
    address = serializers.CharField(max_length=255, required=False, default="")
    chapel_name = serializers.CharField(max_length=255, required=False, default="")
    chapel_code = serializers.CharField(max_length=50, required=False, default="")
    chapel_city = serializers.CharField(max_length=128, required=False, default="")
    chapel_address = serializers.CharField(max_length=255, required=False, default="")

    def validate_email(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cet email est deja utilise.")
        return value.lower()

    def validate_password(self, value):
        try:
            validate_password(value)
        except django_exceptions.ValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def validate(self, attrs):
        if not attrs.get("church_name"):
            raise serializers.ValidationError({"church_name": "Le nom de l'eglise est obligatoire."})
        return attrs
