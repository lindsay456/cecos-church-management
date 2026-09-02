from rest_framework import serializers

from apps.common.enums import MemberStatus
from apps.members.models import HistoriqueAffectationMembre, Membre
from apps.members.services import detect_duplicate_members


class FlexibleDateField(serializers.DateField):
    def to_internal_value(self, value):
        if value == "" or value is None:
            return None
        return super().to_internal_value(value)


class MembreListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    church_name = serializers.CharField(source="church.name", read_only=True)
    family_name = serializers.CharField(source="family.name", read_only=True)

    class Meta:
        model = Membre
        fields = [
            "id", "member_number", "first_name", "last_name", "full_name",
            "gender", "birth_date", "phone", "email", "status", "status_display",
            "church", "church_name", "family", "family_name", "membership_date",
            "is_active", "created_at",
        ]
        read_only_fields = ["member_number", "created_at"]


class MembreCreateSerializer(serializers.ModelSerializer):
    membership_date = FlexibleDateField(required=False, allow_null=True)
    birth_date = FlexibleDateField(required=False, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True, default='')
    email = serializers.EmailField(required=False, allow_blank=True, default='')

    class Meta:
        model = Membre
        fields = [
            "first_name", "last_name", "gender", "birth_date", "phone", "email",
            "address", "neighborhood", "marital_status", "occupation",
            "emergency_contact_name", "emergency_contact_phone",
            "membership_date", "status", "church", "family",
            "baptism_place", "baptism_date", "baptized_by",
            "consent_email", "consent_whatsapp", "consent_data_processing",
        ]
        extra_kwargs = {
            "church": {"required": False, "allow_null": True},
            "consent_email": {"required": False},
            "consent_whatsapp": {"required": False},
            "consent_data_processing": {"required": False},
        }

    def validate(self, attrs):
        duplicates = detect_duplicate_members(
            first_name=attrs.get("first_name", ""),
            last_name=attrs.get("last_name", ""),
            birth_date=attrs.get("birth_date"),
            phone=attrs.get("phone", ""),
            email=attrs.get("email", ""),
            exclude_id=getattr(self.instance, "pk", None),
        )
        if duplicates.exists():
            dup = duplicates.first()
            raise serializers.ValidationError(
                {"non_field_errors": [
                    f"Membre potentiellement doublon détecté : {dup.full_name} "
                    f"(N°{dup.member_number}). Vérifiez les informations."
                ]}
            )
        return attrs


class MembreDetailSerializer(MembreListSerializer):
    transfer_history = serializers.SerializerMethodField()

    class Meta(MembreListSerializer.Meta):
        fields = MembreListSerializer.Meta.fields + [
            "photo", "occupation", "neighborhood", "address",
            "baptism_place", "baptism_date", "baptized_by",
            "emergency_contact_name", "emergency_contact_phone",
            "consent_email", "consent_whatsapp", "consent_data_processing",
            "updated_at", "transfer_history",
        ]

    def get_transfer_history(self, obj):
        return HistoriqueAffectationSerializer(
            obj.transfer_history.all()[:10], many=True
        ).data


class HistoriqueAffectationSerializer(serializers.ModelSerializer):
    previous_church_name = serializers.CharField(source="previous_church.name", read_only=True)
    new_church_name = serializers.CharField(source="new_church.name", read_only=True)
    requested_by_name = serializers.CharField(source="requested_by.full_name", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.full_name", read_only=True)

    class Meta:
        model = HistoriqueAffectationMembre
        fields = [
            "id", "member", "previous_church", "previous_church_name",
            "new_church", "new_church_name", "transfer_date",
            "transfer_reason", "requested_by", "requested_by_name",
            "approved_by", "approved_by_name", "status", "notes", "created_at",
        ]


class MembreTransferSerializer(serializers.Serializer):
    new_church_id = serializers.IntegerField()
    reason = serializers.CharField(max_length=500, required=False, default="")
    notes = serializers.CharField(required=False, default="")

    def validate_new_church_id(self, value):
        from apps.hierarchy.models import EntiteHierarchique, LOCAL_CHURCH_TYPES
        try:
            church = EntiteHierarchique.objects.get(id=value, entity_type__in=LOCAL_CHURCH_TYPES, is_active=True)
        except EntiteHierarchique.DoesNotExist:
            raise serializers.ValidationError("Église de destination invalide ou inactive.")
        return value
