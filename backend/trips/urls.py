from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, StopViewSet, TripActivityViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'stops', StopViewSet, basename='stop')
router.register(r'trip-activities', TripActivityViewSet, basename='trip-activity')

urlpatterns = [
    path('', include(router.urls)),
]
