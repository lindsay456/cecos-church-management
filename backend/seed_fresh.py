"""
Seed complet : 3 eglises (Catholique, Protestante, Adventiste)
avec leaders, departements, membres, chapelles, tresoriers, etc.
"""
import os, sys, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.dev'
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from decimal import Decimal
from datetime import date, datetime, timedelta
from apps.accounts.models import User
from apps.hierarchy.models import EntiteHierarchique
from apps.churches.models import Chapelle
from apps.members.models import Membre
from apps.families.models import Famille
from apps.departments.models import Departement, MembreDepartement
from apps.events.models import Evenement
from apps.attendance.models import SessionCulte
from apps.finance.models import CategorieFinanciere, Recette, Depense, Budget, LigneBudget
from apps.donations.models import Don, Recu
from apps.visitors.models import Visiteur
from apps.pastoral.models import SuiviPastoral
from apps.notifications.models import Notification

print("=== Nettoyage de la base ===")
from django.db import connection
with connection.cursor() as cur:
    cur.execute("""
        DO $$ DECLARE
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
        END $$;
    """)
print("  TRUNCATE CASCADE termine")

print("\n=== Creation des entites hierarchiques ===")

# Catholique: Diocese de Yaounde -> Paroisse Sainte Marie
diocese = EntiteHierarchique.objects.create(
    name="Diocese de Yaounde", code="DIO-YAO-001",
    entity_type="DIOCESE", denomination="CATHOLIC",
    country="Cameroun", city="Yaounde",
    gps_lat=Decimal("3.8480"), gps_lng=Decimal("11.5021"),
    email="diocese.yaounde@google.com", phone="+237222222001"
)
paroisse = EntiteHierarchique.objects.create(
    name="Paroisse Sainte Marie", code="PAR-SM-001",
    entity_type="PARISH", denomination="CATHOLIC",
    parent=diocese,
    country="Cameroun", city="Yaounde",
    gps_lat=Decimal("3.8700"), gps_lng=Decimal("11.5100"),
    email="paroisse.sainte.marie@google.com", phone="+237222222002"
)

# Protestante: Union Protestante du Cameroun -> Eglise de Bastos
union_prot = EntiteHierarchique.objects.create(
    name="Union Protestante du Cameroun", code="UPC-001",
    entity_type="PROTESTANT_UNION", denomination="PROTESTANT",
    country="Cameroun", city="Yaounde",
    gps_lat=Decimal("3.8600"), gps_lng=Decimal("11.4950"),
    email="union.protestante@google.com", phone="+237222222003"
)
eglise_prot = EntiteHierarchique.objects.create(
    name="Eglise Protestante de Bastos", code="EPB-001",
    entity_type="PROTESTANT_CHURCH", denomination="PROTESTANT",
    parent=union_prot,
    country="Cameroun", city="Yaounde",
    gps_lat=Decimal("3.8800"), gps_lng=Decimal("11.5200"),
    email="eglise.bastos@google.com", phone="+237222222004"
)

# Adventiste: Conference -> Eglise Locale
confERENCE = EntiteHierarchique.objects.create(
    name="Conference du Cameroun Central", code="CCC-001",
    entity_type="MISSION", denomination="ADVENTIST",
    country="Cameroun", city="Yaounde",
    gps_lat=Decimal("3.8550"), gps_lng=Decimal("11.5080"),
    email="conference.cameroun@google.com", phone="+237222222005"
)
eglise_adv = EntiteHierarchique.objects.create(
    name="Eglise Adventiste de Melen", code="EAM-001",
    entity_type="LOCAL_CHURCH", denomination="ADVENTIST",
    parent=confERENCE,
    country="Cameroun", city="Yaounde",
    gps_lat=Decimal("3.8650"), gps_lng=Decimal("11.5150"),
    email="eglise.melen@google.com", phone="+237222222006"
)

print(f"  Diocese: {diocese.id} - {diocese.name}")
print(f"  Paroisse: {paroisse.id} - {paroisse.name}")
print(f"  Union Protestante: {union_prot.id} - {union_prot.name}")
print(f"  Eglise Protestante: {eglise_prot.id} - {eglise_prot.name}")
print(f"  Conference: {confERENCE.id} - {confERENCE.name}")
print(f"  Eglise Adventiste: {eglise_adv.id} - {eglise_adv.name}")

