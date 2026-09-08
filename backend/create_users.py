import os, sys
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
sys.path.insert(0, '.')
import django
django.setup()

from apps.accounts.models import User

users = [
    ('admin@cecos.org', 'SUPER_ADMIN', 'Admin', 'Cecos'),
    ('pasteur@cecos.org', 'PASTOR', 'Pasteur', 'Cecos'),
    ('tresorier@cecos.org', 'TREASURER', 'Tresorier', 'Cecos'),
    ('secretaire@cecos.org', 'SECRETARY', 'Secretaire', 'Cecos'),
]
for email, role, first, last in users:
    u, created = User.objects.get_or_create(email=email, defaults={'first_name': first, 'last_name': last, 'role': role, 'is_active': True})
    u.set_password('Admin@2024')
    u.save()
    status = 'created' if created else 'updated'
    print(f'{email}: {status} role={u.role}')
