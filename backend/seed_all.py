# -*- coding: utf-8 -*-
"""Script de seeding complet pour CECOS Church Management."""
import os, sys, django, random

# Fix Windows console encoding
import io, codecs
if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass
from datetime import date, datetime, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from apps.hierarchy.models import EntiteHierarchique
from apps.churches.models import Chapelle
from apps.members.models import Membre, HistoriqueAffectationMembre
from apps.families.models import Famille
from apps.departments.models import Departement, MembreDepartement, PlanAnnuel
from apps.events.models import Evenement
from apps.attendance.models import SessionCulte, PresenceMembre
from apps.visitors.models import Visiteur
from apps.pastoral.models import SuiviPastoral
from apps.finance.models import CategorieFinanciere, Recette, Depense, Budget, LigneBudget
from apps.donations.models import Don, Recu
from apps.common.enums import (
    EntityType, Denomination, UserRole, MemberStatus, Gender, MaritalStatus,
    DepartmentType, EventType, EventStatus, ServiceType, FinancialStatus,
    BudgetStatus, PaymentMethod, DonationType, DonationStatus, PastoralActionType,
    PastoralStatus, VisitorStatus, FamilyStatus, CategoryType,
)

User = get_user_model()

print("=" * 60)
print("  CECOS — Seed complet de la base de données")
print("=" * 60)

# ── 1. ENTITÉS HIÉRARCHIQUES ──────────────────────────────────────────
print("\n[1/12] Entités hiérarchiques...")

gc, _ = EntiteHierarchique.objects.get_or_create(
    code="GC-AD", defaults=dict(
        name="Conférence Générale Adventiste", entity_type=EntityType.GENERAL_CONFERENCE,
        denomination=Denomination.ADVENTIST, country="USA", city="Silver Spring",
        gps_lat=Decimal("38.9907"), gps_lng=Decimal("-77.0261"),
    )
)
div_af, _ = EntiteHierarchique.objects.get_or_create(
    code="DIV-AF", defaults=dict(
        name="Division de l'Afrique Centrale", entity_type=EntityType.DIVISION,
        denomination=Denomination.ADVENTIST, parent=gc, country="Cameroun",
        city="Yaoundé", gps_lat=Decimal("3.8480"), gps_lng=Decimal("11.4940"),
    )
)
union_cem, _ = EntiteHierarchique.objects.get_or_create(
    code="UN-CEM", defaults=dict(
        name="Union du Cameroun Est-Méridional", entity_type=EntityType.UNION,
        denomination=Denomination.ADVENTIST, parent=div_af, country="Cameroun",
        city="Yaoundé", gps_lat=Decimal("3.8700"), gps_lng=Decimal("11.5100"),
    )
)
fed_cen, _ = EntiteHierarchique.objects.get_or_create(
    code="FED-CEN", defaults=dict(
        name="Fédération Centre", entity_type=EntityType.FEDERATION,
        denomination=Denomination.ADVENTIST, parent=union_cem, country="Cameroun",
        city="Yaoundé", gps_lat=Decimal("3.8900"), gps_lng=Decimal("11.5200"),
    )
)
eglise1, _ = EntiteHierarchique.objects.get_or_create(
    code="EC-001", defaults=dict(
        name="Église de Bastos", entity_type=EntityType.LOCAL_CHURCH,
        denomination=Denomination.ADVENTIST, parent=fed_cen, country="Cameroun",
        city="Yaoundé", address="Quartier Bastos, Rue 1.234",
        phone="+23722233445", email="bastos@cecos.cm",
        gps_lat=Decimal("3.8950"), gps_lng=Decimal("11.5050"),
    )
)
eglise2, _ = EntiteHierarchique.objects.get_or_create(
    code="EC-002", defaults=dict(
        name="Église de Mvog-Ada", entity_type=EntityType.LOCAL_CHURCH,
        denomination=Denomination.ADVENTIST, parent=fed_cen, country="Cameroun",
        city="Yaoundé", address="Quartier Mvog-Ada, Avenue Réunification",
        phone="+23722255667", email="mvogada@cecos.cm",
        gps_lat=Decimal("3.8650"), gps_lng=Decimal("11.5300"),
    )
)
eglise3, _ = EntiteHierarchique.objects.get_or_create(
    code="EC-003", defaults=dict(
        name="Église de Messa", entity_type=EntityType.LOCAL_CHURCH,
        denomination=Denomination.ADVENTIST, parent=fed_cen, country="Cameroun",
        city="Yaoundé", address="Quartier Messa, Rue de l'Église",
        phone="+23722277889", email="messa@cecos.cm",
        gps_lat=Decimal("3.8820"), gps_lng=Decimal("11.4980"),
    )
)