print("\n=== Creation des responsables ===")
# Catholique - LOCAL_LEADER
pere_jean = User.objects.create_user(
    email="pere.jean@google.com", password="Admin@2024",
    first_name="Jean", last_name="Mbarga", phone="+237699100001",
    role="LOCAL_LEADER", entity=paroisse, is_staff=True
)
# Catholique - TREASURER
francois = User.objects.create_user(
    email="francois.ngoma@google.com", password="Admin@2024",
    first_name="Francois", last_name="Ngoma", phone="+237699100002",
    role="TREASURER", entity=paroisse, is_staff=True
)

# Protestante - LOCAL_LEADER
pasteur_paul = User.objects.create_user(
    email="paul.mbiada@google.com", password="Admin@2024",
    first_name="Paul", last_name="Mbiada", phone="+237699100003",
    role="LOCAL_LEADER", entity=eglise_prot, is_staff=True
)
# Protestante - TREASURER
tresorier_prot = User.objects.create_user(
    email="tresorier.prot@google.com", password="Admin@2024",
    first_name="Sarah", last_name="Lindsay", phone="+237699100004",
    role="TREASURER", entity=eglise_prot, is_staff=True
)

# Adventiste - LOCAL_LEADER
ancien_jacques = User.objects.create_user(
    email="jacques.Obama@google.com", password="Admin@2024",
    first_name="Jacques", last_name="Obama", phone="+237699100005",
    role="LOCAL_LEADER", entity=eglise_adv, is_staff=True
)
# Adventiste - TREASURER
tresorier_adv = User.objects.create_user(
    email="tresorier.adv@google.com", password="Admin@2024",
    first_name="Marie", last_name="Kamga", phone="+237699100006",
    role="TREASURER", entity=eglise_adv, is_staff=True
)

print(f"  P. Jean (Catho Leader): {pere_jean.id}")
print(f"  F. Ngoma (Catho Tresorier): {francois.id}")
print(f"  P. Paul (Prot Leader): {paul_mbiada_id if False else pasteur_paul.id}")
print(f"  S. Lindsay (Prot Tresorier): {tresorier_prot.id}")
print(f"  J. Obama (Adv Leader): {ancien_jacques.id}")
print(f"  M. Kamga (Adv Tresorier): {tresorier_adv.id}")

print("\n=== Creation des chapelles ===")
# Catholiques
chap_catho_1 = Chapelle.objects.create(
    name="Chapelle Notre Dame de Bastos", code="CND-001",
    church=paroisse, address="Quartier Bastos", city="Yaounde",
    neighborhood="Bastos", capacity=300,
    worship_schedule="Dimanche 8h00, Mercredi 18h00",
    gps_lat=Decimal("3.8850"), gps_lng=Decimal("11.5250"),
    leader=pere_jean
)
chap_catho_2 = Chapelle.objects.create(
    name="Chapelle du Sacre Coeur", code="CSC-001",
    church=paroisse, address="Quartier Melen", city="Yaounde",
    neighborhood="Melen", capacity=250,
    worship_schedule="Dimanche 9h30",
    gps_lat=Decimal("3.8650"), gps_lng=Decimal("11.5100"),
    leader=pere_jean
)

# Protestantes
chap_prot_1 = Chapelle.objects.create(
    name="Chapelle de Manguier", code="CPM-001",
    church=eglise_prot, address="Quartier Manguier", city="Yaounde",
    neighborhood="Manguier", capacity=200,
    worship_schedule="Dimanche 9h00, Vendredi 18h30",
    gps_lat=Decimal("3.8750"), gps_lng=Decimal("11.5180"),
    leader=pasteur_paul
)
chap_prot_2 = Chapelle.objects.create(
    name="Chapelle de Biyem Assi", code="CPBA-001",
    church=eglise_prot, address="Quartier Biyem Assi", city="Yaounde",
    neighborhood="Biyem Assi", capacity=180,
    worship_schedule="Dimanche 10h00",
    gps_lat=Decimal("3.8450"), gps_lng=Decimal("11.4900"),
    leader=pasteur_paul
)

# Adventistes
chap_adv_1 = Chapelle.objects.create(
    name="Chapelle de Manguier", code="CAM-001",
    church=eglise_adv, address="Quartier Manguier", city="Yaounde",
    neighborhood="Manguier", capacity=220,
    worship_schedule="Samedi 9h00-12h00",
    gps_lat=Decimal("3.8760"), gps_lng=Decimal("11.5190"),
    leader=ancien_jacques
)
chap_adv_2 = Chapelle.objects.create(
    name="Chapelle de Melen", code="CAME-001",
    church=eglise_adv, address="Quartier Melen", city="Yaounde",
    neighborhood="Melen", capacity=180,
    worship_schedule="Samedi 9h00-12h00",
    gps_lat=Decimal("3.8660"), gps_lng=Decimal("11.5160"),
    leader=ancien_jacques
)

