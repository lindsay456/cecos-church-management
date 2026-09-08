import os, sys
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
sys.path.insert(0, '.')
import django
django.setup()

from apps.accounts.models import User
from apps.hierarchy.models import EntiteHierarchique
from apps.common.enums import UserRole

# Get or create a church entity
church, _ = EntiteHierarchique.objects.get_or_create(
    code='CECOS-001',
    defaults={
        'name': 'CECOS Eglise Centrale',
        'denomination': 'CATHOLIC',
        'entity_type': 'LOCAL_CHURCH',
        'is_active': True,
    }
)
print(f"Church: {church.name} (id={church.id})")

# Update admin to LOCAL_LEADER with entity
admin = User.objects.get(email='admin@cecos.org')
admin.role = UserRole.LOCAL_LEADER
admin.entity = church
admin.set_password('Admin@2024')
admin.save()
print(f"Admin: {admin.email} -> role={admin.role}, entity={admin.entity}")