# Catholique
diocese, _ = EntiteHierarchique.objects.get_or_create(
    code="DIO-YDE", defaults=dict(
        name="Archidiocèse de Yaoundé", entity_type=EntityType.DIOCESE,
        denomination=Denomination.CATHOLIC, country="Cameroun", city="Yaoundé",
        gps_lat=Decimal("3.8750"), gps_lng=Decimal("11.5150"),
    )
)
paroisse, _ = EntiteHierarchique.objects.get_or_create(
    code="PAR-MVZ", defaults=dict(
        name="Paroisse Mvolyé", entity_type=EntityType.PARISH,
        denomination=Denomination.CATHOLIC, parent=diocese, country="Cameroun",
        city="Yaoundé", address="Quartier Mvolyé",
        gps_lat=Decimal("3.8700"), gps_lng=Decimal("11.5100"),
    )
)

# Protestante
union_prot, _ = EntiteHierarchique.objects.get_or_create(
    code="UP-CAM", defaults=dict(
        name="Union Protestante du Cameroun", entity_type=EntityType.PROTESTANT_UNION,
        denomination=Denomination.PROTESTANT, country="Cameroun", city="Douala",
    )
)
eglise_prot, _ = EntiteHierarchique.objects.get_or_create(
    code="EP-BST", defaults=dict(
        name="Église Protestante Bastos", entity_type=EntityType.PROTESTANT_CHURCH,
        denomination=Denomination.PROTESTANT, parent=union_prot, country="Cameroun",
        city="Yaoundé", address="Quartier Bastos Nord",
        gps_lat=Decimal("3.8980"), gps_lng=Decimal("11.5030"),
    )
)

all_local_churches = [eglise1, eglise2, eglise3, paroisse, eglise_prot]
print(f"   → {EntiteHierarchique.objects.count()} entités créées")

# ── 2. CHAPELLES ──────────────────────────────────────────────────────
print("\n[2/12] Chapelles...")

chapelles_data = [
    ("Chapelle Emmaus", "CH-EM01", eglise1, "Bastos Nord", "3.8850", "11.5050", 250, "Sabbat 09h00, Dimanche 08h30"),
    ("Chapelle Bethanie", "CH-BT01", eglise1, "Mokolo", "3.8730", "11.5170", 180, "Sabbat 09h00"),
    ("Chapelle Cana", "CH-CN01", eglise2, "Mvog-Ada Sud", "3.8580", "11.5290", 200, "Sabbat 09h00, Mercredi 18h00"),
    ("Chapelle Ephesiens", "CH-EP01", eglise2, "Biyem-Assi", "3.8410", "11.5160", 150, "Sabbat 09h00"),
    ("Chapelle Betel", "CH-BT02", eglise3, "Messa II", "3.8750", "11.4980", 170, "Sabbat 09h00, Vendredi 18h30"),
]

chapelle_objs = []
for name, code, church, hood, lat, lng, cap, sched in chapelles_data:
    obj, _ = Chapelle.objects.get_or_create(
        code=code, church=church, defaults=dict(
            name=name, neighborhood=hood, city="Yaoundé", country="Cameroun",
            gps_lat=Decimal(lat), gps_lng=Decimal(lng), capacity=cap,
            worship_schedule=sched,
        )
    )
    chapelle_objs.append(obj)
print(f"   → {Chapelle.objects.count()} chapelles créées")

# ── 3. UTILISATEURS ───────────────────────────────────────────────────
print("\n[3/12] Utilisateurs...")

users_data = [
    ("admin@gmail.com", "Admin", "CECOS", UserRole.LOCAL_LEADER, None),
    ("jean.mbarga@cecos.cm", "Jean", "Mbarga", UserRole.LOCAL_LEADER, eglise1),
    ("pauline.ngono@cecos.cm", "Pauline", "Ngono", UserRole.TREASURER, eglise1),
    ("samuel.atanga@cecos.cm", "Samuel", "Atanga", UserRole.PASTORAL_LEADER, eglise1),
    ("grace.eboutou@cecos.cm", "Grace", "Eboutou", UserRole.DEPARTMENT_LEADER, eglise1),
    ("david.nkoulou@cecos.cm", "David", "Nkoulou", UserRole.MEMBER, eglise1),
    ("marie.kamga@cecos.cm", "Marie", "Kamga", UserRole.TREASURER, eglise2),
    ("pierre.zoba@cecos.cm", "Pierre", "Zoba", UserRole.LOCAL_LEADER, eglise2),
    ("beatrice.fotso@cecos.cm", "Béatrice", "Fotso", UserRole.MEMBER, eglise3),
    ("emmanuel.tchidjou@cecos.cm", "Emmanuel", "Tchidjou", UserRole.MEMBER, eglise1),
    ("sylvie.Obama@cecos.cm", "Sylvie", "Obama", UserRole.AUDITOR, fed_cen),
    ("lucien.mbida@cecos.cm", "Lucien", "Mbida", UserRole.MEMBER, eglise2),
    ("celine.bikoro@cecos.cm", "Céline", "Bikoro", UserRole.DEPARTMENT_LEADER, eglise3),
    ("andre.mvondo@cecos.cm", "André", "Mvondo", UserRole.MEMBER, eglise1),
    ("therese.obona@cecos.cm", "Thérèse", "Obona", UserRole.MEMBER, eglise2),
]

