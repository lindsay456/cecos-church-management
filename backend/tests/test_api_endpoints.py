import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestChurchEndpoints:
    def test_list_churches_unauthenticated(self, api_client):
        url = reverse('church-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_churches_authenticated(self, auth_client):
        url = reverse('church-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestChapelEndpoints:
    def test_list_chapels_unauthenticated(self, api_client):
        url = reverse('chapelle-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_chapels_authenticated(self, auth_client):
        url = reverse('chapelle-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestMemberEndpoints:
    def test_list_members_unauthenticated(self, api_client):
        url = reverse('member-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_members_authenticated(self, auth_client):
        url = reverse('member-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestFamilyEndpoints:
    def test_list_families_unauthenticated(self, api_client):
        url = reverse('family-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_families_authenticated(self, auth_client):
        url = reverse('family-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestEventEndpoints:
    def test_list_events_unauthenticated(self, api_client):
        url = reverse('event-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_events_authenticated(self, auth_client):
        url = reverse('event-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestFinanceEndpoints:
    def test_list_recettes_authenticated(self, auth_client):
        url = reverse('recette-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_depenses_authenticated(self, auth_client):
        url = reverse('depense-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestDonationEndpoints:
    def test_list_donations_authenticated(self, auth_client):
        url = reverse('don-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestDashboardStats:
    def test_dashboard_stats_authenticated(self, auth_client):
        url = reverse('dashboard-stats')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'active_members' in response.data
        assert 'families' in response.data

    def test_dashboard_stats_unauthenticated(self, api_client):
        url = reverse('dashboard-stats')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
