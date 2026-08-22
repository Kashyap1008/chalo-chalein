from django.contrib import admin
from .models import Trip, Stop, TripActivity


class StopInline(admin.TabularInline):
    model = Stop
    extra = 0


class TripActivityInline(admin.TabularInline):
    model = TripActivity
    extra = 0


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'start_date', 'end_date', 'is_public', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('name', 'owner__username', 'owner__email')
    inlines = [StopInline]


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('trip', 'city', 'start_date', 'end_date', 'order')
    list_filter = ('trip',)
    inlines = [TripActivityInline]


@admin.register(TripActivity)
class TripActivityAdmin(admin.ModelAdmin):
    list_display = ('activity', 'stop', 'scheduled_date', 'scheduled_time', 'cost')
