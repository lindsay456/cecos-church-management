from django.contrib import admin

from apps.members.models import HistoriqueAffectationMembre, Membre


@admin.register(Membre)
class MembreAdmin(admin.ModelAdmin):
    list_display = ["member_number", "first_name", "last_name", "church", "status", "is_active"]
    list_filter = ["status", "gender", "is_active"]
    search_fields = ["first_name", "last_name", "member_number", "email"]


@admin.register(HistoriqueAffectationMembre)
class HistoriqueAffectationAdmin(admin.ModelAdmin):
    list_display = ["member", "previous_church", "new_church", "transfer_date", "status"]
    list_filter = ["status"]
