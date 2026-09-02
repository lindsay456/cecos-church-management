"""Migre les donnees de SQLite vers PostgreSQL - v2 avec auto-detect booleans."""
import os
import sys
import sqlite3
import psycopg2

sys.stdout.reconfigure(encoding='utf-8')

SQLITE_DB = r"C:\Users\HP PROBOOK\Documents\Default Project\backend\db.sqlite3"

TABLE_ORDER = [
    "hierarchy_entitehierarchique",
    "accounts_user",
    "accounts_userroleassignment",
    "auth_permission",
    "auth_group",
    "auth_group_permissions",
    "accounts_user_groups",
    "accounts_user_user_permissions",
    "django_content_type",
    "django_admin_log",
    "churches_chapelle",
    "families_famille",
    "members_membre",
    "members_historiqueaffectationmembre",
    "attendance_sessionculte",
    "attendance_presencemembre",
    "departments_departement",
    "departments_membredepartement",
    "departments_planannuel",
    "events_evenement",
    "events_participantevenement",
    "finance_categoriefinanciere",
    "finance_recette",
    "finance_depense",
    "finance_budget",
    "finance_lignebudget",
    "finance_justificatif",
    "finance_validationfinanciere",
    "donations_don",
    "donations_recu",
    "visitors_visiteur",
    "pastoral_suivipastoral",
    "redistribution_fondsaffecte",
    "redistribution_reglereversement",
    "redistribution_redistribution",
    "redistribution_lignereversement",
    "notifications_notification",
    "audit_journalaudit",
    "token_blacklist_outstandingtoken",
    "token_blacklist_blacklistedtoken",
]

SKIP = {"django_migrations", "sqlite_sequence", "django_session"}

# Known boolean columns per table
BOOL_COLS = {
    "hierarchy_entitehierarchique": ["is_active"],
    "accounts_user": ["is_superuser", "is_staff", "is_active"],
    "accounts_userroleassignment": ["can_manage_descendants", "is_active"],
    "churches_chapelle": ["is_active"],
    "members_membre": ["is_active", "consent_email", "consent_sms", "consent_whatsapp"],
    "departments_departement": ["is_active"],
    "departments_membredepartement": ["is_active"],
    "events_evenement": ["is_active"],
    "finance_categoriefinanciere": ["is_active"],
    "finance_recette": ["is_recurring"],
    "finance_depense": ["is_recurring"],
    "visitors_visiteur": ["is_active", "wants_follow_up", "consent_contact"],
    "redistribution_fondsaffecte": ["is_active"],
    "redistribution_reglereversement": ["is_active", "is_complete"],
    "attendance_presencemembre": ["is_present"],
    "audit_journalaudit": ["is_read"],
    "donations_don": ["sent_by_email", "sent_by_whatsapp"],
    "donations_recu": ["sent_by_email", "sent_by_whatsapp"],
}


def migrate():
    pg = psycopg2.connect(dbname="cecos", user="postgres", password="lindsay3", host="localhost", port="5432")
    pg_cur = pg.cursor()
    pg_cur.execute("SET session_replication_role = 'replica';")

    sq = sqlite3.connect(SQLITE_DB)
    sq.row_factory = sqlite3.Row
    sq_cur = sq.cursor()

    all_tables = set()
    sq_cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    for r in sq_cur.fetchall():
        all_tables.add(r[0])

    for table in TABLE_ORDER:
        if table not in all_tables or table in SKIP:
            continue
        sq_cur.execute(f'SELECT COUNT(*) FROM [{table}]')
        count = sq_cur.fetchone()[0]
        if count == 0:
            continue

        sq_cur.execute(f'PRAGMA table_info([{table}])')
        columns = [r[1] for r in sq_cur.fetchall()]

        sq_cur.execute(f'SELECT * FROM [{table}]')
        rows = sq_cur.fetchall()

        bools = BOOL_COLS.get(table, [])
        # Also auto-detect any remaining boolean columns from PG schema
        pg_cur.execute("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = %s AND table_schema = 'public'
            AND data_type = 'boolean'
        """, (table,))
        pg_bools = {r[0] for r in pg_cur.fetchall()}
        all_bools = set(bools) | pg_bools
        bool_indices = {columns.index(b) for b in all_bools if b in columns}

        data = []
        for row in rows:
            r = list(row)
            for idx in bool_indices:
                if r[idx] is not None:
                    r[idx] = bool(r[idx])
            data.append(tuple(r))

        placeholders = ", ".join(["%s"] * len(columns))
        cols = ", ".join([f'"{c}"' for c in columns])
        insert_sql = f'INSERT INTO "{table}" ({cols}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'

        try:
            pg_cur.executemany(insert_sql, data)
            pg.commit()
            print(f"  OK {table}: {count}")
        except Exception as e:
            pg.rollback()
            print(f"  FAIL {table}: {e}")
            pg.commit()

    pg_cur.execute("SET session_replication_role = 'origin';")

    # Reset sequences using information_schema
    print("\n--- Sequences ---")
    pg_cur.execute("""
        SELECT tc.table_name, c.column_name, pg_get_serial_sequence(tc.table_name, c.column_name) as seq
        FROM information_schema.table_constraints tc
        JOIN information_schema.columns c ON c.table_schema = tc.table_schema AND c.table_name = tc.table_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND c.column_name = 'id'
        AND pg_get_serial_sequence(tc.table_name, c.column_name) IS NOT NULL
    """)
    for row in pg_cur.fetchall():
        seq = row[2]
        tbl = row[0]
        if seq:
            pg_cur.execute(f"SELECT setval('{seq}', COALESCE((SELECT MAX(id) FROM \"{tbl}\"), 1))")
            pg.commit()
            print(f"  {tbl}: reset")

    sq.close()
    pg.close()
    print("\nMigration terminee!")


if __name__ == "__main__":
    migrate()
