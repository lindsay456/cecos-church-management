from django.contrib import admin

from apps.hierarchy.models import EntiteHierarchique


@admin.register(EntiteHierarchique)
class EntiteHierarchiqueAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "entity_type", "denomination", "parent", "country", "is_active"]
    list_filter = ["entity_type", "denomination", "country", "continent", "is_active"]
    search_fields = ["name", "code", "country"]