user_objs = {}
for email, fn, ln, role, entity in users_data:
    obj, created = User.objects.get_or_create(
        email=email,
        defaults=dict(
            first_name=fn, last_name=ln, role=role, entity=entity,
            is_staff=(role in (UserRole.LOCAL_LEADER, UserRole.TREASURER)),
        )
    )
    if created:
        obj.set_password("Admin@2024")
        obj.save()
    user_objs[email] = obj
print(f"   → {User.objects.count()} utilisateurs créés")

# ── 4. FAMILLES ────────────────────────────────────────────────────────
print("\n[4/12] Familles...")

familles_data = [
    ("Famille Mbarga", "FAM-001", eglise1, "+23769911223"),
    ("Famille Ngono", "FAM-002", eglise1, "+23769944556"),
    ("Famille Atanga", "FAM-003", eglise1, "+23769977889"),
    ("Famille Kamga", "FAM-004", eglise2, "+23767711223"),
    ("Famille Zoba", "FAM-005", eglise2, "+23767744556"),
    ("Famille Fotso", "FAM-006", eglise3, "+23765511223"),
    ("Famille Nkoulou", "FAM-007", eglise1, "+23769933445"),
    ("Famille Eboutou", "FAM-008", eglise1, "+23769922334"),
]

fam_objs = []
for name, code, church, phone in familles_data:
    obj, _ = Famille.objects.get_or_create(
        family_code=code, defaults=dict(name=name, church=church, main_phone=phone)
    )
    fam_objs.append(obj)
print(f"   → {Famille.objects.count()} familles créées")

# ── 5. MEMBRES ─────────────────────────────────────────────────────────
print("\n[5/12] Membres...")

membres_data = [
    # (first, last, gender, birth, phone, marital, occupation, church, family_idx, baptism_date)
    ("Jean", "Mbarga", "MALE", "1978-03-15", "+23769911223", "MARRIED", "Ingénieur", eglise1, 0, "1995-12-25"),
    ("Claire", "Mbarga", "FEMALE", "1980-07-22", "+23769911224", "MARRIED", "Enseignante", eglise1, 0, "1998-04-12"),
    ("Paul", "Mbarga", "MALE", "2005-01-10", "+23769911225", "SINGLE", "Étudiant", eglise1, 0, None),
    ("Pauline", "Ngono", "FEMALE", "1985-11-30", "+23769944556", "MARRIED", "Comptable", eglise1, 1, "2002-08-15"),
    ("Pierre", "Ngono", "MALE", "1983-06-18", "+23769944557", "MARRIED", "Médecin", eglise1, 1, "2000-12-20"),
    ("Sarah", "Ngono", "FEMALE", "2010-04-05", "+23769944558", "SINGLE", "Élève", eglise1, 1, None),
    ("Samuel", "Atanga", "MALE", "1975-09-12", "+23769977889", "MARRIED", "Pasteur", eglise1, 2, "1992-06-15"),
    ("Judith", "Atanga", "FEMALE", "1978-02-28", "+23769977890", "MARRIED", "Infirmière", eglise1, 2, "1996-10-08"),
    ("Grace", "Eboutou", "FEMALE", "1990-05-20", "+23769922334", "SINGLE", "Informatique", eglise1, 7, "2008-12-25"),
    ("David", "Nkoulou", "MALE", "1992-08-14", "+23769933445", "SINGLE", "Commerçant", eglise1, 6, "2010-04-12"),
    ("Marie", "Kamga", "FEMALE", "1982-03-08", "+23767711223", "MARRIED", "Pharmacienne", eglise2, 3, "1999-08-15"),
    ("Pierre", "Zoba", "MALE", "1979-12-25", "+23767744556", "MARRIED", "Avocat", eglise2, 4, "1997-04-12"),
    ("Béatrice", "Fotso", "FEMALE", "1988-07-01", "+23765511223", "MARRIED", "Journaliste", eglise3, 5, "2005-12-25"),
    ("Emmanuel", "Tchidjou", "MALE", "1995-10-18", "+23769988776", "SINGLE", "Étudiant", eglise1, None, "2013-06-15"),
    ("Sylvie", "Obama", "FEMALE", "1987-04-15", "+23769966554", "MARRIED", "Auditrice", fed_cen, None, "2004-12-25"),
    ("Lucien", "Mbida", "MALE", "1991-06-30", "+23767788990", "SINGLE", "Menuisier", eglise2, None, "2009-04-12"),
    ("Céline", "Bikoro", "FEMALE", "1986-09-05", "+23765533445", "MARRIED", "Enseignante", eglise3, None, "2003-08-15"),
    ("André", "Mvondo", "MALE", "1993-01-20", "+23769955667", "SINGLE", "Mécanicien", eglise1, None, "2011-12-25"),
    ("Thérèse", "Obona", "FEMALE", "1980-11-12", "+23767722334", "MARRIED", "Couturière", eglise2, None, "1998-06-15"),
    ("Josué", "Mbarga", "MALE", "2008-06-15", "", "SINGLE", "Élève", eglise1, 0, None),
    ("Esther", "Ngono", "FEMALE", "2012-09-20", "", "SINGLE", "Élève", eglise1, 1, None),
    ("Benjamin", "Atanga", "MALE", "2003-03-25", "+23769977891", "SINGLE", "Étudiant", eglise1, 2, "2019-12-25"),
    ("Hélène", "Kamga", "FEMALE", "2007-12-01", "", "SINGLE", "Élève", eglise2, 3, None),
    ("Michel", "Zoba", "MALE", "2009-05-14", "", "SINGLE", "Élève", eglise2, 4, None),
]

