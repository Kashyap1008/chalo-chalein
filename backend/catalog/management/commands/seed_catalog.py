from django.core.management.base import BaseCommand
from catalog.models import City, Activity


class Command(BaseCommand):
    help = 'Seeds initial catalog cities and activities'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding catalog data...')

        SEED_DATA = [
            {
                "name": "Manali",
                "country": "India",
                "cost_index": 2,
                "popularity": 95,
                "image_url": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
                "description": "High-altitude Himalayan resort town known for snow peaks, adventure sports, and scenic beauty.",
                "activities": [
                    {"name": "Solang Valley Paragliding", "activity_type": "adventure", "cost": 3000.00, "duration_hours": 3.0, "description": "Soar over snow-clad mountains and lush valleys."},
                    {"name": "Old Manali Cafe Crawl", "activity_type": "food", "cost": 1200.00, "duration_hours": 4.0, "description": "Explore quaint bohemian cafes with local and continental cuisine."},
                    {"name": "Hadimba Temple Visit", "activity_type": "culture", "cost": 100.00, "duration_hours": 1.5, "description": "Historic wooden temple surrounded by cedar forest."},
                    {"name": "Atal Tunnel Drive to Sissu", "activity_type": "sightseeing", "cost": 1500.00, "duration_hours": 5.0, "description": "Scenic day trip to Lahaul valley through world's longest highway tunnel."}
                ]
            },
            {
                "name": "Goa",
                "country": "India",
                "cost_index": 3,
                "popularity": 98,
                "image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
                "description": "India's beach paradise known for palm-fringed coastlines, seafood, nightlife, and Portuguese heritage.",
                "activities": [
                    {"name": "Scuba Diving at Grand Island", "activity_type": "adventure", "cost": 4500.00, "duration_hours": 6.0, "description": "Underwater diving session with coral reefs and marine life."},
                    {"name": "Sunset Cruise on Mandovi River", "activity_type": "sightseeing", "cost": 800.00, "duration_hours": 2.0, "description": "Traditional Goan folk dance and music cruise at dusk."},
                    {"name": "Fontainhas Latin Quarter Walking Tour", "activity_type": "culture", "cost": 500.00, "duration_hours": 2.5, "description": "Colorful Portuguese-era architecture and heritage walk."},
                    {"name": "Beachside Shack Dinner at Anjuna", "activity_type": "food", "cost": 1800.00, "duration_hours": 3.0, "description": "Fresh seafood dinner right on the sand with live music."}
                ]
            },
            {
                "name": "Jaipur",
                "country": "India",
                "cost_index": 2,
                "popularity": 90,
                "image_url": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
                "description": "The Pink City of Rajasthan, famous for royal palaces, majestic forts, and rich heritage.",
                "activities": [
                    {"name": "Amer Fort & Light Show", "activity_type": "culture", "cost": 500.00, "duration_hours": 3.5, "description": "Grand fortress overlooking Maota Lake with evening sound & light show."},
                    {"name": "Hawa Mahal & City Palace Tour", "activity_type": "sightseeing", "cost": 600.00, "duration_hours": 3.0, "description": "Iconic Palace of Winds and royal residence inspection."},
                    {"name": "Chokhi Dhani Rajasthani Feast", "activity_type": "food", "cost": 1100.00, "duration_hours": 4.0, "description": "Traditional ethnic village resort experience with thali dinner."},
                    {"name": "Johari Bazaar Shopping Walk", "activity_type": "shopping", "cost": 2000.00, "duration_hours": 2.5, "description": "Handicrafts, gemstone jewelry, and traditional bandhani textiles."}
                ]
            },
            {
                "name": "Varanasi",
                "country": "India",
                "cost_index": 1,
                "popularity": 88,
                "image_url": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
                "description": "One of the oldest continuously inhabited cities in the world, spiritual heart of India on the Ganges.",
                "activities": [
                    {"name": "Sunrise Boat Ride on Ganges", "activity_type": "sightseeing", "cost": 600.00, "duration_hours": 2.0, "description": "Peaceful morning boat ride watching morning rituals at the ghats."},
                    {"name": "Dashashwamedh Ganga Aarti", "activity_type": "culture", "cost": 0.00, "duration_hours": 1.5, "description": "Mesmerizing evening prayer ritual with fire and chanting."},
                    {"name": "Sarnath Excursion", "activity_type": "culture", "cost": 400.00, "duration_hours": 4.0, "description": "Ancient Buddhist site where Buddha preached his first sermon."},
                    {"name": "Street Food & Kachori Alley Walk", "activity_type": "food", "cost": 350.00, "duration_hours": 2.0, "description": "Famous Malaiyo, Tamatar Chaat, and Blue Lassi tasting."}
                ]
            },
            {
                "name": "Udaipur",
                "country": "India",
                "cost_index": 3,
                "popularity": 92,
                "image_url": "https://images.unsplash.com/photo-1615836245337-f5b9b2303f1c?auto=format&fit=crop&w=800&q=80",
                "description": "The City of Lakes in Rajasthan, romantic setting with grand palaces surrounding Lake Pichola.",
                "activities": [
                    {"name": "Lake Pichola Sunset Boat Ride", "activity_type": "sightseeing", "cost": 900.00, "duration_hours": 2.0, "description": "Boat ride visiting Jagmandir Island with views of Lake Palace."},
                    {"name": "City Palace Museum Tour", "activity_type": "culture", "cost": 400.00, "duration_hours": 3.0, "description": "Rajasthan's largest palace complex with stunning peacock courtyards."},
                    {"name": "Rooftop Candlelight Dinner", "activity_type": "food", "cost": 2500.00, "duration_hours": 2.5, "description": "Romantic lake-view dining with traditional Mewari dishes."}
                ]
            }
        ]

        for city_data in SEED_DATA:
            activities = city_data.pop('activities', [])
            city, created = City.objects.get_or_create(
                name=city_data['name'],
                defaults=city_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created City: {city.name}"))
            else:
                self.stdout.write(f"City already exists: {city.name}")

            for act_data in activities:
                act, act_created = Activity.objects.get_or_create(
                    city=city,
                    name=act_data['name'],
                    defaults=act_data
                )
                if act_created:
                    self.stdout.write(self.style.SUCCESS(f"  - Added Activity: {act.name}"))

        self.stdout.write(self.style.SUCCESS('Catalog seeding complete!'))
