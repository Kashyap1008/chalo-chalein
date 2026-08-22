"""
Management command to seed demo users and realistic sample trips.
Usage: python manage.py seed_demo_users
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from catalog.models import City, Activity
from trips.models import Trip, Stop, TripActivity

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed demo users and sample trips for presentation demo'

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo users...')

        # Demo User 1: Kashyap (Main Demo User)
        user1, created1 = User.objects.get_or_create(
            email='demo@chalochalein.com',
            defaults={
                'username': 'kashyap_explorer',
                'bio': 'Passionate traveler & tech builder. Exploring India one city at a time! ✈️',
            }
        )
        if created1 or not user1.check_password('Demo123!'):
            user1.set_password('Demo123!')
            user1.save()
        self.stdout.write(f'  Demo User 1: {user1.email} (password: Demo123!)')

        # Demo User 2: Aary (Second Demo User)
        user2, created2 = User.objects.get_or_create(
            email='aary@chalochalein.com',
            defaults={
                'username': 'aary_travels',
                'bio': 'Beach lover & mountain hiker. Always ready for adventure!',
            }
        )
        if created2 or not user2.check_password('Demo123!'):
            user2.set_password('Demo123!')
            user2.save()
        self.stdout.write(f'  Demo User 2: {user2.email} (password: Demo123!)')

        # Seed Sample Trip 1 for User 1
        jaipur = City.objects.filter(name='Jaipur').first()
        udaipur = City.objects.filter(name='Udaipur').first()
        goa = City.objects.filter(name='Goa').first()
        manali = City.objects.filter(name='Manali').first()

        trip1, t1_created = Trip.objects.get_or_create(
            name='Royal Rajasthan Expedition',
            owner=user1,
            defaults={
                'description': 'Exploring majestic palaces, pink bazaars, and romantic lakes across Jaipur and Udaipur.',
                'start_date': '2026-09-10',
                'end_date': '2026-09-16',
                'is_public': True,
                'cover_photo': 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
            }
        )

        if jaipur and t1_created:
            stop1 = Stop.objects.create(
                trip=trip1, city=jaipur,
                start_date='2026-09-10', end_date='2026-09-12',
                stay_cost=4000.00, order=1, notes='Stay at heritage hotel in Pink City'
            )
            act1 = Activity.objects.filter(city=jaipur, name__icontains='Amber Fort').first()
            act2 = Activity.objects.filter(city=jaipur, name__icontains='Street Food').first()
            if act1:
                TripActivity.objects.create(stop=stop1, activity=act1, scheduled_date='2026-09-10', cost=500.00)
            if act2:
                TripActivity.objects.create(stop=stop1, activity=act2, scheduled_date='2026-09-11', cost=200.00)

        if udaipur and t1_created:
            stop2 = Stop.objects.create(
                trip=trip1, city=udaipur,
                start_date='2026-09-13', end_date='2026-09-16',
                stay_cost=6600.00, order=2, notes='Lakeside haveli experience'
            )
            act3 = Activity.objects.filter(city=udaipur, name__icontains='Boat Ride').first()
            act4 = Activity.objects.filter(city=udaipur, name__icontains='Rooftop Dinner').first()
            if act3:
                TripActivity.objects.create(stop=stop2, activity=act3, scheduled_date='2026-09-14', cost=400.00)
            if act4:
                TripActivity.objects.create(stop=stop2, activity=act4, scheduled_date='2026-09-15', cost=800.00)

        # Seed Sample Trip 2 for User 2
        trip2, t2_created = Trip.objects.get_or_create(
            name='Goa Beach & Nightlife Getaway',
            owner=user2,
            defaults={
                'description': 'Sun-kissed beaches, waterfall treks, and Goan seafood feasts.',
                'start_date': '2026-10-01',
                'end_date': '2026-10-05',
                'is_public': True,
                'cover_photo': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
            }
        )

        if goa and t2_created:
            stop_goa = Stop.objects.create(
                trip=trip2, city=goa,
                start_date='2026-10-01', end_date='2026-10-05',
                stay_cost=10000.00, order=1, notes='North Goa beach resort'
            )
            act5 = Activity.objects.filter(city=goa, name__icontains='Dudhsagar').first()
            act6 = Activity.objects.filter(city=goa, name__icontains='Fish Thali').first()
            act7 = Activity.objects.filter(city=goa, name__icontains='Tito').first()
            if act5:
                TripActivity.objects.create(stop=stop_goa, activity=act5, scheduled_date='2026-10-02', cost=800.00)
            if act6:
                TripActivity.objects.create(stop=stop_goa, activity=act6, scheduled_date='2026-10-03', cost=350.00)
            if act7:
                TripActivity.objects.create(stop=stop_goa, activity=act7, scheduled_date='2026-10-04', cost=1500.00)

        self.stdout.write(self.style.SUCCESS('Successfully seeded demo users & sample trips!'))