membre_objs = []
for fn, ln, gen, bdate, phone, marital, occ, church, fam_idx, bap in membres_data:
    fam = fam_objs[fam_idx] if fam_idx is not None else None
    obj, created = Membre.objects.get_or_create(
        first_name=fn, last_name=ln, church=church,
        defaults=dict(
            gender=gen, birth_date=date.fromisoformat(bdate), phone=phone,
            marital_status=marital, occupation=occ, family=fam,
            membership_date=date(2015, 1, 1) if marital == "MARRIED" else date(2020, 1, 1),
            baptism_place="Yaoundé" if bap else "",
            baptism_date=date.fromisoformat(bap) if bap else None,
            baptized_by="Pasteur Samuel Atanga" if bap else "",
            address=f"Quartier {church.city}, Yaoundé",
            consent_email=True, consent_whatsapp=random.choice([True, False]),
        )
    )
    membre_objs.append(obj)

# Link families to heads
for i, fam in enumerate(fam_objs):
    if i < len(membre_objs):
        heads = [m for m in membre_objs if m.family == fam and m.gender == "MALE"]
        if heads:
            fam.household_head = heads[0]
            fam.save(update_fields=["household_head"])

print(f"   → {Membre.objects.count()} membres créés")

# ── 6. CHAPELLES → assignation des membres ────────────────────────────
print("\n[6/12] Assignation membres ↔ chapelles...")

for m in membre_objs[:8]:
    m.chapel = random.choice(chapelle_objs[:3])
    m.save(update_fields=["chapel"])

for m in membre_objs[8:16]:
    m.chapel = random.choice(chapelle_objs[3:5])
    m.save(update_fields=["chapel"])

print("   → Membres assignés aux chapelles")

# ── 7. DÉPARTEMENTS ───────────────────────────────────────────────────
print("\n[7/12] Départements + plans annuels...")

depts_data = [
    ("Dept Musique", "DM-001", DepartmentType.MUSIC, eglise1, 0, 500000),
    ("Dept Jeunesse", "DJ-001", DepartmentType.YOUTH, eglise1, 4, 350000),
    ("Dept École du Sabbat", "DES-001", DepartmentType.SABBATH_SCHOOL, eglise1, 2, 200000),
    ("Dept Action Sociale", "DAS-001", DepartmentType.SOCIAL, eglise1, 8, 450000),
    ("Dept Communication", "DC-001", DepartmentType.COMMUNICATION, eglise1, 9, 300000),
    ("Dept Musique Mvog-Ada", "DM-002", DepartmentType.MUSIC, eglise2, 10, 400000),
    ("Dept Jeunesse Messa", "DJ-002", DepartmentType.YOUTH, eglise3, 12, 280000),
]

dept_objs = []
for name, code, dtype, church, leader_idx, budget in depts_data:
    leader = membre_objs[leader_idx] if leader_idx < len(membre_objs) else None
    obj, _ = Departement.objects.get_or_create(
        code=code, defaults=dict(
            name=name, church=church, department_type=dtype, leader=leader,
            annual_budget=Decimal(str(budget)), start_date=date(2026, 1, 1),
        )
    )
    dept_objs.append(obj)

# MembreDepartement
for m in membre_objs[:10]:
    depts = random.sample(dept_objs[:5], k=random.randint(1, 3))
    for d in depts:
        try:
            MembreDepartement.objects.get_or_create(
                member=m, department=d, year=2026,
                defaults=dict(role_in_department=random.choice(["Membre", "Responsable", "Adjoint"]),
                              start_date=date(2026, 1, 1))
            )
        except Exception:
            pass

# Plan annuel
plans = [
    ("Concert de Noël", "Grand concert de fin d'année", date(2026, 12, 20), "PLANNED", 0, 500000),
    ("Camp des Jeunes", "Camp d'été pour les jeunes", date(2026, 0o7, 15), "PLANNED", 4, 750000),
    ("Formation chant choral", "Formation de 3 mois", date(2026, 0o3, 0o1), "IN_PROGRESS", 0, 200000),
    ("Journée de l'action sociale", "Distribution alimentaire", date(2026, 0o6, 10), "DONE", 8, 300000),
]
for title, desc, pdate, status, resp_idx, budget in plans:
    PlanAnnuel.objects.get_or_create(
        title=title, year=2026, defaults=dict(
            description=desc, planned_date=pdate, status=status,
            department=dept_objs[resp_idx % len(dept_objs)],
            responsible=membre_objs[resp_idx], budget=Decimal(str(budget)),
        )
    )

print(f"   → {Departement.objects.count()} départements, {PlanAnnuel.objects.count()} plans annuels")

# ── 8. ÉVÉNEMENTS ─────────────────────────────────────────────────────
print("\n[8/12] Événements...")

