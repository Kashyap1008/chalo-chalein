from rest_framework import serializers
from .models import Trip, Stop, TripActivity
from catalog.serializers import CityListSerializer, ActivitySerializer
from catalog.models import City, Activity


class TripActivitySerializer(serializers.ModelSerializer):
    activity_details = ActivitySerializer(source='activity', read_only=True)

    class Meta:
        model = TripActivity
        fields = [
            'id', 'stop', 'activity', 'activity_details',
            'title', 'activity_type', 'scheduled_date',
            'scheduled_time', 'cost', 'notes'
        ]


class StopSerializer(serializers.ModelSerializer):
    city_details = CityListSerializer(source='city', read_only=True)
    trip_activities = TripActivitySerializer(many=True, read_only=True)
    city_id = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(), source='city', write_only=True
    )

    class Meta:
        model = Stop
        fields = [
            'id', 'trip', 'city', 'city_id', 'city_details',
            'start_date', 'end_date', 'stay_cost', 'order',
            'notes', 'trip_activities'
        ]
        extra_kwargs = {'city': {'read_only': True}}


class TripSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    stops = StopSerializer(many=True, read_only=True)
    total_budget = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            'id', 'owner', 'owner_username', 'name', 'description',
            'start_date', 'end_date', 'cover_photo', 'is_public',
            'share_code', 'created_at', 'updated_at', 'stops', 'total_budget'
        ]
        read_only_fields = ['owner', 'share_code']

    def get_total_budget(self, obj):
        total_stay = sum(stop.stay_cost for stop in obj.stops.all())
        total_activities = sum(
            act.cost for stop in obj.stops.all() for act in stop.trip_activities.all()
        )
        return float(total_stay + total_activities)


class TripListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    stops_count = serializers.IntegerField(source='stops.count', read_only=True)
    total_budget = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            'id', 'owner', 'owner_username', 'name', 'description',
            'start_date', 'end_date', 'cover_photo', 'is_public',
            'share_code', 'created_at', 'stops_count', 'total_budget'
        ]

    def get_total_budget(self, obj):
        total_stay = sum(stop.stay_cost for stop in obj.stops.all())
        total_activities = sum(
            act.cost for stop in obj.stops.all() for act in stop.trip_activities.all()
        )
        return float(total_stay + total_activities)
