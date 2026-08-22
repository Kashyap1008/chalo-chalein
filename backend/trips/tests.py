from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from catalog.models import City, Activity
from .models import Trip, Stop, TripActivity

User = get_user_model()


class TripsAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword123"
        )
        self.client.force_authenticate(user=self.user)

        self.city = City.objects.create(
            name="Jaipur",
            country="India",
            cost_index=2,
            popularity=90
        )
        self.activity = Activity.objects.create(
            city=self.city,
            name="Amer Fort",
            activity_type="culture",
            cost=500.00
        )

        self.trip = Trip.objects.create(
            owner=self.user,
            name="Rajasthan Heritage Tour",
            description="Exploring pink city",
            is_public=True
        )
        self.stop = Stop.objects.create(
            trip=self.trip,
            city=self.city,
            stay_cost=1500.00,
            order=1
        )
        self.trip_activity = TripActivity.objects.create(
            stop=self.stop,
            activity=self.activity,
            title="Amer Fort Visit",
            activity_type="culture",
            cost=500.00
        )

    def test_trip_creation_and_list(self):
        response = self.client.get('/api/trips/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_budget_breakdown_endpoint(self):
        response = self.client.get(f'/api/trips/{self.trip.id}/budget/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('grand_total', response.data)
        self.assertEqual(response.data['grand_total'], 2000.00)

    def test_public_shared_trip_endpoint(self):
        unauthenticated_client = APIClient()
        response = unauthenticated_client.get(f'/api/trips/share/{self.trip.share_code}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Rajasthan Heritage Tour")

    def test_trip_cloning_endpoint(self):
        response = self.client.post(f'/api/trips/{self.trip.id}/clone/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['name'].startswith("Copy of"))
