from django.urls import path, include
from .views import UserAdminView, CustomTokenRefreshView, VerifyTokenView, RegisterView, ConfirmRegistrationView, LogoutView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserAdminView, basename='file')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('confirm-registration/', ConfirmRegistrationView.as_view(), name='confirm-registration'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', VerifyTokenView.as_view(), name='token_verify'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]

from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
OutstandingToken.objects.all().delete()