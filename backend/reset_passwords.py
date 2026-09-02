import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()
from apps.accounts.models import User
for u in User.objects.all():
    u.set_password('Admin@2024')
    u.save()
    print(f'OK: {u.email}')
print('Done')
