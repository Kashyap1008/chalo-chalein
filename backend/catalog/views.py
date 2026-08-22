from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import City, Activity
from .serializers import CitySerializer, CityListSerializer, ActivitySerializer


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for listing and viewing cities.
    Supports searching by name, country, and country filtering.
    """
    queryset = City.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country', 'description']
    ordering_fields = ['popularity', 'cost_index', 'name']
    ordering = ['-popularity']

    def get_serializer_class(self):
        if self.action == 'list':
            return CityListSerializer
        return CitySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        country = self.request.query_params.get('country')
        if country and country.lower() != 'all':
            queryset = queryset.filter(country__icontains=country)
        return queryset


class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for listing and viewing catalog activities.
    Supports filtering by city, country, activity type, and search.
    """
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'activity_type', 'city__name', 'city__country']
    ordering_fields = ['cost', 'duration_hours', 'name']

    def get_queryset(self):
        queryset = super().get_queryset()
        city_id = self.request.query_params.get('city')
        activity_type = self.request.query_params.get('type')
        country = self.request.query_params.get('country')

        if city_id and str(city_id).lower() != 'all':
            queryset = queryset.filter(city_id=city_id)
        if activity_type and str(activity_type).lower() != 'all':
            queryset = queryset.filter(activity_type=activity_type)
        if country and str(country).lower() != 'all':
            queryset = queryset.filter(city__country__icontains=country)

        return queryset
