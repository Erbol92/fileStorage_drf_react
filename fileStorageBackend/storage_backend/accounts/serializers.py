import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
USERNAME_RE = re.compile(r'^[A-Za-z][A-Za-z0-9]{3,19}$')

class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(
        max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if value in (None, ''):
            return value
        
        # Проверка формата по регекспу
        if not USERNAME_RE.match(value):
            raise serializers.ValidationError(
                'Логин должен начинаться с латинской буквы, содержать только латинские буквы и цифры, длина 4–20.'
            )
        # Проверка уникальности
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Логин уже занят.')
            
        return value

    def validate_email(self, value):
        # 1. Валидация формата через регулярное выражение
        if not EMAIL_RE.match(value):
            raise serializers.ValidationError('Неверный формат email.')
        
        # 2. Проверка уникальности в базе данных
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email уже зарегистрирован.")
            
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Пароли не совпадают."})
        try:
            validate_password(attrs.get("password"))
        except Exception as e:
            if isinstance(e, serializers.ValidationError):
                raise serializers.ValidationError(
                    {"password": list(e.messages)})
            raise
        return attrs


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['is_staff'] = self.user.is_staff
        return data


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'is_staff', 'is_active', 'is_superuser',
        ]