print(f"  {chap_catho_1.name}, {chap_catho_2.name}")
print(f"  {chap_prot_1.name}, {chap_prot_2.name}")
print(f"  {chap_adv_1.name}, {chap_adv_2.name}")

print("\n=== Creation des membres ===")
members_data = {
    paroisse: [
        ("Pierre", "Ngo", "M", "1985-03-15", "+237699200001", "pierre.ngo@google.com", "M", "Marie", "MARRIED", "Melen", "Comptable"),
        ("Marie", "Atangana", "F", "1990-07-22", "+237699200002", "marie.atangana@google.com", "F", "Pierre", "MARRIED", "Bastos", "Infirmiere"),
        ("Paul", "Ekotto", "M", "1982-11-08", "+237699200003", "paul.ekotto@google.com", "M", "", "SINGLE", "Melen", "Enseignant"),
        ("Grace", "Sindo", "F", "1988-01-30", "+237699200004", "grace.sindo@google.com", "F", "", "SINGLE", "Bastos", "Avocate"),
        ("Henri", "Tagne", "M", "1975-06-12", "+237699200005", "henri.tagne@google.com", "M", "Grace", "MARRIED", "Melen", "Medecin"),
        ("Irene", "Zambo", "F", "1992-09-03", "+237699200006", "irene.zambo@google.com", "F", "", "SINGLE", "Bastos", "Ingenieur"),
        ("Joseph", "Kouam", "M", "1980-12-25", "+237699200007", "joseph.kouam@google.com", "M", "Irene", "MARRIED", "Melen", "Commercial"),
        ("Chantal", "Biya", "F", "1995-04-18", "+237699200008", "chantal.biya@google.com", "F", "", "SINGLE", "Bastos", "Etudiante"),
        ("David", "Ngono", "M", "1987-10-11", "+237699200009", "david.ngono@google.com", "M", "Chantal", "MARRIED", "Melen", "Informaticien"),
        ("Estelle", "Mbida", "F", "1993-05-20", "+237699200010", "estelle.mbida@google.com", "F", "", "SINGLE", "Bastos", "Pharmacienne"),
        ("Bruno", "Lembe", "M", "1978-08-14", "+237699200011", "bruno.lembe@google.com", "M", "Estelle", "MARRIED", "Melen", "Chef d'entreprise"),
        ("Sophie", "Din", "F", "1991-02-28", "+237699200012", "sophie.din@google.com", "F", "", "SINGLE", "Bastos", "Secretaire"),
    ],
    eglise_prot: [
        ("Samuel", "Atanga", "M", "1983-04-15", "+237699300001", "samuel.atanga@google.com", "M", "Sophie", "MARRIED", "Manguier", "Pasteur assistant"),
        ("Celine", "Bikoro", "F", "1989-08-22", "+237699300002", "celine.bikoro@google.com", "F", "", "SINGLE", "Biyem Assi", "Chanteuse"),
        ("Andre", "Mvondo", "M", "1976-12-03", "+237699300003", "andre.mvondo@google.com", "M", "Celine", "MARRIED", "Manguier", "Directeur"),
        ("Pauline", "Ngono", "F", "1994-06-17", "+237699300004", "pauline.ngono@google.com", "F", "", "SINGLE", "Biyem Assi", "Architecte"),
        ("Therese", "Obona", "F", "1986-01-29", "+237699300005", "therese.obona@google.com", "F", "Andre", "MARRIED", "Manguier", "Journaliste"),
        ("Lucien", "Mbida", "M", "1991-09-05", "+237699300006", "lucien.mbida@google.com", "M", "", "SINGLE", "Biyem Assi", "Etudiant"),
        ("Beatrice", "Fotso", "F", "1984-11-12", "+237699300007", "beatrice.fotso@google.com", "F", "Lucien", "MARRIED", "Manguier", "Enseignante"),
        ("David", "Nkoulou", "M", "1990-03-08", "+237699300008", "david.nkoulou@google.com", "M", "", "SINGLE", "Biyem Assi", "Mecanicien"),
    ],
    eglise_adv: [
        ("Sylvie", "Obama", "F", "1987-05-20", "+237699400001", "sylvie.obama@google.com", "F", "Jacques", "MARRIED", "Manguier", "Enseignante"),
        ("Beatrice", "Fotso Adv", "F", "1992-07-14", "+237699400002", "beatrice.fotso.adv@google.com", "F", "", "SINGLE", "Melen", "Infirmiere"),
        ("Cedric", "Obama", "M", "1985-10-01", "+237699400003", "cedric.obama@google.com", "M", "Sylvie", "MARRIED", "Manguier", "Avocat"),
        ("Esther", "Mbarga", "F", "1993-12-25", "+237699400004", "esther.mbarga@google.com", "F", "", "SINGLE", "Melen", "Comptable"),
        ("Guy", "Ngo", "M", "1980-02-14", "+237699400005", "guy.ngo@google.com", "M", "Esther", "MARRIED", "Manguier", "Ingenieur"),
        ("Cecile", "Tchinda", "F", "1996-04-09", "+237699400006", "cecile.tchinda@google.com", "F", "", "SINGLE", "Melen", "Etudiante"),
        ("Robert", "Biya", "M", "1979-08-30", "+237699400007", "robert.biya@google.com", "M", "Cecile", "MARRIED", "Manguier", "Medecin"),
        ("Aimee", "Ekotto", "F", "1989-06-18", "+237699400008", "aimee.ekotto@google.com", "F", "", "SINGLE", "Melen", "Pharmacienne"),
        ("Michel", "Sindo", "M", "1983-11-05", "+237699400009", "michel.sindo@google.com", "M", "Aimee", "MARRIED", "Manguier", "Chef d'entreprise"),
        ("Veronique", "Tagne", "F", "1994-01-22", "+237699400010", "veronique.tagne@google.com", "F", "", "SINGLE", "Melen", "Secretaire"),
    ],
}

