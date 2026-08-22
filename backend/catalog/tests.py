from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import City, Activity


class CatalogModelTest(TestCase):
    def setUp(self):
        self.city = City.objects.create(
            name="Manali",
            country="India",
            cost_index=2,
            popularity=95,
            description="Himalayan resort town"
        )
        self.activity = Activity.objects.create(
            city=self.city,
            name="Paragliding",
            activity_type="adventure",
            cost=3000.00,
            duration_hours=3.0,
            description="Tandem flight"
        )

    def test_city_creation(self):
        self.assertEqual(str(self.city), "Manali, India")
        self.assertEqual(self.city.popularity, 95)

    def test_activity_creation(self):
        self.assertEqual(self.activity.city, self.city)
        self.assertEqual(float(self.activity.cost), 3000.00)


class CatalogAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.city = City.objects.create(
            name="Goa",
            country="India",
            cost_index=3,
            popularity=98
        )
        self.activity = Activity.objects.create(
            city=self.city,
            name="Sunset Cruise",
            activity_type="sightseeing",
            cost=800.00
        )

    def test_list_cities(self):
        response = self.client.get('/api/catalog/cities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_city(self):
        response = self.client.get('/api/catalog/cities/?search=Goa')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_activities(self):
        response = self.client.get('/api/catalog/activities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
