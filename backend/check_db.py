import sqlite3

DB = r"C:\Users\HP PROBOOK\Documents\Default Project\backend\db.sqlite3"
conn = sqlite3.connect(DB)
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print(f"Tables ({len(tables)}):\n")
for t in tables:
    cur.execute(f"SELECT COUNT(*) FROM [{t}]")
    count = cur.fetchone()[0]
    print(f"  {t}: {count} lignes")

print("\n--- Apercu accounts_user ---")
cur.execute("SELECT id, email, first_name, last_name, role, is_active FROM accounts_user LIMIT 5")
for r in cur.fetchall():
    print(f"  {r}")

print("\n--- Apercu members_membre ---")
cur.execute("SELECT id, first_name, last_name, email, member_number FROM members_membre LIMIT 5")
for r in cur.fetchall():
    print(f"  {r}")

print("\n--- Apercu donations_don ---")
cur.execute("SELECT id, donation_number, amount, status, donation_type FROM donations_don LIMIT 5")
for r in cur.fetchall():
    print(f"  {r}")

print("\n--- Apercu churches_chapelle ---")
cur.execute("SELECT id, name FROM churches_chapelle LIMIT 5")
for r in cur.fetchall():
    print(f"  {r}")

conn.close()