all_members = {}
for church, members in members_data.items():
    all_members[church] = []
    for i, (fn, ln, g, bd, ph, em, gen_f, spouse, ms, hood, occ) in enumerate(members):
        gender = "MALE" if g == "M" else "FEMALE"
        m = Membre.objects.create(
            first_name=fn, last_name=ln, gender=gender,
            birth_date=date.fromisoformat(bd), phone=ph, email=em,
            neighborhood=hood, occupation=occ,
            marital_status=ms, membership_date=date(2024, 1, 15) + timedelta(days=i*30),
            status="ACTIVE", church=church,
            consent_email=True, consent_data_processing=True
        )
        all_members[church].append(m)
        print(f"    {m.first_name} {m.last_name} ({church.name})")

print(f"\n  Total: {sum(len(v) for v in all_members.values())} membres crees")

print("\n=== Creation des familles ===")
fam_catho = Famille.objects.create(name="Famille Ngo-Atangana", church=paroisse,
    household_head=all_members[paroisse][0], main_phone="+237699200001",
    main_email="pierre.ngo@google.com")
fam_catho2 = Famille.objects.create(name="Famille Ekotto", church=paroisse,
    household_head=all_members[paroisse][2], main_phone="+237699200003")
fam_prot = Famille.objects.create(name="Famille Atanga-Bikoro", church=eglise_prot,
    household_head=all_members[eglise_prot][0], main_phone="+237699300001")
fam_adv = Famille.objects.create(name="Famille Obama", church=eglise_adv,
    household_head=all_members[eglise_adv][0], main_phone="+237699400001")
fam_adv2 = Famille.objects.create(name="Famille Ngo-Ekotto", church=eglise_adv,
    household_head=all_members[eglise_adv][4], main_phone="+237699400005")
print(f"  5 familles crees")

# Assigner familles aux membres
all_members[paroisse][0].family = fam_catho
all_members[paroisse][0].save()
all_members[paroisse][1].family = fam_catho
all_members[paroisse][1].save()
all_members[paroisse][2].family = fam_catho2
all_members[paroisse][2].save()
all_members[eglise_prot][0].family = fam_prot
all_members[eglise_prot][0].save()
all_members[eglise_adv][0].family = fam_adv
all_members[eglise_adv][0].save()
all_members[eglise_adv][4].family = fam_adv2
all_members[eglise_adv][4].save()

print("\n=== Creation des departements ===")
# Catholiques
dept_culte = Departement.objects.create(name="Liturgie", code="LIT-CATHO", church=paroisse,
    department_type="WORSHIP", annual_budget=Decimal("500000"),
    start_date=date(2024, 1, 1), is_active=True)
dept_musique = Departement.objects.create(name="Choeur Paroissial", code="MUS-CATHO", church=paroisse,
    department_type="MUSIC", annual_budget=Decimal("300000"),
    start_date=date(2024, 1, 1), is_active=True)
dept_action = Departement.objects.create(name="Action Sociale", code="SOC-CATHO", church=paroisse,
    department_type="SOCIAL", annual_budget=Decimal("200000"),
    start_date=date(2024, 1, 1), is_active=True)

