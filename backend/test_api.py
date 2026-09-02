import urllib.request, json

data = json.dumps({'email': 'admin@gmail.com', 'password': 'Admin@2024'}).encode()
req = urllib.request.Request('http://127.0.0.1:8000/api/v1/auth/login/', data=data, headers={'Content-Type': 'application/json'})
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
token = result['access']
h = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}

tests = [
    ('MEMBER', '/api/v1/members/', {'first_name': 'JeanX', 'last_name': 'Dupont', 'gender': 'MALE'}),
    ('FAMILY', '/api/v1/families/', {'name': 'Famille Dupont'}),
    ('CHAPEL', '/api/v1/chapels/', {'name': 'Chapel Unique', 'code': 'CHUQ1', 'church': 11}),
    ('DEPT', '/api/v1/departments/', {'name': 'Dept Unique', 'code': 'DUQ1', 'department_type': 'OTHER', 'start_date': '2026-01-01'}),
    ('EVENT', '/api/v1/events/', {'title': 'Event Unique', 'event_type': 'WORSHIP', 'start_datetime': '2026-09-01T10:00', 'end_datetime': '2026-09-01T12:00'}),
    ('ATTEND', '/api/v1/worship-sessions/', {'service_type': 'SABBATH', 'date': '2026-08-29'}),
    ('VISITOR', '/api/v1/visitors/', {'first_name': 'Pierre', 'last_name': 'Visitor', 'first_visit_date': '2026-08-29'}),
    ('PASTORAL', '/api/v1/pastoral-followups/', {'member': 1, 'action_type': 'VISIT', 'action_date': '2026-08-29', 'reason': 'Pastoral test'}),
    ('RECIPE', '/api/v1/recettes/', {'category': 2, 'amount': '3000.00', 'payment_method': 'CASH', 'date': '2026-08-29'}),
    ('DEPENSE', '/api/v1/depenses/', {'category': 4, 'amount': '750.00', 'payment_method': 'CASH', 'date': '2026-08-29'}),
]

for name, url, body in tests:
    try:
        d = json.dumps(body).encode()
        r = urllib.request.Request('http://127.0.0.1:8000' + url, data=d, headers=h)
        resp = urllib.request.urlopen(r)
        print(f'OK   {name}')
    except urllib.error.HTTPError as e:
        err = e.read().decode()[:300]
        try:
            errj = json.loads(err)
            print(f'FAIL {name}: {errj}')
        except:
            print(f'FAIL {name}: HTTP {e.code}')
