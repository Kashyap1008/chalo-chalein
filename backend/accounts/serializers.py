from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(
        write_only=True, required=True
    )
    password2 = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'name', 'password', 'password2')

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        attrs['email'] = email
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                {"email": "An account with this email already exists."}
            )

        pw2 = attrs.get('password2')
        if pw2 and attrs['password'] != pw2:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        
        # Ensure username exists
        if not attrs.get('username'):
            name = attrs.get('name')
            base_username = (name or email.split('@')[0]).strip().replace(' ', '_').lower()
            candidate = base_username or 'user'
            # Ensure unique username
            count = 1
            final_username = candidate
            while User.objects.filter(username=final_username).exists():
                final_username = f"{candidate}_{count}"
                count += 1
            attrs['username'] = final_username
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2', None)
        name = validated_data.pop('name', '')
        user = User.objects.create_user(**validated_data)
        if name:
            user.first_name = name
            user.save(update_fields=['first_name'])
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'name', 'first_name', 'last_name', 'bio', 'avatar', 'created_at')
        read_only_fields = ('id', 'email', 'created_at')

    def get_name(self, obj):
        return obj.first_name or obj.username

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and 'name' in request.data:
            instance.first_name = request.data['name']
        return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT login serializer that returns user profile data
    alongside the access and refresh tokens.
    Supports login via either email or username.
    """

    def validate(self, attrs):
        # Support login via either username or email field
        login_id = attrs.get('email') or attrs.get('username')
        if login_id:
            login_id = login_id.strip()
            # If not formatted as an email, attempt to look up email by username
            if '@' not in login_id:
                user = User.objects.filter(username__iexact=login_id).first()
                if user:
                    attrs['email'] = user.email
            else:
                attrs['email'] = login_id.lower()

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
