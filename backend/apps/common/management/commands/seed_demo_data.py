"""Commande de seeding : python manage.py seed_demo_data

Donnees concentrees sur une seule eglise catholique avec 5 membres,
3 familles, 4 responsables, et des chapelles GPS pour la carte.
"""
from __future__ import annotations

import random
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.common.enums import (
    Denomination, DonationStatus, DonationType, EntityType, EventStatus,
    EventType, FinancialStatus, Gender, MaritalStatus,
    MemberStatus, PastoralStatus, PaymentMethod, PresenceStatus,
    ServiceType, UserRole, VisitorStatus, DepartmentType,
)
from apps.hierarchy.models import EntiteHierarchique

User = get_user_model()

CHURCH_CODE = "CH-CAT-001"
PASSWORD = "Admin@2024"


class Command(BaseCommand):
    help = "Cree les donnees de demonstration (Catholic unique)"

    def handle(self, *args, **options):
        self.stdout.write("Creation des donnees de demonstration (Catholique)...")

        # ===== EGLISE CATHOLIQUE =====
        diocese, _ = _entity("Diocese de Yaounde", "DIO-YDE-001", EntityType.DIOCESE,
            Denomination.CATHOLIC, country="Cameroun", city="Yaounde")
        church, _ = _entity("Paroisse Notre-Dame de Grace", CHURCH_CODE, EntityType.PARISH,
            Denomination.CATHOLIC, parent=diocese, country="Cameroun", city="Yaounde",
            gps_lat=Decimal("3.8734"), gps_lng=Decimal("11.5167"))

        # ===== 4 EQUIPIERS avec mot de passe =====
        leader, _ = _user("responsable.cat@gmail.com", "Jean", "Kamga",
            UserRole.LOCAL_LEADER, church, PASSWORD)
        treasurer, _ = _user("tresorier.cat@gmail.com", "Claire", "Tchinda",
            UserRole.TREASURER, church, PASSWORD)
        chap_leader, _ = _user("chapelle.bastos@gmail.com", "Paul", "Nkoulou",
            UserRole.CHAPEL_LEADER, church, PASSWORD)
        pastoral, _ = _user("pastoral.cat@gmail.com", "Marie", "Atangana",
            UserRole.PASTORAL_LEADER, church, PASSWORD)

        # ===== 3 CHAPELLES avec GPS =====
        from apps.churches.models import Chapelle
        chap1, _ = Chapelle.objects.get_or_create(
            code="CAT-CH001", church=church,
            defaults={"name": "Chapelle Notre-Dame de Bastos",
                      "leader": chap_leader,
                      "gps_lat": Decimal("3.8845"), "gps_lng": Decimal("11.4920"),
                      "city": "Yaounde", "address": "Quartier Bastos",
                      "capacity": 200, "worship_schedule": "Dimanche 8h30, Mercredi 18h"})
        chap2, _ = Chapelle.objects.get_or_create(
            code="CAT-CH002", church=church,
            defaults={"name": "Chapelle Saint-Pierre de Mokolo",
                      "leader": leader,
                      "gps_lat": Decimal("3.8667"), "gps_lng": Decimal("11.5089"),
                      "city": "Yaounde", "address": "Marche Mokolo",
                      "capacity": 150, "worship_schedule": "Dimanche 10h, Vendredi 18h"})
        chap3, _ = Chapelle.objects.get_or_create(
            code="CAT-CH003", church=church,
            defaults={"name": "Chapelle Sacre-Coeur de Nlongkak",
                      "leader": pastoral,
                      "gps_lat": Decimal("3.8750"), "gps_lng": Decimal("11.5200"),
                      "city": "Yaounde", "address": "Avenue Nlongkak",
                      "capacity": 120, "worship_schedule": "Dimanche 9h"})

        # ===== 5 MEMBRES =====
        from apps.members.models import Membre
        members_data = [
            ("Marie", "Tchinda", Gender.FEMALE, "1989-05-20", MaritalStatus.MARRIED, chap1),
            ("Paul", "Nguele", Gender.MALE, "1983-10-11", MaritalStatus.MARRIED, chap1),
            ("Sophie", "Din", Gender.FEMALE, "1994-01-28", MaritalStatus.SINGLE, chap2),
            ("Bruno", "Ekotto", Gender.MALE, "1985-07-22", MaritalStatus.MARRIED, chap2),
            ("Estelle", "Mbida", Gender.FEMALE, "1995-06-12", MaritalStatus.SINGLE, chap3),
        ]
        members = []
        for i, (fn, ln, g, bd, ms, ch) in enumerate(members_data, 1):
            m, _ = Membre.objects.get_or_create(
                member_number=f"MEM{i:06d}",
                defaults={
                    "first_name": fn, "last_name": ln, "gender": g,
                    "birth_date": date.fromisoformat(bd),
                    "phone": f"+2376{random.randint(10000000, 99999999)}",
                    "marital_status": ms, "membership_date": date(2022, 1, 15),
                    "status": MemberStatus.ACTIVE, "church": church,
                    "chapel": ch, "consent_email": True,
                },
            )
            members.append(m)
        self.stdout.write(f"  [OK] 5 membres")

        # ===== 3 FAMILLES =====
        from apps.families.models import Famille
        fam1, _ = Famille.objects.get_or_create(
            family_code="FAM001", defaults={
                "name": "Famille Nguele-Tchinda", "church": church,
                "household_head": members[1], "address": "Bastos, Yaounde"})
        fam2, _ = Famille.objects.get_or_create(
            family_code="FAM002", defaults={
                "name": "Famille Ekotto", "church": church,
                "household_head": members[3], "address": "Mokolo, Yaounde"})
        fam3, _ = Famille.objects.get_or_create(
            family_code="FAM003", defaults={
                "name": "Famille Din-Mbida", "church": church,
                "household_head": members[2], "address": "Nlongkak, Yaounde"})
        members[0].family = fam1
        members[1].family = fam1
        members[2].family = fam3
        members[3].family = fam2
        members[4].family = fam3
        Membre.objects.bulk_update(members, ["family"])
        self.stdout.write(f"  [OK] 3 familles")

        # ===== DEPARTEMENT =====
        from apps.departments.models import Departement, MembreDepartement
        dept_music, _ = Departement.objects.get_or_create(
            code="DM-MUS-001", defaults={
                "name": "Chorale Notre-Dame", "church": church,
                "department_type": DepartmentType.MUSIC,
                "leader": members[0], "start_date": date(2022, 1, 1)})
        for m in [members[0], members[2], members[4]]:
            MembreDepartement.objects.get_or_create(
                member=m, department=dept_music, year=2024,
                defaults={"start_date": date(2024, 1, 1), "role_in_department": "Chorale"})

        # ===== SESSIONS DE CULTE (6 semaines) =====
        from apps.attendance.models import SessionCulte, PresenceMembre
        for i in range(6):
            d = date.today() - timedelta(days=7 * i)
            sess, _ = SessionCulte.objects.get_or_create(
                church=church, date=d, service_type=ServiceType.SUNDAY,
                defaults={"men_count": 30 + i * 3, "women_count": 40 + i * 2,
                          "children_count": 10 + i, "visitors_count": 2 + i % 3,
                          "chapel": chap1})
            for m in random.sample(members, min(4, len(members))):
                PresenceMembre.objects.get_or_create(
                    session=sess, member=m,
                    defaults={"status": PresenceStatus.PRESENT})

        # ===== EVENEMENTS =====
        from apps.events.models import Evenement
        from django.utils import timezone
        Evenement.objects.get_or_create(
            title="Culte de Pentecote", church=church,
            defaults={"event_type": EventType.WORSHIP,
                      "start_datetime": timezone.now() + timedelta(days=5),
                      "end_datetime": timezone.now() + timedelta(days=5, hours=2),
                      "status": EventStatus.PUBLISHED, "location": "Chapelle Bastos"})
        Evenement.objects.get_or_create(
            title="Retraite spirituelle", church=church,
            defaults={"event_type": EventType.YOUTH,
                      "start_datetime": timezone.now() + timedelta(days=14),
                      "end_datetime": timezone.now() + timedelta(days=16),
                      "status": EventStatus.PLANNED, "location": "Centre diocesain"})

        # ===== VISITEUR =====
        from apps.visitors.models import Visiteur
        Visiteur.objects.get_or_create(
            phone="+237690001122", church=church,
            defaults={"first_name": "Claire", "last_name": "Manuela",
                      "first_visit_date": date.today() - timedelta(days=10),
                      "wants_follow_up": True, "consent_contact": True,
                      "follow_up_status": VisitorStatus.TO_CONTACT})

        # ===== FINANCES =====
        from apps.finance.models import CategorieFinanciere, Recette, Depense, Budget, LigneBudget
        cat_tithe, _ = CategorieFinanciere.objects.get_or_create(code="CAT-TITHE",
            defaults={"name": "Dimes", "category_type": "INCOME"})
        cat_offering, _ = CategorieFinanciere.objects.get_or_create(code="CAT-OFF",
            defaults={"name": "Offrandes", "category_type": "INCOME"})
        cat_rent, _ = CategorieFinanciere.objects.get_or_create(code="CAT-RENT",
            defaults={"name": "Loyer", "category_type": "EXPENSE"})
        cat_electric, _ = CategorieFinanciere.objects.get_or_create(code="CAT-ELEC",
            defaults={"name": "Electricite", "category_type": "EXPENSE"})

        for i in range(6):
            d = date.today() - timedelta(days=30 * i)
            Recette.objects.get_or_create(church=church, category=cat_tithe, date=d,
                defaults={"amount": Decimal(f"{random.randint(80000, 200000)}"),
                          "status": FinancialStatus.APPROVED, "created_by": treasurer,
                          "approved_by": treasurer, "source": "Dimes mensuelles"})
            Recette.objects.get_or_create(church=church, category=cat_offering, date=d,
                defaults={"amount": Decimal(f"{random.randint(30000, 80000)}"),
                          "status": FinancialStatus.APPROVED, "created_by": treasurer,
                          "approved_by": treasurer, "source": "Offrandes culte"})
            Depense.objects.get_or_create(church=church, category=cat_rent, date=d,
                defaults={"amount": Decimal("75000"), "status": FinancialStatus.APPROVED,
                          "created_by": treasurer, "approved_by": treasurer,
                          "beneficiary": "Proprietaire"})

        budget, _ = Budget.objects.get_or_create(church=church, fiscal_year=2025,
            defaults={"name": "Budget 2025", "status": FinancialStatus.APPROVED,
                      "created_by": treasurer})
        LigneBudget.objects.get_or_create(budget=budget, category=cat_rent,
            defaults={"planned_amount": Decimal("900000")})

        # ===== DONS =====
        from apps.donations.models import Don
        for i, m in enumerate(members, 1):
            Don.objects.get_or_create(donation_number=f"DON{i:06d}",
                defaults={"member": m, "church": church,
                    "donation_type": DonationType.TITHE,
                    "amount": Decimal(f"{random.randint(15000, 60000)}"),
                    "donation_date": date.today() - timedelta(days=random.randint(0, 30)),
                    "status": DonationStatus.VALIDATED, "recorded_by": treasurer,
                    "validated_by": treasurer, "payment_method": PaymentMethod.CASH})

        # ===== SUIVI PASTORAL =====
        from apps.pastoral.models import SuiviPastoral
        SuiviPastoral.objects.get_or_create(
            member=members[2],
            defaults={"assigned_to": pastoral, "church": church,
                      "reason": "Accompagnement spirituel",
                      "action_type": "SPIRITUAL_SUPPORT", "action_date": date.today(),
                      "status": PastoralStatus.OPEN, "created_by": pastoral})
        SuiviPastoral.objects.get_or_create(
            member=members[4],
            defaults={"assigned_to": pastoral, "church": church,
                      "reason": "Integration paroissiale",
                      "action_type": "SPIRITUAL_SUPPORT", "action_date": date.today(),
                      "status": PastoralStatus.IN_PROGRESS, "created_by": pastoral})

        self.stdout.write(self.style.SUCCESS("\n[OK] Donnees de demonstration creees!"))
        self.stdout.write("")
        self.stdout.write("=" * 50)
        self.stdout.write(" COMPTES DE DEMONSTRATION (tous: Admin@2024)")
        self.stdout.write("=" * 50)
        self.stdout.write(f"  Local Leader:   responsable.cat@gmail.com")
        self.stdout.write(f"  Tresorier:      tresorier.cat@gmail.com")
        self.stdout.write(f"  Resp. Chapelle: chapelle.bastos@gmail.com")
        self.stdout.write(f"  Resp. Pastoral: pastoral.cat@gmail.com")
        self.stdout.write(f"  Super-admin:    admin@gmail.com")
        self.stdout.write(f"  Mot de passe:   Admin@2024")


def _entity(name, code, entity_type, denomination, parent=None, **kwargs):
    return EntiteHierarchique.objects.get_or_create(
        code=code,
        defaults={"name": name, "entity_type": entity_type, "denomination": denomination,
                  "parent": parent, "is_active": True, **kwargs})


def _user(email, first_name, last_name, role, entity, password=PASSWORD):
    user, created = User.objects.get_or_create(
        email=email,
        defaults={"first_name": first_name, "last_name": last_name,
                  "role": role, "entity": entity,
                  "is_staff": role in (UserRole.SUPER_ADMIN, UserRole.LOCAL_LEADER)})
    if created:
        user.set_password(password)
        user.save()
    return user, created
