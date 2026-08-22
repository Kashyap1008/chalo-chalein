from django.urls import path
from .views import (
    TripListCreateView,
    TripDetailView,
    PublicTripView,
    StopListCreateView,
    StopDetailView,
    TripActivityListCreateView,
    TripActivityDetailView,
    TripBudgetView,
)

urlpatterns = [
    # Trip CRUD
    path('', TripListCreateView.as_view(), name='trip_list_create'),
    path('<int:pk>/', TripDetailView.as_view(), name='trip_detail'),

    # Public shared trip (read-only)
    path('shared/<str:share_code>/', PublicTripView.as_view(), name='public_trip'),

    # Stop CRUD (nested under trip)
    path('<int:trip_id>/stops/', StopListCreateView.as_view(), name='stop_list_create'),
    path('stops/<int:pk>/', StopDetailView.as_view(), name='stop_detail'),

    # TripActivity CRUD (nested under stop)
    path('stops/<int:stop_id>/activities/', TripActivityListCreateView.as_view(), name='trip_activity_list_create'),
    path('activities/<int:pk>/', TripActivityDetailView.as_view(), name='trip_activity_detail'),

    # Budget
    path('<int:trip_id>/budget/', TripBudgetView.as_view(), name='trip_budget'),
]
