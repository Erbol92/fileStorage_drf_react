from django.utils import timezone

from django.db import models

# Create your models here.
# models.py
from django.db import models
from django.contrib.auth.models import User
import os
import mimetypes
from django.db import IntegrityError

def user_directory_path(instance, filename):
    # Собираем части пути: username/path/to/folder/filename
    parts = []

    # Начинаем с текущего родителя, если он есть
    current_parent = instance.parent
    while current_parent:
        parts.insert(0, current_parent.name)
        current_parent = current_parent.parent

    # В начале всегда имя пользователя
    # parts.insert(0, instance.owner.username)

    # В конце имя самого загружаемого файла
    parts.append(filename)

    return os.path.join(*parts)


class File(models.Model):
    """Модель для представления файлов и папок"""
    name = models.CharField(max_length=255)
    file = models.FileField(
        upload_to=user_directory_path, blank=True, null=True)
    size = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=100, blank=True)

    # Для организации папок
    parent = models.ForeignKey('self', on_delete=models.CASCADE,
                               null=True, blank=True, related_name='children')
    is_directory = models.BooleanField(default=False)

    comment = models.CharField(max_length=255, null=True, blank=True)
    # Метаданные
    uid = models.UUIDField(null=True, blank=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='files')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    downloaded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-is_directory', 'name']
        unique_together = ['name', 'parent', 'owner']

    def __str__(self):
        return self.name

    def get_full_path(self):
        """Получить полный путь к файлу/папке"""
        if self.parent:
            return os.path.join(self.parent.get_full_path(), self.name)
        return self.name

    def save(self, *args, **kwargs):
        self.clean()
        if not self.is_directory:
            base = self.name
            clone = File.objects.filter(name__icontains=base, parent=self.parent, owner=self.owner)
            if clone.exists():
                ts = int(timezone.now().timestamp() * 1000)
                self.name = f'{base}_{ts}'
        # Обновляем размер файла
        if self.file and not self.is_directory:
            self.size = self.file.size

            # Определяем MIME-тип
            if not self.mime_type:
                mime_type, _ = mimetypes.guess_type(self.file.name)
                self.mime_type = mime_type or 'application/octet-stream'

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """При удалении удаляем и физический файл"""
        if self.file and not self.is_directory:
            storage = self.file.storage
            if storage.exists(self.file.name):
                storage.delete(self.file.name)

        # Рекурсивно удаляем все дочерние элементы
        if self.is_directory:
            for child in self.children.all():
                child.delete()

        super().delete(*args, **kwargs)

    def get_full_path(self):
        """Получить полный путь к файлу/папке"""
        if self.parent:
            return os.path.join(self.parent.get_full_path(), self.name)
        return self.name

    def get_physical_path(self):
        """Получить физический путь на диске (если это файл)"""
        if self.file:
            return self.file.path
        return None

    def get_size_display(self):
        """Отобразить размер в человекочитаемом формате"""
        if self.is_directory:
            # Суммируем размеры всех файлов в папке
            total_size = sum(child.get_size_display() for child in self.children.all()
                             if not child.is_directory)
            return self._format_size(total_size)
        return self._format_size(self.size)

    def calculate_size(self):
        """Форматирование размера"""
        if self.is_directory:
            # Суммируем размеры всех файлов в папке
            total_size = sum(child.size for child in self.children.all())
            return total_size
        return total_size

    @staticmethod
    def _format_size(size):
        """Форматирование размера"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} PB"

    def get_tree_structure(self):
        """Получить древовидную структуру (для API)"""
        if self.is_directory:
            return {
                'id': self.id,
                'name': self.name,
                'type': 'directory',
                'children': [child.get_tree_structure() for child in self.children.all()]
            }
        return {
            'id': self.id,
            'name': self.name,
            'type': 'file',
            'size': self.size,
            'mime_type': self.mime_type
        }