# Protestantes
dept_jeunesse = Departement.objects.create(name="Jeunesse", code="JEU-PROT", church=eglise_prot,
    department_type="YOUTH", annual_budget=Decimal("400000"),
    start_date=date(2024, 1, 1), is_active=True)
dept_etude = Departement.objects.create(name="Etude Biblique", code="ETB-PROT", church=eglise_prot,
    department_type="OTHER", annual_budget=Decimal("150000"),
    start_date=date(2024, 1, 1), is_active=True)

# Adventistes
dept_sabbat = Departement.objects.create(name="Ecole du Sabbath", code="SAB-ADV", church=eglise_adv,
    department_type="SABBATH_SCHOOL", annual_budget=Decimal("250000"),
    start_date=date(2024, 1, 1), is_active=True)
dept_musique_adv = Departement.objects.create(name="Museque Adventiste", code="MUS-ADV", church=eglise_adv,
    department_type="MUSIC", annual_budget=Decimal("200000"),
    start_date=date(2024, 1, 1), is_active=True)
dept_vertu = Departement.objects.create(name="Actions de Grace", code="AGR-ADV", church=eglise_adv,
    department_type="OTHER", annual_budget=Decimal("180000"),
    start_date=date(2024, 1, 1), is_active=True)

print(f"  Catho: Liturgie, Choeur, Action Sociale")
print(f"  Prot: Jeunesse, Etude Biblique")
print(f"  Adv: Ecole du Sabbath, Museque, Actions de Grace")

# Creer les departement leaders (DEPARTMENT_LEADER)
dept_leader_catho = User.objects.create_user(
    email="responsable.liturgie@google.com", password="Admin@2024",
    first_name="Henri", last_name="Tagne", phone="+237699200005",
    role="DEPARTMENT_LEADER", entity=paroisse, is_staff=True
)
dept_leader_prot = User.objects.create_user(
    email="responsable.jeunesse@google.com", password="Admin@2024",
    first_name="Samuel", last_name="Atanga", phone="+237699300001",
    role="DEPARTMENT_LEADER", entity=eglise_prot, is_staff=True
)
dept_leader_adv = User.objects.create_user(
    email="responsable.sabbath@google.com", password="Admin@2024",
    first_name="Cedric", last_name="Obama", phone="+237699400003",
    role="DEPARTMENT_LEADER", entity=eglise_adv, is_staff=True
)

# Assigner leaders aux departements
dept_culte.leader = all_members[paroisse][5]  # Irene Zambo
dept_culte.save()
dept_musique.leader = all_members[paroisse][7]  # Chantal Biya
dept_musique.save()
dept_action.leader = all_members[paroisse][11]  # Sophie Din
dept_action.save()
dept_jeunesse.leader = all_members[eglise_prot][2]  # Andre Mvondo
dept_jeunesse.save()
dept_etude.leader = all_members[eglise_prot][6]  # Beatrice Fotso
dept_etude.save()
dept_sabbat.leader = all_members[eglise_adv][2]  # Cedric Obama
dept_sabbat.save()
dept_musique_adv.leader = all_members[eglise_adv][8]  # Michel Sindo
dept_musique_adv.save()
dept_vertu.leader = all_members[eglise_adv][6]  # Robert Biya
dept_vertu.save()

print(f"  3 departement leaders crees")

# Creer les PASTORAL_LEADER (un par chapelle)
pastoral_catho = User.objects.create_user(
    email="resp.pastoral.bastos@google.com", password="Admin@2024",
    first_name="Irene", last_name="Zambo", phone="+237699200006",
    role="PASTORAL_LEADER", entity=paroisse, is_staff=True
)
pastoral_prot = User.objects.create_user(
    email="resp.pastoral.manguier@google.com", password="Admin@2024",
    first_name="Celine", last_name="Bikoro", phone="+237699300002",
    role="PASTORAL_LEADER", entity=eglise_prot, is_staff=True
)
pastoral_adv = User.objects.create_user(
    email="resp.pastoral.melen@google.com", password="Admin@2024",
    first_name="Veronique", last_name="Tagne", phone="+237699400010",
    role="PASTORAL_LEADER", entity=eglise_adv, is_staff=True
)
print(f"  3 pastoral leaders crees")