events_data = [
    ("Culte du Sabbat", EventType.WORSHIP, eglise1, "Salle principale Bastos", "2026-08-30T09:00", "2026-08-30T12:00", "PUBLISHED", 200000),
    ("Réunion des anciens", EventType.MEETING, eglise1, "Salle de conseil", "2026-08-28T18:00", "2026-08-28T20:00", "PLANNED", 0),
    ("Conférence jeunesse", EventType.CONFERENCE, eglise1, "Auditorium Bastos", "2026-09-05T08:00", "2026-09-05T17:00", "PUBLISHED", 500000),
    ("Évangélisation Mvog-Ada", EventType.OUTREACH, eglise2, "Place du marché Mvog-Ada", "2026-09-12T14:00", "2026-09-12T18:00", "PLANNED", 150000),
    ("Culte de prière", EventType.WORSHIP, eglise3, "Chapelle Betel", "2026-08-27T18:30", "2026-08-27T20:30", "PUBLISHED", 50000),
    ("Formation de chant", EventType.TRAINING, eglise1, "Salle de musique", "2026-09-01T10:00", "2026-09-01T16:00", "PLANNED", 100000),
    ("Fête des mères", EventType.CELEBRATION, eglise1, "Salle principale", "2026-05-10T09:00", "2026-05-10T13:00", "COMPLETED", 300000),
    ("Culte de baptême", EventType.WORSHIP, eglise1, "Salle principale Bastos", "2026-09-20T09:00", "2026-09-20T12:00", "PUBLISHED", 250000),
]

for title, etype, church, loc, start, end, status, budget in events_data:
    Evenement.objects.get_or_create(
        title=title, church=church,
        defaults=dict(
            event_type=etype, location=loc, description=f"Événement: {title}",
            start_datetime=datetime.fromisoformat(start),
            end_datetime=datetime.fromisoformat(end),
            status=status,
            expected_budget=Decimal(str(budget)) if budget else None,
            organizer=random.choice(list(user_objs.values())),
        )
    )
print(f"   → {Evenement.objects.count()} événements créés")

# ── 9. SESSIONS DE CULTE + PRÉSENCES ──────────────────────────────────
print("\n[9/12] Sessions de culte + présences...")

sessions_data = []
for i in range(12):
    d = date(2026, 6, 1) + timedelta(weeks=i)
    sessions_data.append(("SABBATH", d, eglise1, random.choice(chapelle_objs[:3]),
                          random.randint(30, 60), random.randint(40, 80), random.randint(5, 15), random.randint(2, 8)))
    if i % 2 == 0:
        sessions_data.append(("WEDNESDAY", d + timedelta(days=3), eglise1, chapelle_objs[0],
                              random.randint(15, 30), random.randint(20, 40), random.randint(3, 8), random.randint(0, 3)))
    sessions_data.append(("SABBATH", d, eglise2, chapelle_objs[3],
                          random.randint(20, 40), random.randint(25, 50), random.randint(4, 10), random.randint(1, 5)))
    sessions_data.append(("SUNDAY", d + timedelta(days=1), eglise3, chapelle_objs[4],
                          random.randint(15, 35), random.randint(20, 45), random.randint(3, 10), random.randint(1, 4)))

for stype, dt, church, chapel, men, women, children, visitors in sessions_data:
    SessionCulte.objects.get_or_create(
        church=church, date=dt, service_type=stype,
        defaults=dict(chapel=chapel, men_count=men, women_count=women,
                      children_count=children, visitors_count=visitors)
    )

# Presences pour les 6 dernières sessions
sessions = SessionCulte.objects.order_by("-date")[:6]
for sess in sessions:
    members = Membre.objects.filter(church=sess.church)[:random.randint(10, 25)]
    for m in members:
        PresenceMembre.objects.get_or_create(
            session=sess, member=m,
            defaults=dict(status=random.choice(["PRESENT", "PRESENT", "PRESENT", "ABSENT", "EXCUSED"]))
        )

print(f"   → {SessionCulte.objects.count()} sessions, {PresenceMembre.objects.count()} présences")

# ── 10. VISITEURS ─────────────────────────────────────────────────────
print("\n[10/12] Visiteurs...")

visiteurs_data = [
    ("Lucas", "Essomba", "+23769011223", "lucas.essomba@gmail.com", eglise1, "2026-08-03", 1, "Invité par un collègue", True, True, "CONTACTED"),
    ("Nathalie", "Ndjock", "+23769022334", "nathalie.ndjock@yahoo.fr", eglise1, "2026-08-10", 3, "Passage dans le quartier", False, True, "NEW"),
    ("Patrick", "Tsala", "+23769033445", "", eglise2, "2026-07-20", 10, "Camping évangélique", True, True, "RETURNED"),
    ("Ruth", "Fonkou", "+23769044556", "ruth.fonkou@gmail.com", eglise1, "2026-08-17", 4, "Ami de la famille", True, True, "TO_CONTACT"),
    ("Josué", "Simo", "+23769055667", "", eglise3, "2026-08-24", 12, "Promenade dans le quartier", False, False, "NEW"),
    ("Marceline", "Ondoa", "+23769066778", "marceline@cecos.cm", eglise2, "2026-06-15", None, "Recherche spirituelle", True, True, "BECAME_MEMBER"),
    ("Thierry", "Bikok", "+23769077889", "", eglise1, "2026-08-07", 8, "Vacances à Yaoundé", True, False, "CONTACTED"),
    ("Angèle", "Mbia", "+23769088990", "angele.mbia@hotmail.com", eglise3, "2026-09-01", None, "Déménagement récent", True, True, "NEW"),
]

