from django.db import models


class City(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default="India")
    cost_index = models.IntegerField(default=3, help_text="1 (Budget) to 5 (Luxury)")
    popularity = models.IntegerField(default=50, help_text="Popularity score 1-100")
    image_url = models.URLField(max_length=500, blank=True, default="")
    description = models.TextField(blank=True, default="")
    
    # Tier 2 Weather & Travel Intelligence
    weather_temp = models.CharField(max_length=50, default="24°C", blank=True)
    weather_condition = models.CharField(max_length=100, default="Sunny & Pleasant", blank=True)
    best_season = models.CharField(max_length=100, default="Oct – Mar", blank=True)
    packing_tips = models.TextField(blank=True, default="Comfortable walking shoes, camera, power bank, light jacket")

    class Meta:
        verbose_name_plural = "Cities"
        ordering = ['name']

    def __str__(self):
        return f"{self.name}, {self.country}"


class Activity(models.Model):
    ACTIVITY_TYPES = (
        ('sightseeing', 'Sightseeing'),
        ('food', 'Food & Dining'),
        ('adventure', 'Adventure'),
        ('culture', 'Culture & Heritage'),
        ('stay', 'Stay & Accommodation'),
        ('transport', 'Transport'),
        ('shopping', 'Shopping'),
        ('other', 'Other'),
    )

    city = models.ForeignKey(City, related_name='activities', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES, default='sightseeing')
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    duration_hours = models.DecimalField(max_digits=4, decimal_places=1, default=1.0)
    description = models.TextField(blank=True, default="")
    image_url = models.URLField(max_length=500, blank=True, default="")

    class Meta:
        verbose_name_plural = "Activities"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.city.name})"
