import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestHealthCheck:
    def test_health_check(self, api_client):
        url = reverse('health-check')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()['status'] == 'ok'


@pytest.mark.django_db
class TestLogin:
    def test_login_success(self, api_client, admin_user):
        url = reverse('auth-login')
        response = api_client.post(url, {'email': 'admin@gmail.com', 'password': 'Admin@2024'})
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['email'] == 'admin@gmail.com'

    def test_login_wrong_password(self, api_client, admin_user):
        url = reverse('auth-login')
        response = api_client.post(url, {'email': 'admin@gmail.com', 'password': 'wrong'})
        assert response.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED)

    def test_login_non_gmail_rejected(self, api_client):
        url = reverse('auth-login')
        response = api_client.post(url, {'email': 'test@yahoo.com', 'password': 'Test@2024'})
        assert response.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED)


@pytest.mark.django_db
class TestMe:
    def test_me_authenticated(self, auth_client):
        url = reverse('auth-me')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'admin@gmail.com'

    def test_me_unauthenticated(self, api_client):
        url = reverse('auth-me')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
