from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Count

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    UserListSerializer,
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that returns user profile data alongside JWT tokens.
    Response: { access, refresh, user: { id, email, username, bio, avatar, created_at } }
    """
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Register a new user and return JWT tokens."""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user, context={'request': request}).data
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        return Response({
            'user': user_data,
            'access': access_token,
            'refresh': refresh_token,
            'tokens': {
                'refresh': refresh_token,
                'access': access_token,
            }
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete the authenticated user's profile."""
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """Change password for the authenticated user."""
    serializer_class = ChangePasswordSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response(
            {"detail": "Password updated successfully."},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """Blacklist the refresh token to logout."""
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"detail": "Successfully logged out."},
                status=status.HTTP_205_RESET_CONTENT,
            )
        except Exception:
            return Response(
                {"detail": "Invalid token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class UserListView(generics.ListAPIView):
    """
    Admin endpoint: list all users with their trip counts.
    Used by the admin/analytics dashboard.
    """
    serializer_class = UserListSerializer
    permission_classes = (AllowAny,)
    queryset = User.objects.all().order_by('-created_at')

    def get_queryset(self):
        queryset = super().get_queryset()
        # Optional search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                username__icontains=search
            )
        return queryset


class StatsView(APIView):
    """
    Analytics/Stats summary endpoint for dashboard overview.
    Returns total users, total trips, top cities, and recent users.
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        total_users = User.objects.count()
        total_trips = 0
        top_cities = []

        try:
            from django.apps import apps
            if apps.is_installed('trips'):
                Trip = apps.get_model('trips', 'Trip')
                total_trips = Trip.objects.count()

                # Top cities by number of stops
                if apps.is_installed('catalog'):
                    Stop = apps.get_model('trips', 'Stop')
                    City = apps.get_model('catalog', 'City')
                    top_city_ids = (
                        Stop.objects.values('city')
                        .annotate(visit_count=Count('id'))
                        .order_by('-visit_count')[:5]
                    )
                    for entry in top_city_ids:
                        try:
                            city = City.objects.get(id=entry['city'])
                            top_cities.append({
                                'id': city.id,
                                'name': city.name,
                                'country': city.country,
                                'visit_count': entry['visit_count'],
                            })
                        except City.DoesNotExist:
                            pass
        except Exception:
            pass

        # Recent 5 users
        recent_users = UserSerializer(
            User.objects.order_by('-created_at')[:5], many=True
        ).data

        return Response({
            'total_users': total_users,
            'total_trips': total_trips,
            'top_cities': top_cities,
            'recent_users': recent_users,
            'status': 'active',
        }, status=status.HTTP_200_OK)
