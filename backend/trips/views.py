from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Trip, Stop, TripActivity
from .serializers import (
    TripSerializer, TripListSerializer,
    StopSerializer, TripActivitySerializer
)


class TripViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Trip CRUD, reordering stops, cloning trips, and budget breakdown analysis.
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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reorder_stops(self, request, pk=None):
        """
        Reorders stops for a trip. Expects payload: `{"stop_ids": [3, 1, 2]}`
        """
        trip = self.get_object()
        stop_ids = request.data.get('stop_ids', [])

        if not isinstance(stop_ids, list):
            return Response(
                {"error": "stop_ids must be a list of IDs in the desired order."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            for idx, stop_id in enumerate(stop_ids, start=1):
                Stop.objects.filter(id=stop_id, trip=trip).update(order=idx)

        serializer = TripSerializer(trip)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def clone(self, request, pk=None):
        """
        Duplicates an existing trip (including all stops & activities) under current user's profile.
        """
        try:
            source_trip = Trip.objects.filter(pk=pk, is_public=True).first() or self.get_object()

            with transaction.atomic():
                new_trip = Trip.objects.create(
                    owner=request.user,
                    name=f"Copy of {source_trip.name}",
                    description=source_trip.description,
                    start_date=source_trip.start_date,
                    end_date=source_trip.end_date,
                    cover_photo=source_trip.cover_photo,
                    is_public=False
                )

                for stop in source_trip.stops.all():
                    new_stop = Stop.objects.create(
                        trip=new_trip,
                        city=stop.city,
                        start_date=stop.start_date,
                        end_date=stop.end_date,
                        stay_cost=stop.stay_cost,
                        order=stop.order,
                        notes=stop.notes
                    )
                    for act in stop.trip_activities.all():
                        TripActivity.objects.create(
                            stop=new_stop,
                            activity=act.activity,
                            title=act.title,
                            activity_type=act.activity_type,
                            scheduled_date=act.scheduled_date,
                            scheduled_time=act.scheduled_time,
                            cost=act.cost,
                            notes=act.notes
                        )

            serializer = TripSerializer(new_trip)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def budget(self, request, pk=None):
        """
        Calculates detailed budget aggregation for a specific trip.
        Categorized by Stay, Activities (by type: sightseeing, food, adventure, etc.), per-stop totals, and grand total.
        """
        try:
            trip = None
            if request.user.is_authenticated:
                trip = Trip.objects.filter(pk=pk, owner=request.user).first()

            if not trip:
                trip = Trip.objects.filter(pk=pk, is_public=True).first()

            if not trip:
                return Response(
                    {"detail": "Trip not found or not accessible."},
                    status=status.HTTP_404_NOT_FOUND
                )

            stops = trip.stops.all()
            total_stay = sum(stop.stay_cost for stop in stops)

            categories = {
                'stay': float(total_stay),
                'sightseeing': 0.0,
                'food': 0.0,
                'adventure': 0.0,
                'culture': 0.0,
                'transport': 0.0,
                'shopping': 0.0,
                'other': 0.0
            }

            per_stop_breakdown = []
            total_activities = 0.0

            for stop in stops:
                stop_stay = float(stop.stay_cost or 0)
                stop_activities_total = 0.0
                stop_acts_list = []

                for act in stop.trip_activities.all():
                    act_cost = float(act.cost or 0)
                    act_type = act.activity_type or 'other'
                    categories[act_type] = categories.get(act_type, 0.0) + act_cost
                    total_activities += act_cost
                    stop_activities_total += act_cost

                    stop_acts_list.append({
                        "id": act.id,
                        "title": act.title,
                        "type": act_type,
                        "cost": act_cost
                    })

                per_stop_breakdown.append({
                    "stop_id": stop.id,
                    "city_name": stop.city.name,
                    "order": stop.order,
                    "stay_cost": stop_stay,
                    "activities_cost": stop_activities_total,
                    "stop_total": stop_stay + stop_activities_total,
                    "activities": stop_acts_list
                })

            grand_total = float(total_stay) + total_activities

            breakdown = {
                "trip_id": trip.id,
                "trip_name": trip.name,
                "stay_total": float(total_stay),
                "activities_total": total_activities,
                "grand_total": grand_total,
                "categories": categories,
                "stops_count": stops.count(),
                "stops_breakdown": per_stop_breakdown,
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
        stop = Stop.objects.get(id=stop_id, trip__owner=self.request.user)
        serializer.save(stop=stop)
