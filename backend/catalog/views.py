from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import City, Activity
from .serializers import CitySerializer, CityListSerializer, ActivitySerializer


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for listing and viewing cities.
    Supports searching by name or country.
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


class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for listing and viewing catalog activities.
    Supports filtering by city and search.
    """
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'activity_type', 'city__name']
    ordering_fields = ['cost', 'duration_hours', 'name']

    def get_queryset(self):
        queryset = super().get_queryset()
        city_id = self.request.query_params.get('city')
        activity_type = self.request.query_params.get('type')

        if city_id:
            queryset = queryset.filter(city_id=city_id)
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)

        return queryset
