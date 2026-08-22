from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'bio', 'avatar', 'created_at')
        read_only_fields = ('id', 'email', 'created_at')


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True, validators=[validate_password]
    )

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT login serializer that returns user profile data
    alongside the access and refresh tokens.
    Frontend (Member C) needs user info immediately on login
    without making a separate /profile call.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user profile data to the token response
        data['user'] = UserSerializer(self.user).data
        return data


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for admin user listing with trip count."""
    trip_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'bio', 'avatar',
                  'is_active', 'date_joined', 'created_at', 'trip_count')
        read_only_fields = fields

    def get_trip_count(self, obj):
        """Count trips owned by this user (safe if trips app not installed yet)."""
        try:
            from django.apps import apps
            if apps.is_installed('trips'):
                Trip = apps.get_model('trips', 'Trip')
                return Trip.objects.filter(owner=obj).count()
        except Exception:
            pass
        return 0
