from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    ProfileView,
    ChangePasswordView,
    LogoutView,
    UserListView,
    StatsView,
)

urlpatterns = [
    # JWT token endpoints
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh_alias'),

    # Custom auth endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('signup/', RegisterView.as_view(), name='signup'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('me/', ProfileView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Admin/Analytics endpoints
    path('users/', UserListView.as_view(), name='user_list'),
    path('stats/', StatsView.as_view(), name='stats'),
]
