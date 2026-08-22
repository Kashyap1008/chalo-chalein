from rest_framework import serializers
from .models import City, Activity


class ActivitySerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)

    class Meta:
        model = Activity
        fields = [
            'id', 'city', 'city_name', 'name', 'activity_type',
            'cost', 'duration_hours', 'description', 'image_url'
        ]


class CitySerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)

    class Meta:
        model = City
        fields = [
            'id', 'name', 'country', 'cost_index', 'popularity',
            'image_url', 'description', 'activities'
        ]


class CityListSerializer(serializers.ModelSerializer):
    activities_count = serializers.IntegerField(source='activities.count', read_only=True)

    class Meta:
        model = City
        fields = [
            'id', 'name', 'country', 'cost_index', 'popularity',
            'image_url', 'description', 'activities_count'
        ]
