from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CityViewSet, ActivityViewSet

router = DefaultRouter()
router.register(r'cities', CityViewSet, basename='city')
router.register(r'activities', ActivityViewSet, basename='activity')

urlpatterns = [
    path('', include(router.urls)),
]
