from django.utils import timezone
from datetime import timedelta
import jwt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from .models import RegistrationRequest
from .serializers import RegistrationSerializer, UserSerializer
from .utils import make_token, hash_token, error_response, to_bool
from .email import send_confirmation_email
from rest_framework.renderers import JSONRenderer
from django.shortcuts import redirect
from urllib.parse import urlencode
from storage_backend.settings import FRONTEND_URL
from .permissions import IsStafforAdmin
from rest_framework.decorators import action

User = get_user_model()

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Ошибка валидации",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        data = serializer.validated_data
        email = data['email'].lower()

        # Отклонить, если пользователь с указанным адресом электронной почты уже существует
        if User.objects.filter(email__iexact=email).exists():
            return error_response(
                message="Ошибка валидации",
                errors="Электронная почта уже зарегистрирована.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # ожидающий запрос существует и срок его действия не истек
        existing = RegistrationRequest.objects.filter(email=email).first()
        if existing and not existing.is_expired():
            return error_response(
                message="Защита",
                errors="Подтверждение отправлено. Проверьте свою электронную почту.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        if existing:
            existing.delete()

        token = make_token()
        token_h = hash_token(token)

        # Хэш-пароль
        password_hash = make_password(data['password'])
        expires_at = timezone.now() + timedelta(hours=1)

        RegistrationRequest.objects.create(
            email=email,
            username=data.get('username',''),
            token_hash=token_h,
            password_hash=password_hash,
            expires_at=expires_at
        )

        send_confirmation_email(request, email, token)
        return Response({"message":"Электронное письмо с подтверждением отправлено."}, status=status.HTTP_201_CREATED)


class ConfirmRegistrationView(APIView):
    permission_classes = (permissions.AllowAny,)
    renderer_classes = [JSONRenderer]

    def get(self, request):
        token = request.query_params.get('token')
        if not token:
            # return Response({"detail":"Требуется токен."}, status=status.HTTP_400_BAD_REQUEST)
            error_url = f"{FRONTEND_URL}/auth?error=no_token"
            return redirect(error_url)
        token_h = hash_token(token)
        try:
            req = RegistrationRequest.objects.get(token_hash=token_h)
        except RegistrationRequest.DoesNotExist:
            # return Response({"detail":"Недействительный или просроченный токен."}, status=status.HTTP_400_BAD_REQUEST)
            error_url = f"{FRONTEND_URL}/auth?error=Недействительный или просроченный токен"
            return redirect(error_url)
        
        if req.is_expired():
            req.delete()
            # return Response({"detail":"просроченный токен."}, status=status.HTTP_400_BAD_REQUEST)
            error_url = f"{FRONTEND_URL}/auth?error=просроченный токен"
            return redirect(error_url)
        
        # проверка регистрации почты
        if User.objects.filter(email__iexact=req.email).exists():
            req.delete()
            # return Response({"detail":"Электронная почта уже зарегистрирована."}, status=status.HTTP_400_BAD_REQUEST)
            error_url = f"{FRONTEND_URL}/auth?error=Электронная почта уже зарегистрирована"
            return redirect(error_url)
        
        username = req.username or req.email.split('@')[0]
        # создание пользователя
        user = User(username=username, email=req.email, is_active=True)
        user.password = req.password_hash 
        user.save()

        # пара JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        req.delete()
        query_params = {
            'access': access_token,
            'username': user.username,
            'is_staff': user.is_staff,
            'success': 'true'
        }
        redirect_url = f"{FRONTEND_URL}/auth?{urlencode(query_params)}"
        response = redirect(redirect_url)

        # response = Response(data=query_params, status=status.HTTP_201_CREATED)
        response.set_cookie(key="refresh", value=refresh_token, httponly=True, secure=False, path='/')
        return response

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh")
        if not refresh_token:
            return Response({"detail":"необходим refresh token."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            response = Response({"detail":"разлогинен."}, status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie("refresh", path="/")
            return response
        except Exception:
            return Response({"detail":"неверный токен."}, status=status.HTTP_400_BAD_REQUEST)
        
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        serializer_data = serializer.validated_data
        data = {
            "username":serializer_data["username"],
            "is_staff":serializer_data["is_staff"],
            "access":serializer_data["access"]
            }
        response = Response(data=data, status=status.HTTP_200_OK)
        response.set_cookie(key="refresh", value=serializer_data["refresh"], httponly=True, secure=False, path='/', domain=None)
        # response.set_cookie(key="access", value=serializer.validated_data["access"], httponly=True, secure=False, path='/', domain=None)
        return response

class VerifyTokenView(APIView):
    def post(self, request):
        # Пытаемся получить токен из куки
        access_token = request.data
        
        if not access_token:
            return Response(
                {"error": "Токен не найден"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            # Проверяем валидность токена
            token = AccessToken(access_token)
            return Response(
                {"detail": "Токен валидный", "user_id": token['user_id']}, 
                status=status.HTTP_200_OK
            )
        except TokenError as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError:
            return Response(
                {"error": "Невалидный токен"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )    

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data={"refresh":request.COOKIES.get("refresh")})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        serializer_data = serializer.validated_data
        response = Response(data=serializer_data, status=status.HTTP_200_OK)
        # response.set_cookie(key="access", value=serializer.validated_data["access"], httponly=True, secure=False, path='/', domain=None)
        return response

class UserAdminView(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, IsStafforAdmin,)
    serializer_class = UserSerializer

    def get_queryset(self):
        request = self.request
        # Показываем пользователей кроме текущего
        user = request.user
        return User.objects.exclude(username=user)
    
    @action(detail=True, methods=['post'])
    def update_permissions(self, request, pk=None):
        """сменить права"""
        user = self.get_object()
        is_staff = to_bool(request.data.get('is_staff'))
        is_superuser = to_bool(request.data.get('is_superuser'))
        print(is_staff, is_superuser)
        if is_superuser is not None:
            user.is_superuser = is_superuser
        if is_staff is not None:
            user.is_staff = is_staff
        user.save()
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)