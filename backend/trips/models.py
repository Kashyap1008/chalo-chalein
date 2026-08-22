import uuid
from django.db import models
from django.conf import settings
from catalog.models import City, Activity


class Trip(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='trips',
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    cover_photo = models.URLField(max_length=500, blank=True, default="")
    is_public = models.BooleanField(default=False)
    share_code = models.CharField(max_length=64, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.share_code:
            self.share_code = uuid.uuid4().hex[:12]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.owner.username})"


class Stop(models.Model):
    trip = models.ForeignKey(Trip, related_name='stops', on_delete=models.CASCADE)
    city = models.ForeignKey(City, related_name='stops', on_delete=models.CASCADE)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    stay_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    order = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ['order', 'start_date']

    def __str__(self):
        return f"{self.city.name} - {self.trip.name}"


class TripActivity(models.Model):
    stop = models.ForeignKey(Stop, related_name='trip_activities', on_delete=models.CASCADE)
    activity = models.ForeignKey(
        Activity,
        related_name='trip_activities',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    title = models.CharField(max_length=200, blank=True, default="")
    activity_type = models.CharField(max_length=30, default="sightseeing")
    scheduled_date = models.DateField(null=True, blank=True)
    scheduled_time = models.TimeField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True, default="")

    class Meta:
        verbose_name_plural = "Trip Activities"
        ordering = ['scheduled_date', 'scheduled_time', 'id']

    def save(self, *args, **kwargs):
        # Fallback to catalog activity title/cost/type if not explicitly overridden
        if self.activity and not self.title:
            self.title = self.activity.name
        if self.activity and not self.activity_type:
            self.activity_type = self.activity.activity_type
        if self.activity and (self.cost is None or self.cost == 0):
            self.cost = self.activity.cost
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title or 'Activity'} - {self.stop.city.name}"