for fn, ln, phone, email, church, vdate, inv_idx, reason, follow, consent, status in visiteurs_data:
    inv = membre_objs[inv_idx] if inv_idx is not None else None
    Visiteur.objects.get_or_create(
        first_name=fn, last_name=ln, church=church,
        defaults=dict(
            phone=phone, email=email, first_visit_date=date.fromisoformat(vdate),
            invited_by=inv, reason_for_visit=reason,
            wants_follow_up=follow, consent_contact=consent,
            follow_up_status=status, notes=f"Note pour {fn} {ln}",
        )
    )
print(f"   → {Visiteur.objects.count()} visiteurs créés")

# ── 11. FINANCES (catégories, recettes, dépenses, budgets) ────────────
print("\n[11/12] Finances...")

# Catégories
cat_recettes = [
    ("Dîmes", "CAT-DIME", CategoryType.INCOME),
    ("Offrandes générales", "CAT-OFFG", CategoryType.INCOME),
    ("Offrandes spéciales", "CAT-OFFS", CategoryType.INCOME),
    ("Fonds désignés", "CAT-FDES", CategoryType.INCOME),
    ("Autres revenus", "CAT-AUTR", CategoryType.INCOME),
]
cat_depenses = [
    ("Salaires et honoraires", "CAT-SAL", CategoryType.EXPENSE),
    ("Entretien bâtiments", "CAT-ENTB", CategoryType.EXPENSE),
    ("Électricité et eau", "CAT-ELEC", CategoryType.EXPENSE),
    ("Transport", "CAT-TRAN", CategoryType.EXPENSE),
    ("Matériel culte", "CAT-MATC", CategoryType.EXPENSE),
    ("Formation", "CAT-FORM", CategoryType.EXPENSE),
    ("Action sociale", "CAT-SOCI", CategoryType.EXPENSE),
    ("Administration", "CAT-ADM", CategoryType.EXPENSE),
]

cat_obj_r = {}
for name, code, ctype in cat_recettes:
    obj, _ = CategorieFinanciere.objects.get_or_create(code=code, defaults=dict(name=name, category_type=ctype))
    cat_obj_r[code] = obj

cat_obj_d = {}
for name, code, ctype in cat_depenses:
    obj, _ = CategorieFinanciere.objects.get_or_create(code=code, defaults=dict(name=name, category_type=ctype))
    cat_obj_d[code] = obj

# Recettes
recettes_data = [
    (eglise1, "CAT-DIME", 150000, "2026-08-02", "Dîmes sabbat", "CASH", "APPROVED"),
    (eglise1, "CAT-OFFG", 85000, "2026-08-02", "Offrande générale sabbat", "CASH", "APPROVED"),
    (eglise1, "CAT-DIME", 142000, "2026-08-09", "Dîmes sabbat", "CASH", "APPROVED"),
    (eglise1, "CAT-OFFG", 78000, "2026-08-09", "Offrande générale sabbat", "CASH", "APPROVED"),
    (eglise1, "CAT-OFFS", 200000, "2026-08-16", "Offrande spéciale baptême", "MOBILE_MONEY", "APPROVED"),
    (eglise1, "CAT-DIME", 155000, "2026-08-16", "Dîmes sabbat", "CASH", "APPROVED"),
    (eglise1, "CAT-OFFG", 92000, "2026-08-16", "Offrande générale sabbat", "CASH", "APPROVED"),
    (eglise1, "CAT-DIME", 148000, "2026-08-23", "Dîmes sabbat", "CASH", "APPROVED"),
    (eglise1, "CAT-OFFG", 81000, "2026-08-23", "Offrande générale sabbat", "CASH", "APPROVED"),
    (eglise1, "CAT-FDES", 300000, "2026-08-25", "Fonds mission", "BANK_TRANSFER", "SUBMITTED"),
    (eglise2, "CAT-DIME", 98000, "2026-08-02", "Dîmes sabbat Mvog-Ada", "CASH", "APPROVED"),
    (eglise2, "CAT-OFFG", 65000, "2026-08-09", "Offrande générale", "CASH", "APPROVED"),
    (eglise2, "CAT-DIME", 105000, "2026-08-16", "Dîmes sabbat", "CASH", "APPROVED"),
    (eglise2, "CAT-OFFG", 72000, "2026-08-23", "Offrande générale", "MOBILE_MONEY", "APPROVED"),
    (eglise3, "CAT-DIME", 76000, "2026-08-02", "Dîmes Messa", "CASH", "APPROVED"),
    (eglise3, "CAT-OFFG", 48000, "2026-08-09", "Offrande Messa", "CASH", "APPROVED"),
    (eglise3, "CAT-OFFS", 120000, "2026-08-15", "Offrande anniversaire église", "CASH", "APPROVED"),
]