# Creer les CHAPEL_LEADER (un par chapelle)
chapel_leader_catho = User.objects.create_user(
    email="resp.chapelle.bastos@google.com", password="Admin@2024",
    first_name="Marie", last_name="Nkodo", phone="+237699200007",
    role="CHAPEL_LEADER", entity=paroisse, is_staff=True
)
chapel_leader_prot = User.objects.create_user(
    email="resp.chapelle.manguier@google.com", password="Admin@2024",
    first_name="Jean", last_name="Mbida", phone="+237699300003",
    role="CHAPEL_LEADER", entity=eglise_prot, is_staff=True
)
chapel_leader_adv = User.objects.create_user(
    email="resp.chapelle.melen.adv@google.com", password="Admin@2024",
    first_name="Paul", last_name="Essomba", phone="+237699400011",
    role="CHAPEL_LEADER", entity=eglise_adv, is_staff=True
)
print(f"  3 chapel leaders crees")

# Assigner les chapel leaders aux chapelles
chap_catho_1.leader = chapel_leader_catho
chap_catho_1.save(update_fields=["leader"])
chap_prot_1.leader = chapel_leader_prot
chap_prot_1.save(update_fields=["leader"])
chap_adv_1.leader = chapel_leader_adv
chap_adv_1.save(update_fields=["leader"])
print(f"  Chapel leaders assignes aux chapelles")

print("\n=== Creation des categories financieres ===")
cat_tithe = CategorieFinanciere.objects.create(name="Dimes", code="TITHE", category_type="INCOME")
cat_offering = CategorieFinanciere.objects.create(name="Offrandes", code="OFFERING", category_type="INCOME")
cat_special = CategorieFinanciere.objects.create(name="Offrandes Speciales", code="SPECIAL", category_type="INCOME")
cat_salaire = CategorieFinanciere.objects.create(name="Salaires", code="SALAIRE", category_type="EXPENSE")
cat_loyer = CategorieFinanciere.objects.create(name="Loyer", code="LOYER", category_type="EXPENSE")
cat_entretien = CategorieFinanciere.objects.create(name="Entretien", code="ENTRETIEN", category_type="EXPENSE")
print(f"  6 categories creees")

print("\n=== Creation des recettes et depenses ===")
now = date.today()
# Catholiques - recettes
for i in range(6):
    d = now - timedelta(days=30*i)
    Recette.objects.create(church=paroisse, category=cat_tithe,
        amount=Decimal("250000") + Decimal(str(i * 10000)), date=d,
        source="Dimes des fideles", payment_method="CASH",
        status="APPROVED", created_by=francois)
    Recette.objects.create(church=paroisse, category=cat_offering,
        amount=Decimal("80000") + Decimal(str(i * 5000)), date=d,
        source="Offrandes dimanche", payment_method="MOBILE_MONEY",
        status="APPROVED", created_by=francois)
    Depense.objects.create(church=paroisse, category=cat_salaire,
        amount=Decimal("150000"), date=d,
        beneficiary="Personnel", payment_method="BANK_TRANSFER",
        status="APPROVED", created_by=francois)
    Depense.objects.create(church=paroisse, category=cat_entretien,
        amount=Decimal("30000") + Decimal(str(i * 5000)), date=d,
        beneficiary="Fournisseurs", payment_method="CASH",
        status="APPROVED", created_by=francois)

# Protestantes
for i in range(6):
    d = now - timedelta(days=30*i)
    Recette.objects.create(church=eglise_prot, category=cat_tithe,
        amount=Decimal("180000") + Decimal(str(i * 8000)), date=d,
        source="Dimes", payment_method="CASH", status="APPROVED",
        created_by=tresorier_prot)
    Depense.objects.create(church=eglise_prot, category=cat_loyer,
        amount=Decimal("120000"), date=d,
        beneficiary="Proprietaire", payment_method="BANK_TRANSFER",
        status="APPROVED", created_by=tresorier_prot)

# Adventistes
for i in range(6):
    d = now - timedelta(days=30*i)
    Recette.objects.create(church=eglise_adv, category=cat_tithe,
        amount=Decimal("200000") + Decimal(str(i * 12000)), date=d,
        source="Dimes", payment_method="CASH", status="APPROVED",
        created_by=tresorier_adv)
    Recette.objects.create(church=eglise_adv, category=cat_offering,
        amount=Decimal("60000") + Decimal(str(i * 3000)), date=d,
        source="Offrandes sabbat", payment_method="MOBILE_MONEY",
        status="APPROVED", created_by=tresorier_adv)
    Depense.objects.create(church=eglise_adv, category=cat_entretien,
        amount=Decimal("25000") + Decimal(str(i * 2000)), date=d,
        beneficiary="Fournisseurs", payment_method="CASH",
        status="APPROVED", created_by=tresorier_adv)

print(f"  Recettes et depenses creees (6 mois)")

