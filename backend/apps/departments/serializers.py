from rest_framework import serializers

from apps.departments.models import Departement, MembreDepartement, PlanAnnuel


class DepartementListSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    leader_name = serializers.CharField(source="leader.full_name", read_only=True)
    members_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Departement
        fields = [
            "id", "name", "code", "church", "church_name", "department_type",
            "leader", "leader_name", "deputy_leader", "annual_budget",
            "start_date", "end_date", "is_active", "members_count",
        ]
        extra_kwargs = {"church": {"required": False, "allow_null": True}}


class DepartementDetailSerializer(DepartementListSerializer):
    class Meta(DepartementListSerializer.Meta):
        fields = DepartementListSerializer.Meta.fields + ["notes", "updated_at"]


class MembreDepartementSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.full_name", read_only=True)
    member_number = serializers.CharField(source="member.member_number", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = MembreDepartement
        fields = [
            "id", "member", "member_name", "member_number",
            "department", "department_name", "year",
            "role_in_department", "start_date", "end_date", "is_active",
        ]


class PlanAnnuelSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    responsible_name = serializers.CharField(source="responsible.full_name", read_only=True, default="")

    class Meta:
        model = PlanAnnuel
        fields = [
            "id", "department", "department_name", "year", "title", "description",
            "planned_date", "status", "responsible", "responsible_name", "budget",
            "created_at",
        ]
