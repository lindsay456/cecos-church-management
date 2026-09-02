from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.finance.views import (
    BudgetViewSet,
    CategorieFinanciereViewSet,
    DepenseViewSet,
    FinancialReportView,
    LigneBudgetViewSet,
    RecetteViewSet,
)

router = DefaultRouter()
router.register("financial-categories", CategorieFinanciereViewSet, basename="financial-category")
router.register("recettes", RecetteViewSet, basename="recette")
router.register("depenses", DepenseViewSet, basename="depense")
router.register("budgets", BudgetViewSet, basename="budget")
router.register("budget-lines", LigneBudgetViewSet, basename="budget-line")

urlpatterns = [
    path("", include(router.urls)),
    path("financial-report/", FinancialReportView.as_view(), name="financial-report"),
]
