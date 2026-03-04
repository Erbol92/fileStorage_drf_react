from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'files', views.FileViewSet, basename='file')

urlpatterns = [
    path('', include(router.urls)),
    path('download/<str:uuid>',views.GuestDownloadFile.as_view(), name='guest_download')
]