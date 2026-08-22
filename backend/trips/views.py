from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Trip, Stop, TripActivity
from .serializers import (
    TripListSerializer,
    TripDetailSerializer,
    TripCreateSerializer,
    StopSerializer,
    TripActivitySerializer,
)


# ─────────────────────────────────────────────
# Trip CRUD
# ─────────────────────────────────────────────

class TripListCreateView(generics.ListCreateAPIView):
    """List user's trips or create a new trip."""
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TripCreateSerializer
        return TripListSerializer

    def get_queryset(self):
        return Trip.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific trip."""
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return TripCreateSerializer
        return TripDetailSerializer

    def get_queryset(self):
        return Trip.objects.filter(owner=self.request.user)


class PublicTripView(generics.RetrieveAPIView):
    """Public read-only trip view via share code."""
    serializer_class = TripDetailSerializer
    permission_classes = (AllowAny,)
    lookup_field = 'share_code'

    def get_queryset(self):
        return Trip.objects.all()


class TripCloneView(APIView):
    """Duplicate a trip under current authenticated user."""
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        source_trip = get_object_or_404(Trip, id=pk)
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

        serializer = TripDetailSerializer(new_trip)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TripReorderStopsView(APIView):
    """Reorder stops for a trip."""
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        trip = get_object_or_404(Trip, id=pk, owner=request.user)
        stop_ids = request.data.get('stop_ids', [])
        with transaction.atomic():
            for idx, stop_id in enumerate(stop_ids, start=1):
                Stop.objects.filter(id=stop_id, trip=trip).update(order=idx)
        serializer = TripDetailSerializer(trip)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# Stop CRUD
# ─────────────────────────────────────────────

class StopListCreateView(generics.ListCreateAPIView):
    """List or add stops to a trip."""
    serializer_class = StopSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        trip_id = self.kwargs['trip_id']
        return Stop.objects.filter(trip_id=trip_id, trip__owner=self.request.user)

    def perform_create(self, serializer):
        trip = get_object_or_404(Trip, id=self.kwargs['trip_id'], owner=self.request.user)
        serializer.save(trip=trip)


class StopDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a stop."""
    serializer_class = StopSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Stop.objects.filter(trip__owner=self.request.user)


# ─────────────────────────────────────────────
# TripActivity CRUD
# ─────────────────────────────────────────────

class TripActivityListCreateView(generics.ListCreateAPIView):
    """List or add activities to a stop."""
    serializer_class = TripActivitySerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        stop_id = self.kwargs['stop_id']
        return TripActivity.objects.filter(
            stop_id=stop_id,
            stop__trip__owner=self.request.user
        )

    def perform_create(self, serializer):
        stop = get_object_or_404(
            Stop, id=self.kwargs['stop_id'], trip__owner=self.request.user
        )
        serializer.save(stop=stop)


class TripActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a trip activity."""
    serializer_class = TripActivitySerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return TripActivity.objects.filter(stop__trip__owner=self.request.user)


class TripBudgetView(APIView):
    """Get detailed budget breakdown for a trip with split-traveler calculation."""
    permission_classes = (AllowAny,)

    def get(self, request, trip_id):
        trip = None
        if request.user.is_authenticated:
            trip = Trip.objects.filter(id=trip_id, owner=request.user).first()
        if not trip:
            trip = Trip.objects.filter(id=trip_id, is_public=True).first()

        if not trip:
            return Response({'detail': 'Trip not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)

        # Parse travelers count (default: 1)
        try:
            travelers = max(1, int(request.query_params.get('travelers', 1)))
        except (ValueError, TypeError):
            travelers = 1

        breakdown = {}
        stop_costs = []
        grand_total = 0.0

        for stop in trip.stops.all().select_related('city'):
            stop_total = float(stop.stay_cost or 0)
            activities = []

            for ta in stop.trip_activities.all().select_related('activity'):
                cost = float(ta.cost or 0)
                act_type = ta.activity_type
                breakdown[act_type] = breakdown.get(act_type, 0.0) + cost
                stop_total += cost
                activities.append({
                    'name': ta.title or (ta.activity.name if ta.activity else 'Activity'),
                    'type': act_type,
                    'cost': round(cost, 2),
                })

            if stop.stay_cost and float(stop.stay_cost) > 0:
                breakdown['stay'] = breakdown.get('stay', 0.0) + float(stop.stay_cost)

            stop_costs.append({
                'city': stop.city.name,
                'stop_id': stop.id,
                'stay_cost': round(float(stop.stay_cost or 0), 2),
                'activities_cost': round(stop_total - float(stop.stay_cost or 0), 2),
                'total': round(stop_total, 2),
                'activities': activities,
            })
            grand_total += stop_total

        # Calculate trip duration
        trip_days = 1
        if trip.start_date and trip.end_date:
            trip_days = max(1, (trip.end_date - trip.start_date).days + 1)
        elif len(stop_costs) > 0:
            trip_days = max(1, len(stop_costs))

        per_person_total = round(grand_total / travelers, 2)
        daily_average = round(grand_total / trip_days, 2)
        daily_per_person = round(per_person_total / trip_days, 2)

        return Response({
            'trip_id': trip.id,
            'trip_name': trip.name,
            'travelers_count': travelers,
            'trip_days': trip_days,
            'grand_total': round(grand_total, 2),
            'per_person_total': per_person_total,
            'daily_average': daily_average,
            'daily_per_person': daily_per_person,
            'by_category': {k: round(v, 2) for k, v in breakdown.items()},
            'by_stop': stop_costs,
        })
