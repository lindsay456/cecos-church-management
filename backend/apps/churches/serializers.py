from rest_framework import serializers

from apps.churches.models import Chapelle
from apps.hierarchy.models import EntiteHierarchique


class ChurchSerializer(serializers.ModelSerializer):
    entity_type_display = serializers.CharField(source="get_entity_type_display", read_only=True)
    denomination_display = serializers.CharField(source="get_denomination_display", read_only=True)
    parent_name = serializers.CharField(source="parent.name", read_only=True)
    responsible_name = serializers.CharField(source="responsible.full_name", read_only=True)
    members_count = serializers.IntegerField(read_only=True)
    families_count = serializers.IntegerField(read_only=True)
    chapels_count = serializers.SerializerMethodField()

    class Meta:
        model = EntiteHierarchique
        fields = [
            "id", "name", "code", "entity_type", "entity_type_display",
            "denomination", "denomination_display", "parent", "parent_name",
            "responsible", "responsible_name", "country", "continent", "city",
            "address", "phone", "email", "gps_lat", "gps_lng",
            "is_active", "members_count", "families_count", "chapels_count",
        ]

    def get_chapels_count(self, obj):
        if hasattr(obj, 'chapels'):
            return obj.chapels.filter(is_active=True).count()
        return 0


class ChurchDetailSerializer(ChurchSerializer):
    class Meta(ChurchSerializer.Meta):
        fields = ChurchSerializer.Meta.fields + ["updated_at"]


class ChapelleSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    leader_name = serializers.CharField(source="leader.full_name", read_only=True)
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Chapelle
        fields = [
            "id", "name", "code", "church", "church_name", "address",
            "city", "neighborhood", "country", "phone",
            "leader", "leader_name", "capacity", "worship_schedule", "observations",
            "gps_lat", "gps_lng",
            "is_active", "members_count", "created_at",
        ]
        extra_kwargs = {"church": {"required": False, "allow_null": True}}

    def get_members_count(self, obj):
        return obj.church.members.filter(is_active=True).count()


class RegistrationStep1Serializer(serializers.Serializer):
    church_name = serializers.CharField(max_length=255)
    denomination = serializers.ChoiceField(choices=[
        ("CATHOLIC", "Catholique"),
        ("PROTESTANT", "Protestante"),
        ("ADVENTIST", "Adventiste"),
    ])
    church_address = serializers.CharField(max_length=255, required=False, default="")
    church_city = serializers.CharField(max_length=128, required=False, default="")
    church_country = serializers.CharField(max_length=100, required=False, default="")
    church_phone = serializers.CharField(max_length=30, required=False, default="")
    church_email = serializers.EmailField(required=False, default="")
    gps_lat = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    gps_lng = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)


class RegistrationStep2Serializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=128)
    last_name = serializers.CharField(max_length=128)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30, required=False, default="")
    password = serializers.CharField(write_only=True, min_length=8)
    photo = serializers.ImageField(required=False, allow_null=True)

    def validate_email(self, value):
        if not value.lower().endswith("@gmail.com"):
            raise serializers.ValidationError(
                "Seules les adresses email @gmail.com sont acceptees."
            )
        return value.lower()


class RegistrationStep3Serializer(serializers.Serializer):
    chapel_name = serializers.CharField(max_length=255)
    chapel_address = serializers.CharField(max_length=255, required=False, default="")
    chapel_city = serializers.CharField(max_length=128, required=False, default="")
    chapel_neighborhood = serializers.CharField(max_length=128, required=False, default="")
    gps_lat = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    gps_lng = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
