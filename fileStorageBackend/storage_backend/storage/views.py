import json

from django.http import FileResponse
from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import File
from .serializers import FileSerializer, SimpleFileSerializer
from .models import user_directory_path
from storage_backend.settings import MEDIA_ROOT
from datetime import datetime
import os
import uuid

class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Показываем только файлы текущего пользователя
        user = self.request.user
        if (not user.is_staff):
            return File.objects.filter(owner=self.request.user)
        return File.objects.all()
    
    def perform_create(self, serializer):
        parent_id = self.request.data.get('parent')
        user = self.request.user
        if (not parent_id):
            parent = File.objects.get(parent = None, owner = user)
        else:
            parent = File.objects.get(id = parent_id)
        if not user.is_staff:
            owner = user
        else: 
            owner = parent.owner
        # Автоматически устанавливаем владельца
        serializer.save(owner=owner, parent=parent)
        parent.size = parent.calculate_size()
        parent.save()
    
    @action(detail=False, methods=['get'])
    def root(self, request):
        user = request.user
        if (not user.is_staff):
            parent = File.objects.get(parent = None, owner = request.user)
        else:
            parent = None
        """Получить файлы и папки в корневой директории"""
        files = self.get_queryset().filter(parent=parent)
        serializer = SimpleFileSerializer(files, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def content(self, request, pk=None):
        """Получить содержимое папки"""
        folder = self.get_object()
        
        if not folder.is_directory:
            return Response(
                {"error": "Это не папка"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        files = folder.children.all()
        serializer = SimpleFileSerializer(files, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def create_folder(self, request):
        """Создать новую папку"""
        name = request.data.get('name')
        parent_id = request.data.get('parent')
        
        if not name:
            return Response(
                {"error": "Укажите имя папки"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        # Проверяем родительскую папку
        parent = None
        if parent_id:
            parent = get_object_or_404(File, id=parent_id, owner=request.user)
        else:
            parent = get_object_or_404(File, parent=parent_id, owner=request.user)

            if not parent.is_directory:
                return Response(
                    {"error": "Родитель должен быть папкой"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Создаем папку
        folder = File.objects.create(
            name=name,
            owner=request.user,
            parent=parent,
            is_directory=True
        )
        
        serializer = self.get_serializer(folder)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'])
    def delete_item(self, request, pk=None):
        """Удалить файл или папку"""
        item = self.get_object()
        item.delete()
        parent = item.parent
        parent.size = parent.calculate_size()
        parent.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """Переместить файл или папку"""
        item = self.get_object()
        new_parent_id = request.data.get('parent')
        old_parent = item.parent
        # Если parent = null, перемещаем в корень
        if new_parent_id is None:
            new_parent_id = File.objects.get(parent=None, owner=item.owner).id
            # item.parent = File.objects.get(parent=None, owner=item.owner)
            # item.save()
            # serializer = self.get_serializer(item)
            # return Response(serializer.data)
        
        # Иначе проверяем новую родительскую папку
        new_parent = get_object_or_404(File, id=new_parent_id, owner=item.owner)

        if not new_parent.is_directory:
            return Response(
                {"error": "Можно перемещать только в папки"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Проверяем, не перемещаем ли папку в саму себя
        if item.is_directory and (item.id == new_parent.id or new_parent in item.children.all()):
            return Response(
                {"error": "Нельзя переместить папку в саму себя"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        old_physical_path = item.file.path
        item.parent = new_parent
        # item.save()
        new_relative_path = user_directory_path(item, os.path.basename(item.file.name))
        new_physical_path = os.path.join(MEDIA_ROOT, new_relative_path)
        try:
            if os.path.exists(old_physical_path):
                os.makedirs(os.path.dirname(new_physical_path), exist_ok=True)
                os.rename(old_physical_path, new_physical_path)
                # 6. Обновляем запись в БД
                item.file.name = new_relative_path
                item.updated_at = datetime.now()
                item.save()
                old_parent.size = old_parent.calculate_size()
                old_parent.save()
                new_parent.size = new_parent.calculate_size()
                new_parent.save()
                
        except Exception as e:
            return Response({"error": f"Ошибка при перемещении: {str(e)}"}, status=500)
        serializer = self.get_serializer(item)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def rename(self, request, pk=None):
        """переименовать файл"""
        item = self.get_object()
        new_name = request.data.get('name')
        item.name = new_name
        old_physical_path = item.file.path
        new_relative_path = user_directory_path(item, os.path.basename(new_name))
        new_physical_path = os.path.join(MEDIA_ROOT, new_relative_path)
        try:
            if os.path.exists(old_physical_path):
                os.rename(old_physical_path, new_physical_path)
                # 6. Обновляем запись в БД
                item.file.name = new_relative_path
                item.updated_at = datetime.now()
                item.save()
        except Exception as e:
            return Response({"error": f"Ошибка при переименовании: {str(e)}"}, status=500)
        return Response(data=FileSerializer(item).data,status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        stop = request.GET.get('stop')
        stop = json.loads(stop.lower()) if stop else False
        item = self.get_object()
        item.uid = uuid.uuid4() if not stop else None
        item.updated_at = datetime.now()
        item.save()
        serializer = FileSerializer(item)
        return Response(data=serializer.data,status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Поиск файлов и папок по имени"""
        query = request.query_params.get('q', '')
        if not query:
            return Response([])
        
        files = self.get_queryset().filter(name__icontains=query)
        serializer = SimpleFileSerializer(files, many=True)
        return Response(serializer.data)
    
class GuestDownloadFile(APIView):
    permission_classes= (AllowAny,)

    def get(self, request, uuid=None):
        id = request.GET.get('id')
        user = request.user
        if (id):
            try:
                file_obj = File.objects.get(id=id)
                if file_obj.owner != user:
                    return Response({"detail": "Вы не владелец"}, status=status.HTTP_401_UNAUTHORIZED)
            except File.DoesNotExist:
                return Response({"detail": "не могу найти файл"}, status=status.HTTP_404_NOT_FOUND)
        if (uuid):
            try:
                file_obj = File.objects.get(uid=uuid)
            except File.DoesNotExist:
                return Response({"detail": "не могу найти файл"}, status=status.HTTP_404_NOT_FOUND)

        if not file_obj.file:
            return Response({"detail": "файл отсутствует"}, status=status.HTTP_404_NOT_FOUND)

        # открываем поле FileField и возвращаем FileResponse
        try:
            fh = file_obj.file.open('rb')
        except Exception:
            return Response({"detail": "ошибка открытия файла"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        file_obj.downloaded_at = datetime.now()
        file_obj.save()
        response = FileResponse(fh, as_attachment=True, filename=file_obj.file.name.split('/')[-1])
        response['Access-Control-Expose-Headers'] = 'X-File-Id, X-Downloaded-At'
        response['X-File-Id'] = str(file_obj.id)
        response['X-Downloaded-At'] = file_obj.downloaded_at.isoformat()
        return response
