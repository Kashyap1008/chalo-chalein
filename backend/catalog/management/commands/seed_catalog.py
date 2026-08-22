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
            },
            {
                "name": "Leh-Ladakh",
                "country": "India",
                "cost_index": 4,
                "popularity": 96,
                "image_url": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
                "description": "The land of high mountain passes, pristine azure lakes, and dramatic lunar landscapes.",
                "activities": [
                    {"name": "Pangong Tso Lake Camping", "activity_type": "adventure", "cost": 3500.00, "duration_hours": 12.0, "description": "Overnight lakeside tent stay under the Milky Way."},
                    {"name": "Nubra Valley Camel Safari & Sand Dunes", "activity_type": "sightseeing", "cost": 1500.00, "duration_hours": 4.0, "description": "Ride double-humped Bactrian camels in Hunder sand dunes."},
                    {"name": "Thiksey Monastery Morning Prayer", "activity_type": "culture", "cost": 200.00, "duration_hours": 2.0, "description": "Experience serene chanting monks in a 12-storey hilltop monastery."}
                ]
            },
            {
                "name": "Munnar",
                "country": "India",
                "cost_index": 2,
                "popularity": 89,
                "image_url": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
                "description": "God's Own Country hill station famous for rolling emerald tea plantations and misty mountains.",
                "activities": [
                    {"name": "Kolukkumalai Sunrise Jeep Safari", "activity_type": "adventure", "cost": 2200.00, "duration_hours": 4.5, "description": "Catch cloud-bed sunrise at the world's highest organic tea estate."},
                    {"name": "Tea Museum & Tasting Tour", "activity_type": "food", "cost": 450.00, "duration_hours": 2.0, "description": "Learn the artisanal process of tea making with fresh brew tasting."},
                    {"name": "Eravikulam National Park Trek", "activity_type": "sightseeing", "cost": 300.00, "duration_hours": 3.0, "description": "Spot endangered Nilgiri Tahr against rolling shola grasslands."}
                ]
            },
            {
                "name": "Rishikesh",
                "country": "India",
                "cost_index": 2,
                "popularity": 94,
                "image_url": "https://images.unsplash.com/photo-1600100397608-f010f4439c3e?auto=format&fit=crop&w=800&q=80",
                "description": "Yoga capital of the world and white-water river rafting hub nestled along the foothills of Himalayas.",
                "activities": [
                    {"name": "Ganga White Water Rafting (16km)", "activity_type": "adventure", "cost": 1200.00, "duration_hours": 3.5, "description": "Tackle thrilling Grade III rapids including Roller Coaster and Golf Course."},
                    {"name": "Beatles Ashram Exploration", "activity_type": "culture", "cost": 300.00, "duration_hours": 2.5, "description": "Walk through psychedelic graffiti meditation huts where The Beatles composed music."},
                    {"name": "Triveni Ghat Evening Maha Aarti", "activity_type": "culture", "cost": 0.00, "duration_hours": 1.5, "description": "Soulful riverside prayer with oil lamps floating on the Holy Ganges."}
                ]
            },
            {
                "name": "Agra",
                "country": "India",
                "cost_index": 2,
                "popularity": 97,
                "image_url": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
                "description": "Home of the iconic Taj Mahal and grand Mughal architectural wonders on the banks of Yamuna.",
                "activities": [
                    {"name": "Sunrise Taj Mahal Guided Tour", "activity_type": "culture", "cost": 1100.00, "duration_hours": 3.0, "description": "Marvel at the marble monument of love in morning golden light."},
                    {"name": "Agra Fort Heritage Walk", "activity_type": "sightseeing", "cost": 650.00, "duration_hours": 2.5, "description": "Massive red sandstone fort residence of Mughal Emperors."},
                    {"name": "Petha & Mughal Street Food Crawl", "activity_type": "food", "cost": 400.00, "duration_hours": 2.0, "description": "Sample original Agra petha varieties and legendary Mughlai delicacies."}
                ]
            },
            {
                "name": "Amritsar",
                "country": "India",
                "cost_index": 1,
                "popularity": 91,
                "image_url": "https://images.unsplash.com/photo-1588096344356-9b497b78f0b7?auto=format&fit=crop&w=800&q=80",
                "description": "Spiritual capital of Sikhism, revered for the Golden Temple and legendary culinary heritage.",
                "activities": [
                    {"name": "Golden Temple & Langar Experience", "activity_type": "culture", "cost": 0.00, "duration_hours": 3.0, "description": "Peaceful meditation by the holy Amrit Sarovar and community meal."},
                    {"name": "Attari-Wagah Border Beating Retreat Ceremony", "activity_type": "sightseeing", "cost": 500.00, "duration_hours": 4.0, "description": "High-octane patriotic military drill and flag lowering ceremony."},
                    {"name": "Authentic Kulcha & Lassi Breakfast Trail", "activity_type": "food", "cost": 300.00, "duration_hours": 2.0, "description": "Crispy butter-drenched stuffed Amritsari kulchas with creamy malai lassi."}
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
