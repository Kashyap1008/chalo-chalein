from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Trip, Stop, TripActivity
from .serializers import (
    TripSerializer, TripListSerializer,
    StopSerializer, TripActivitySerializer
)


class TripViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Trip CRUD and budget breakdown analysis.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users only see their own trips by default
        return Trip.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return TripListSerializer
        return TripSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def budget(self, request, pk=None):
        """
        Calculates detailed budget aggregation for a specific trip.
        Categorized by Stay, Activities (by type: sightseeing, food, adventure, etc.), Total.
        """
        try:
            if request.user.is_authenticated:
                trip = Trip.objects.filter(pk=pk).first()
            else:
                trip = None

            if not trip:
                # Fallback check for public trips
                trip = Trip.objects.filter(pk=pk, is_public=True).first()

            if not trip:
                return Response(
                    {"detail": "Trip not found or not accessible."},
                    status=status.HTTP_404_NOT_FOUND
                )

            stops = trip.stops.all()
            total_stay = sum(stop.stay_cost for stop in stops)

            categories = {}
            total_activities = 0.0

            for stop in stops:
                for act in stop.trip_activities.all():
                    act_cost = float(act.cost or 0)
                    act_type = act.activity_type or 'other'
                    categories[act_type] = categories.get(act_type, 0.0) + act_cost
                    total_activities += act_cost

            total_budget = float(total_stay) + total_activities

            breakdown = {
                "trip_id": trip.id,
                "trip_name": trip.name,
                "stay_total": float(total_stay),
                "activities_total": total_activities,
                "grand_total": total_budget,
                "categories": categories,
                "stops_count": stops.count(),
            }

            return Response(breakdown)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny], url_path='share/(?P<share_code>[^/.]+)')
    def shared(self, request, share_code=None):
        """
        Public read-only endpoint for shared trip links.
        """
        try:
            trip = Trip.objects.get(share_code=share_code)
            serializer = TripSerializer(trip)
            return Response(serializer.data)
        except Trip.DoesNotExist:
            return Response(
                {"detail": "Shared trip not found or code invalid."},
                status=status.HTTP_404_NOT_FOUND
            )


class StopViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Stop CRUD.
    """
    serializer_class = StopSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Stop.objects.filter(trip__owner=self.request.user)

    def perform_create(self, serializer):
        trip_id = self.request.data.get('trip')
        trip = Trip.objects.get(id=trip_id, owner=self.request.user)
        serializer.save(trip=trip)


class TripActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TripActivity CRUD.
    """
    serializer_class = TripActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TripActivity.objects.filter(stop__trip__owner=self.request.user)

    def perform_create(self, serializer):
        stop_id = self.request.data.get('stop')
        stop = Stop.objects.get(id=stop_id, stop__trip__owner=self.request.user) if False else Stop.objects.get(id=stop_id, trip__owner=self.request.user)
        serializer.save(stop=stop)