for church, cat_code, amount, dt, src, pm, status in recettes_data:
    Recette.objects.get_or_create(
        church=church, category=cat_obj_r[cat_code], date=date.fromisoformat(dt),
        defaults=dict(amount=Decimal(str(amount)), source=src, payment_method=pm,
                      status=status, created_by=user_objs["pauline.ngono@cecos.cm"])
    )

# Dépenses
depenses_data = [
    (eglise1, "CAT-SAL", 250000, "2026-08-05", "Salaire pasteur Atanga", "BANK_TRANSFER", "APPROVED"),
    (eglise1, "CAT-ELEC", 45000, "2026-08-10", "Facture électricité août", "CASH", "APPROVED"),
    (eglise1, "CAT-ENTB", 35000, "2026-08-12", "Réparation toiture chapelle", "CASH", "APPROVED"),
    (eglise1, "CAT-MATC", 28000, "2026-08-14", "Achat matériel sonorisation", "MOBILE_MONEY", "APPROVED"),
    (eglise1, "CAT-TRAN", 15000, "2026-08-18", "Transport évangelisation", "CASH", "APPROVED"),
    (eglise1, "CAT-SOCI", 50000, "2026-08-20", "Aide famille en deuil", "CASH", "APPROVED"),
    (eglise1, "CAT-FORM", 30000, "2026-08-22", "Formation chant choral", "CASH", "SUBMITTED"),
    (eglise1, "CAT-ADM", 20000, "2026-08-25", "Fournitures de bureau", "CASH", "DRAFT"),
    (eglise2, "CAT-SAL", 180000, "2026-08-05", "Salaire leader Zoba", "BANK_TRANSFER", "APPROVED"),
    (eglise2, "CAT-ELEC", 32000, "2026-08-10", "Facture électricité", "CASH", "APPROVED"),
    (eglise3, "CAT-ENTB", 25000, "2026-08-15", "Peinture extérieure", "CASH", "APPROVED"),
    (eglise3, "CAT-MATC", 18000, "2026-08-20", "Achat Bibles", "MOBILE_MONEY", "APPROVED"),
]

for church, cat_code, amount, dt, bene, pm, status in depenses_data:
    Depense.objects.get_or_create(
        church=church, category=cat_obj_d[cat_code], date=date.fromisoformat(dt),
        defaults=dict(amount=Decimal(str(amount)), beneficiary=bene, payment_method=pm,
                      status=status, created_by=user_objs["pauline.ngono@cecos.cm"])
    )

# Budget 2026
budget, _ = Budget.objects.get_or_create(
    church=eglise1, fiscal_year=2026, defaults=dict(
        name="Budget 2026 — Église de Bastos",
        status=BudgetStatus.APPROVED,
        created_by=user_objs["pauline.ngono@cecos.cm"],
    )
)
lignes_budget = [
    ("CAT-DIME", 2000000, "Recettes prévues dîmes"),
    ("CAT-OFFG", 1200000, "Recettes prévues offrandes"),
    ("CAT-SAL", 3000000, "Salaires et honoraires"),
    ("CAT-ELEC", 600000, "Électricité et eau"),
    ("CAT-ENTB", 500000, "Entretien bâtiments"),
    ("CAT-MATC", 350000, "Matériel culte"),
    ("CAT-TRAN", 200000, "Transport"),
    ("CAT-SOCI", 400000, "Action sociale"),
]
for cat_code, amount, notes in lignes_budget:
    LigneBudget.objects.get_or_create(
        budget=budget, category=cat_obj_r.get(cat_code) or cat_obj_d.get(cat_code),
        defaults=dict(planned_amount=Decimal(str(amount)), notes=notes)
    )

print(f"   → {CategorieFinanciere.objects.count()} catégories, {Recette.objects.count()} recettes, {Depense.objects.count()} dépenses, {Budget.objects.count()} budgets")

# ── 12. DONS + REÇUS ──────────────────────────────────────────────────
print("\n[12/12] Dons + reçus...")

