# Ecclesia Gestion

Application web de gestion administrative, pastorale et financiere pour eglises catholiques, protestantes et adventistes.

## Stack technique

- **Backend**: Django 5.2, Django REST Framework, PostgreSQL/PostGIS, JWT
- **Frontend**: Angular 21, TypeScript, SCSS
- **Deploiement**: Docker, docker-compose

## Fonctionnalites

- **Authentification**: Inscription en 3 etapes, connexion JWT, roles (super-admin, administrateur, tresorier)
- **Gestion des membres**: Inscription, fiches detaillees, transferts entre eglises
- **Familles**: Regroupement des membres par famille
- **Chapelles/Paroisses**: Gestion multi-sites avec emplacement geographique (PostGIS)
- **Departements**: Organisation par ministere/activite
- **Evenements**: Planification, calendrier, categories
- **Presence**: Comptabilite par session de culte
- **Visiteurs**: Suivi des visiteurs
- **Finance**: Recettes, depenses, budgets, categories financieres
- **Dons**: Dimes, offrandes, dons speciaux avec validation
- **Redistribution**: Regles de redistribution (adventiste uniquement)
- **Pastoral**: Suivi pastoral, alertes, rendez-vous
- **Notifications**: Alertes systeme
- **Audit**: Journal d'audit complet
- **Rapports**: Export PDF membres et dons
- **Carte**: Visualisation des entites geolocalisees

## Denominations supportees

| Denomination | Structure hierarchique |
|---|---|
| Catholique | Diocese > Paroisse > Chapelle |
| Protestante | Union Protestante > Eglise > Chapelle |
| Adventiste | Division > Union > Federation > Eglise > Chapelle |

## Installation

### Sans Docker (developpement)

**Backend:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver 8000
```

**Frontend:**

```bash
cd frontend
npm install
npx ng serve --port 4200 --proxy-config proxy.conf.json
```

### Avec Docker

```bash
docker-compose up --build
```

L'application sera disponible sur `http://localhost:80`.

## Comptes de demonstration

| Role | Email | Mot de passe |
|---|---|---|
| Super-admin | admin@gmail.com | Admin@2024 |
| Responsable Adventiste | responsable.adv@gmail.com | Responsable@2024 |
| Tresorier Adventiste | tresorier.adv@gmail.com | Tresorier@2024 |
| Federation Admin | fedadmin.adv@gmail.com | Responsable@2024 |
| Responsable Catholique | responsable.cat@gmail.com | Responsable@2024 |
| Tresorier Catholique | tresorier.cat@gmail.com | Responsable@2024 |
| Responsable Protestant | responsable.prot@gmail.com | Responsable@2024 |
| Tresorier Protestant | tresorier.prot@gmail.com | Responsable@2024 |

> Seules les adresses email `@gmail.com` sont acceptees pour l'inscription.

## Configuration

### Variables d'environnement

| Variable | Description | Defaut |
|---|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL | `sqlite:///db.sqlite3` |
| `SECRET_KEY` | Cle secrete Django | - |
| `DJANGO_SETTINGS_MODULE` | Module de configuration | `config.settings.dev` |
| `ALLOWED_HOSTS` | Hosts autorises | `localhost,127.0.0.1` |

## Structure du projet

```
ecclesia-gestion/
├── backend/
│   ├── apps/
│   │   ├── accounts/        # Utilisateurs et authentification
│   │   ├── hierarchy/       # Entites hierarchiques
│   │   ├── churches/        # Eglises et chapelles
│   │   ├── members/         # Membres
│   │   ├── families/        # Familles
│   │   ├── departments/     # Departements
│   │   ├── events/          # Evenements
│   │   ├── attendance/      # Presences
│   │   ├── visitors/        # Visiteurs
│   │   ├── finance/         # Finance (recettes, depenses, budgets)
│   │   ├── donations/       # Dons et dimes
│   │   ├── redistribution/  # Redistribution (adventiste)
│   │   ├── pastoral/        # Suivi pastoral
│   │   ├── notifications/   # Notifications
│   │   ├── reports/         # Rapports et exports
│   │   ├── audit/           # Journal d'audit
│   │   └── common/          # Modeles partages, enums, pagination
│   ├── config/              # Configuration Django
│   └── manage.py
├── frontend/
│   └── src/app/
│       ├── core/            # Services, modeles, interceptors
│       ├── features/        # Pages (dashboard, members, finance...)
│       └── shared/          # Layout, composants partages
├── docker-compose.yml
└── README.md
```

## API

Documentation Swagger disponible sur `http://localhost:8000/api/docs/`

## Licence

Projet interne - Ecclesia Gestion
