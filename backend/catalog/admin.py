from django.contrib import admin
from .models import City, Activity


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'cost_index', 'popularity')
    list_filter = ('country',)
    search_fields = ('name', 'country')


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('name', 'activity_type', 'cost', 'duration_hours', 'city')
    list_filter = ('activity_type', 'city')
    search_fields = ('name', 'description')
