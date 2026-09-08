import os, sys
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
sys.path.insert(0, '.')
import django
django.setup()

from apps.donations.models import Recu, Don

print("Receipts:", list(Recu.objects.values_list('id', 'receipt_number', 'donation_id')))
print("Donations:", list(Don.objects.values_list('id', 'donation_number', 'status')))

# Generate receipts for all validated donations without one
for d in Don.objects.filter(status='VALIDATED'):
    if not Recu.objects.filter(donation=d).exists():
        r = Recu.objects.create(donation=d, status='ISSUED')
        print(f"Created receipt {r.receipt_number} for donation {d.donation_number}")
    else:
        print(f"Receipt exists for {d.donation_number}")
