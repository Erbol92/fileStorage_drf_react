from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import File
from .serializers import FileSerializer, SimpleFileSerializer
import shutil
from .models import user_directory_path
from storage_backend.settings import MEDIA_ROOT
import os

class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Показываем только файлы текущего пользователя
        return File.objects.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        # Автоматически устанавливаем владельца
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'])
    def root(self, request):
        """Получить файлы и папки в корневой директории"""
        files = self.get_queryset().filter(parent=None)
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
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """Переместить файл или папку"""
        item = self.get_object()
        new_parent_id = request.data.get('parent')
        
        # Если parent = null, перемещаем в корень
        if new_parent_id is None:
            item.parent = None
            item.save()
            serializer = self.get_serializer(item)
            return Response(serializer.data)
        
        # Иначе проверяем новую родительскую папку
        new_parent = get_object_or_404(File, id=new_parent_id, owner=request.user)
        
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
                item.save()
        except Exception as e:
            return Response({"error": f"Ошибка при перемещении: {str(e)}"}, status=500)
        serializer = self.get_serializer(item)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Поиск файлов и папок по имени"""
        query = request.query_params.get('q', '')
        if not query:
            return Response([])
        
        files = self.get_queryset().filter(name__icontains=query)
        serializer = SimpleFileSerializer(files, many=True)
        return Response(serializer.data)