print("\n=== Creation des budgets ===")
Budget.objects.create(church=paroisse, fiscal_year=2026, name="Budget 2026", status="APPROVED", created_by=francois)
Budget.objects.create(church=eglise_prot, fiscal_year=2026, name="Budget 2026", status="APPROVED", created_by=tresorier_prot)
Budget.objects.create(church=eglise_adv, fiscal_year=2026, name="Budget 2026", status="APPROVED", created_by=tresorier_adv)
print(f"  3 budgets crees")

print("\n=== Creation des donations ===")
donations_catho = [
    (all_members[paroisse][0], "TITHE", 50000),
    (all_members[paroisse][1], "GENERAL_OFFERING", 15000),
    (all_members[paroisse][3], "SPECIAL_OFFERING", 25000),
]
donations_prot = [
    (all_members[eglise_prot][0], "TITHE", 40000),
    (all_members[eglise_prot][2], "GENERAL_OFFERING", 20000),
]
donations_adv = [
    (all_members[eglise_adv][0], "TITHE", 45000),
    (all_members[eglise_adv][2], "GENERAL_OFFERING", 18000),
    (all_members[eglise_adv][4], "SPECIAL_OFFERING", 30000),
]

for church, donations in [(paroisse, donations_catho), (eglise_prot, donations_prot), (eglise_adv, donations_adv)]:
    for member, dtype, amount in donations:
        don = Don.objects.create(
            member=member, church=church, donation_type=dtype,
            amount=Decimal(str(amount)), donation_date=now - timedelta(days=5),
            status="VALIDATED", validated_by=francois if church == paroisse else (tresorier_prot if church == eglise_prot else tresorier_adv),
            validated_at=datetime.now() - timedelta(days=4)
        )
        Recu.objects.create(
            donation=don, status="ISSUED",
            sent_by_email=True, sent_at=datetime.now() - timedelta(days=4)
        )

print(f"  Donations creees avec recus")

print("\n=== Creation des evenements ===")
Evenement.objects.create(
    title="Culte de Paques", event_type="WORSHIP",
    church=paroisse, location="Paroisse Sainte Marie",
    start_datetime=datetime.now() + timedelta(days=15),
    end_datetime=datetime.now() + timedelta(days=15, hours=2),
    expected_budget=Decimal("200000"), status="PLANNED"
)
Evenement.objects.create(
    title="Retraite des Jeunes", event_type="YOUTH",
    church=eglise_prot, location="Centre de Manguier",
    start_datetime=datetime.now() + timedelta(days=30),
    end_datetime=datetime.now() + timedelta(days=32),
    expected_budget=Decimal("150000"), status="PLANNED"
)
Evenement.objects.create(
    title="Concert de Sabbath", event_type="CELEBRATION",
    church=eglise_adv, location="Eglise de Melen",
    start_datetime=datetime.now() + timedelta(days=7),
    end_datetime=datetime.now() + timedelta(days=7, hours=3),
    expected_budget=Decimal("100000"), status="PUBLISHED"
)
Evenement.objects.create(
    title="Culte Dominical", event_type="WORSHIP",
    church=paroisse, location="Paroisse Sainte Marie",
    start_datetime=datetime.now() + timedelta(days=3),
    end_datetime=datetime.now() + timedelta(days=3, hours=2),
    status="PUBLISHED"
)
Evenement.objects.create(
    title="Reunion du Conseil", event_type="MEETING",
    church=eglise_prot, location="Salle Polyvalente",
    start_datetime=datetime.now() + timedelta(days=10),
    end_datetime=datetime.now() + timedelta(days=10, hours=1),
    status="PLANNED"
)
Evenement.objects.create(
    title="Veillee de Priere", event_type="WORSHIP",
    church=eglise_adv, location="Eglise de Manguier",
    start_datetime=datetime.now() + timedelta(days=5),
    end_datetime=datetime.now() + timedelta(days=5, hours=4),
    status="PUBLISHED"
)
print(f"  6 evenements crees")

print("\n=== Creation des sessions de culte ===")
for i in range(12):
    d = now - timedelta(days=7*i)
    SessionCulte.objects.create(church=paroisse, chapel=chap_catho_1,
        service_type="SUNDAY", date=d,
        men_count=45 + i*2, women_count=55 + i*3, children_count=15 + i,
        visitors_count=3 + i%3)
    SessionCulte.objects.create(church=eglise_prot, chapel=chap_prot_1,
        service_type="SUNDAY", date=d,
        men_count=30 + i, women_count=40 + i*2, children_count=10 + i%2,
        visitors_count=2 + i%3)
    SessionCulte.objects.create(church=eglise_adv, chapel=chap_adv_1,
        service_type="SABBATH", date=d,
        men_count=35 + i, women_count=45 + i*2, children_count=12 + i%2,
        visitors_count=1 + i%2)
