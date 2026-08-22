from rest_framework import serializers
from .models import Trip, Stop, TripActivity
from catalog.serializers import CitySerializer, ActivitySerializer


class TripActivitySerializer(serializers.ModelSerializer):
    """Serializer for scheduled activities within a stop."""
    activity_detail = ActivitySerializer(source='activity', read_only=True)

    class Meta:
        model = TripActivity
        fields = ('id', 'stop', 'activity', 'activity_detail', 'title',
                  'activity_type', 'scheduled_date', 'scheduled_time',
                  'cost', 'notes')
        read_only_fields = ('id', 'stop')


class StopSerializer(serializers.ModelSerializer):
    """Serializer for city stops within a trip."""
    city_detail = CitySerializer(source='city', read_only=True)
    trip_activities = TripActivitySerializer(many=True, read_only=True)
    stop_cost = serializers.SerializerMethodField()

    class Meta:
        model = Stop
        fields = ('id', 'trip', 'city', 'city_detail', 'start_date', 'end_date',
                  'stay_cost', 'order', 'notes', 'trip_activities', 'stop_cost')
        read_only_fields = ('id', 'trip')

    def get_stop_cost(self, obj):
        """Calculate total cost for this stop (stay + activities)."""
        total = float(obj.stay_cost or 0)
        for ta in obj.trip_activities.all():
            total += float(ta.cost or 0)
        return round(total, 2)


class TripListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for trip listings."""
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    stop_count = serializers.SerializerMethodField()
    total_budget = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = ('id', 'name', 'description', 'start_date', 'end_date',
                  'cover_photo', 'owner', 'owner_name', 'is_public',
                  'share_code', 'stop_count', 'total_budget', 'created_at')
        read_only_fields = ('id', 'owner', 'share_code', 'created_at')

    def get_stop_count(self, obj):
        return obj.stops.count()

    def get_total_budget(self, obj):
        total = 0
        for stop in obj.stops.all():
            total += float(stop.stay_cost or 0)
            for ta in stop.trip_activities.all():
                total += float(ta.cost or 0)
        return round(total, 2)


class TripDetailSerializer(serializers.ModelSerializer):
    """Full trip serializer with nested stops and activities."""
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    stops = StopSerializer(many=True, read_only=True)
    budget_breakdown = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = ('id', 'name', 'description', 'start_date', 'end_date',
                  'cover_photo', 'owner', 'owner_name', 'is_public',
                  'share_code', 'stops', 'budget_breakdown',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'owner', 'share_code', 'created_at', 'updated_at')

    def get_budget_breakdown(self, obj):
        """Aggregate costs by activity type across all stops."""
        breakdown = {}
        stay_total = 0
        grand_total = 0

        for stop in obj.stops.all():
            stay_cost = float(stop.stay_cost or 0)
            stay_total += stay_cost
            grand_total += stay_cost

            for ta in stop.trip_activities.all():
                cost = float(ta.cost or 0)
                act_type = ta.activity_type
                breakdown[act_type] = breakdown.get(act_type, 0) + cost
                grand_total += cost

        if stay_total > 0:
            breakdown['stay'] = breakdown.get('stay', 0) + stay_total

        return {
            'by_category': {k: round(v, 2) for k, v in breakdown.items()},
            'total': round(grand_total, 2),
        }


class TripCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating trips."""

    class Meta:
        model = Trip
        fields = ('id', 'name', 'description', 'start_date', 'end_date',
                  'cover_photo', 'is_public', 'share_code')
        read_only_fields = ('id', 'share_code')