dons_data = [
    (membre_objs[0], eglise1, "TITHE", 35000, "2026-08-02", "CASH", "VALIDATED"),
    (membre_objs[1], eglise1, "GENERAL_OFFERING", 15000, "2026-08-02", "CASH", "VALIDATED"),
    (membre_objs[3], eglise1, "TITHE", 42000, "2026-08-09", "MOBILE_MONEY", "VALIDATED"),
    (membre_objs[4], eglise1, "GENERAL_OFFERING", 20000, "2026-08-09", "CASH", "VALIDATED"),
    (membre_objs[10], eglise2, "TITHE", 38000, "2026-08-16", "CASH", "VALIDATED"),
    (membre_objs[11], eglise2, "SPECIAL_OFFERING", 50000, "2026-08-16", "BANK_TRANSFER", "VALIDATED"),
    (membre_objs[6], eglise1, "TITHE", 50000, "2026-08-23", "CASH", "PENDING_VALIDATION"),
    (membre_objs[7], eglise1, "GENERAL_OFFERING", 25000, "2026-08-23", "CASH", "PENDING_VALIDATION"),
    (membre_objs[0], eglise1, "DESIGNATED_FUND", 100000, "2026-08-25", "BANK_TRANSFER", "DRAFT"),
    (membre_objs[12], eglise3, "TITHE", 28000, "2026-08-02", "CASH", "VALIDATED"),
    (membre_objs[8], eglise1, "GENERAL_OFFERING", 12000, "2026-08-16", "MOBILE_MONEY", "REJECTED"),
    (membre_objs[9], eglise1, "TITHE", 18000, "2026-08-09", "CASH", "VALIDATED"),
    (membre_objs[13], eglise1, "SPECIAL_OFFERING", 30000, "2026-08-20", "MOBILE_MONEY", "PENDING_VALIDATION"),
    (membre_objs[14], eglise2, "TITHE", 35000, "2026-08-23", "CASH", "VALIDATED"),
    (membre_objs[15], eglise2, "GENERAL_OFFERING", 22000, "2026-08-25", "CASH", "DRAFT"),
]

for member, church, dtype, amount, dt, pm, status in dons_data:
    d, _ = Don.objects.get_or_create(
        member=member, church=church, donation_date=date.fromisoformat(dt),
        defaults=dict(
            donation_type=dtype, amount=Decimal(str(amount)),
            payment_method=pm, status=status,
            recorded_by=user_objs["pauline.ngono@cecos.cm"],
        )
    )
    # Auto-generate donation_number
    if not d.donation_number:
        d.save()

# Reçus pour les dons validés
for d in Don.objects.filter(status="VALIDATED"):
    Recu.objects.get_or_create(donation=d)

# ── SUIVI PASTORAL ────────────────────────────────────────────────────
print("\n   Suivi pastoral...")

pastoral_data = [
    (membre_objs[0], "Visite de courtoisie", PastoralActionType.VISIT, "2026-08-01", "OPEN"),
    (membre_objs[3], "Accompagnement familial", PastoralActionType.COUNSELING, "2026-08-05", "IN_PROGRESS"),
    (membre_objs[5], "Prière de guérison", PastoralActionType.PRAYER, "2026-08-10", "CLOSED"),
    (membre_objs[8], "Suivi新人convertie", PastoralActionType.SPIRITUAL_SUPPORT, "2026-08-12", "IN_PROGRESS"),
    (membre_objs[12], "Visite malade", PastoralActionType.VISIT, "2026-08-15", "OPEN"),
    (membre_objs[9], "Appel téléphonique", PastoralActionType.PHONE_CALL, "2026-08-18", "PENDING"),
    (membre_objs[1], "Soutien social — demande aide", PastoralActionType.SOCIAL_ASSISTANCE, "2026-08-20", "OPEN"),
    (membre_objs[4], "Accompagnement deuil", PastoralActionType.FAMILY_SUPPORT, "2026-08-22", "IN_PROGRESS"),
]

for member, reason, atype, dt, status in pastoral_data:
    SuiviPastoral.objects.get_or_create(
        member=member, reason=reason,
        defaults=dict(
            church=member.church,
            action_type=atype,
            action_date=date.fromisoformat(dt),
            status=status,
            assigned_to=user_objs["samuel.atanga@cecos.cm"],
            created_by=user_objs["samuel.atanga@cecos.cm"],
        )
    )
print(f"   → {SuiviPastoral.objects.count()} suivis pastoraux créés")

# ── RÉSUMÉ ─────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  RÉSUMÉ DU SEED")
print("=" * 60)
print(f"  Entités hiérarchiques : {EntiteHierarchique.objects.count()}")
print(f"  Chapelles             : {Chapelle.objects.count()}")
print(f"  Utilisateurs          : {User.objects.count()}")
print(f"  Familles              : {Famille.objects.count()}")
print(f"  Membres               : {Membre.objects.count()}")
print(f"  Départements          : {Departement.objects.count()}")
print(f"  Plans annuels         : {PlanAnnuel.objects.count()}")
print(f"  Événements            : {Evenement.objects.count()}")
print(f"  Sessions de culte     : {SessionCulte.objects.count()}")
print(f"  Présences             : {PresenceMembre.objects.count()}")
print(f"  Visiteurs             : {Visiteur.objects.count()}")
print(f"  Suivis pastoraux      : {SuiviPastoral.objects.count()}")
print(f"  Catégories financières: {CategorieFinanciere.objects.count()}")
print(f"  Recettes              : {Recette.objects.count()}")
print(f"  Dépenses              : {Depense.objects.count()}")
print(f"  Budgets               : {Budget.objects.count()}")
print(f"  Lignes budgétaires    : {LigneBudget.objects.count()}")
print(f"  Dons                  : {Don.objects.count()}")
print(f"  Reçus                 : {Recu.objects.count()}")
print("=" * 60)
print("  ✅ Seed terminé avec succès!")
print("  Tous les mots de passe: Admin@2024")
print("=" * 60)
