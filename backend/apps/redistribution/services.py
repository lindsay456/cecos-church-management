"""Moteur de redistribution comptable."""
from __future__ import annotations

from decimal import Decimal

from django.db import transaction

from apps.audit.services import audit_log
from apps.common.enums import (
    AuditAction, Denomination, DonationStatus, RuleDestinationType, RuleStatus,
)


def find_active_rule(donation):
    """Trouve la règle de redistribution active pour un don donné."""
    from apps.redistribution.models import RegleReversement
    from apps.common.enums import EntityType
    from apps.hierarchy.models import LOCAL_CHURCH_TYPES

    church = donation.church
    if church.entity_type not in LOCAL_CHURCH_TYPES:
        return None

    qs = RegleReversement.objects.filter(
        denomination=church.denomination,
        source_entity_type=church.entity_type,
        donation_type=donation.donation_type,
        status=RuleStatus.ACTIVE,
        effective_start_date__lte=donation.donation_date,
    ).filter(
        effective_end_date__isnull=True
    ) | RegleReversement.objects.filter(
        denomination=church.denomination,
        source_entity_type=church.entity_type,
        donation_type=donation.donation_type,
        status=RuleStatus.ACTIVE,
        effective_start_date__lte=donation.donation_date,
        effective_end_date__gte=donation.donation_date,
    )
    return qs.order_by("-version").first()


@transaction.atomic
def compute_redistributions(don):
    """Calcule les redistributions pour un don validé.

    - Catholique / Protestante : aucune redistribution hiérarchique.
    - Adventiste : applique la règle active.
    Transactionnel : si une ligne échoue, le don n'est pas validé.
    """
    from apps.redistribution.models import Redistribution

    if don.church.denomination != Denomination.ADVENTIST:
        return

    rule = find_active_rule(don)
    if rule is None:
        return

    if not rule.is_complete:
        raise ValueError(
            f"La règle '{rule.name}' n'est pas complète (total : {rule.total_percentage}%)."
        )

    lines = rule.lines.order_by("calculation_order")
    total = Decimal("0")
    redistributions = []

    for line in lines:
        pct = line.percentage
        amount = (don.amount * pct / Decimal("100")).quantize(Decimal("0.01"))
        retained = don.amount - amount

        redist = Redistribution(
            donation=don,
            rule_version=rule,
            source_entity=don.church,
            destination_type=line.destination_type,
            destination_entity=line.target_entity,
            designated_fund=line.designated_fund,
            received_amount=don.amount,
            applied_percentage=pct,
            retained_amount=retained,
            transferred_amount=amount,
        )
        redistributions.append(redist)
        total += pct

    Redistribution.objects.bulk_create(redistributions)

    audit_log(
        action=AuditAction.CREATE,
        app_label="redistribution",
        model_name="redistribution",
        object_id=don.pk,
        object_repr=f"Redistribution don {don.donation_number}",
        new_values={
            "amount": str(don.amount),
            "rule": rule.name,
            "lines_count": len(redistributions),
        },
    )
