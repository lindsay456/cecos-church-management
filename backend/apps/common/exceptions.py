"""Gestion centralisée des exceptions API."""
from __future__ import annotations

import logging

from rest_framework.views import exception_handler

logger = logging.getLogger("ecclesia")


def api_exception_handler(exc, context):
    """Handler DRF personnalisé : log les erreurs 5xx, format stable pour les erreurs."""
    response = exception_handler(exc, context)
    if response is None:
        logger.exception("Exception non gérée : %s", exc)
        return response
    detail = response.data
    if isinstance(detail, dict) and "detail" in detail and len(detail) == 1:
        # Les erreurs génériques DRF sont exposées sous forme homogène
        response.data = {"errors": [{"code": response.status_code, "message": detail["detail"]}]}
    return response
