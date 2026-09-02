"""Journal d'audit append-only."""
from __future__ import annotations

from django.db import models

from apps.common.enums import AuditAction
from apps.common.models import TimeStampedModel


class JournalAudit(TimeStampedModel):
    """Trace immuable des opérations sensibles.

    L'audit est append-only pour les utilisateurs ordinaires : aucune
    suppression ni modification exposée via l'API.
    """

    user = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
        verbose_name="Utilisateur",
    )
    action = models.CharField(max_length=40, choices=AuditAction.choices, verbose_name="Action")
    app_label = models.CharField(max_length=100, verbose_name="Application")
    model_name = models.CharField(max_length=100, verbose_name="Modèle")
    object_id = models.CharField(max_length=50, null=True, blank=True, verbose_name="Objet ID")
    object_repr = models.CharField(max_length=255, null=True, blank=True, verbose_name="Représentation")
    old_values = models.JSONField(null=True, blank=True, verbose_name="Anciennes valeurs")
    new_values = models.JSONField(null=True, blank=True, verbose_name="Nouvelles valeurs")
    reason = models.CharField(max_length=500, null=True, blank=True, verbose_name="Motif")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="Adresse IP")
    user_agent = models.CharField(max_length=500, null=True, blank=True, verbose_name="Navigateur")

    class Meta:
        verbose_name = "Journal d'audit"
        verbose_name_plural = "Journal d'audit"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["app_label", "model_name", "object_id"]),
            models.Index(fields=["action"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {self.action} {self.app_label}.{self.model_name}"
