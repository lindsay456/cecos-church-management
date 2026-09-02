from django.contrib import admin

from apps.families.models import Famille


@admin.register(Famille)
class FamilleAdmin(admin.ModelAdmin):
    list_display = ["family_code", "name", "church", "status"]
    list_filter = ["status", "church"]
    search_fields = ["name", "family_code"]