print(f"  36 sessions de culte (12 par eglise)")

print("\n=== Creation des visiteurs ===")
Visiteur.objects.create(first_name="Marc", last_name="Tchinda", phone="+237699500001",
    email="marc.tchinda@google.com", church=paroisse,
    first_visit_date=now - timedelta(days=10), wants_follow_up=True,
    follow_up_status="NEW")
Visiteur.objects.create(first_name="Ange", last_name="Kouekong", phone="+237699500002",
    church=eglise_prot, first_visit_date=now - timedelta(days=5),
    wants_follow_up=True, follow_up_status="TO_CONTACT")
Visiteur.objects.create(first_name="Clarisse", last_name="Ndjock", phone="+237699500003",
    church=eglise_adv, first_visit_date=now - timedelta(days=3),
    wants_follow_up=True, follow_up_status="CONTACTED")
print(f"  3 visiteurs crees")

print("\n=== Creation des suivis pastoraux ===")
SuiviPastoral.objects.create(member=all_members[paroisse][4], church=paroisse,
    reason="Sante", action_type="VISIT", action_date=now - timedelta(days=5),
    status="IN_PROGRESS", details="Visite a domicile pour maladie")
SuiviPastoral.objects.create(member=all_members[eglise_prot][4], church=eglise_prot,
    reason="Conjugale", action_type="COUNSELING", action_date=now - timedelta(days=3),
    status="OPEN", details="Suivi conjugal")
SuiviPastoral.objects.create(member=all_members[eglise_adv][6], church=eglise_adv,
    reason="Spirituel", action_type="PRAYER", action_date=now - timedelta(days=2),
    status="IN_PROGRESS", details="Accompagnement spirituel")
print(f"  3 suivis pastoraux crees")

print("\n=== Creation des notifications ===")
for church, leader, treasurer, chapel_l in [(paroisse, pere_jean, francois, chapel_leader_catho),
                                    (eglise_prot, pasteur_paul, tresorier_prot, chapel_leader_prot),
                                    (eglise_adv, ancien_jacques, tresorier_adv, chapel_leader_adv)]:
    Notification.objects.create(recipient_user=leader, channel="IN_APP",
        notification_type="WELCOME", subject="Bienvenue!",
        message=f"Bienvenue dans l'application CECOS pour {church.name}.",
        status="SENT")
    Notification.objects.create(recipient_user=treasurer, channel="IN_APP",
        notification_type="WELCOME", subject="Bienvenue Tresorier!",
        message=f"Votre compte tresorier pour {church.name} est active.",
        status="SENT")
    Notification.objects.create(recipient_user=chapel_l, channel="IN_APP",
        notification_type="WELCOME", subject="Bienvenue Responsable!",
        message=f"Votre compte responsable de chapelle pour {church.name} est active.",
        status="SENT")
    Notification.objects.create(recipient_user=leader, channel="IN_APP",
        notification_type="BUDGET_ALERT", subject="Alerte budget",
        message=f"Le budget du mois dernier pour {church.name} a ete consomme a plus de 80%.",
        status="PENDING")
    Notification.objects.create(recipient_user=treasurer, channel="IN_APP",
        notification_type="DONATION_VALIDATED", subject="Don valide",
        message=f"De nouveaux dons ont ete enregistres pour {church.name}.",
        status="PENDING")
print(f"  15 notifications crees")

print("\n=== Résumé ===")
print(f"  Entites: {EntiteHierarchique.objects.count()}")
print(f"  Users: {User.objects.count()}")
print(f"  Chapelles: {Chapelle.objects.count()}")
print(f"  Membres: {Membre.objects.count()}")
print(f"  Familles: {Famille.objects.count()}")
print(f"  Departements: {Departement.objects.count()}")
print(f"  Evenements: {Evenement.objects.count()}")
print(f"  Sessions: {SessionCulte.objects.count()}")
print(f"  Recettes: {Recette.objects.count()}")
print(f"  Depenses: {Depense.objects.count()}")
print(f"  Donations: {Don.objects.count()}")
print(f"  Recus: {Recu.objects.count()}")
print(f"  Visiteurs: {Visiteur.objects.count()}")
print(f"  Pastoral: {SuiviPastoral.objects.count()}")
print(f"  Notifications: {Notification.objects.count()}")
print(f"  Categories: {CategorieFinanciere.objects.count()}")
print(f"  Budgets: {Budget.objects.count()}")
print("\n=== SEED TERMINE ===")
