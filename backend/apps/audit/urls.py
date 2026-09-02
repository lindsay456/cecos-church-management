from rest_framework.routers import DefaultRouter

from apps.audit.views import JournalAuditViewSet

router = DefaultRouter()
router.register("audit-logs", JournalAuditViewSet, basename="audit-log")

urlpatterns = router.urls
