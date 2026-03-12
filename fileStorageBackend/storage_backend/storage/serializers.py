from rest_framework import serializers
from .models import File


class FileSerializer(serializers.ModelSerializer):
    size_display = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            'id', 'name', 'file', 'size', 'size_display',
            'mime_type', 'parent', 'is_directory',
            'created_at', 'updated_at', 'full_path', 'comment', 'uid', 'downloaded_at'
        ]
        read_only_fields = ['size', 'mime_type',
                            'created_at', 'updated_at', 'uid', 'downloaded_at']

    def get_size_display(self, obj):
        return obj.get_size_display()

    def get_full_path(self, obj):
        return obj.get_full_path()

    def validate(self, data):
        # Проверка: папка не может иметь файл
        if data.get('is_directory') and data.get('file'):
            raise serializers.ValidationError("Папка не может содержать файл")

        # Проверка: файл должен иметь загруженный контент
        if not data.get('is_directory') and not data.get('file') and not self.instance:
            raise serializers.ValidationError("Файл должен быть загружен")

        return data


class SimpleFileSerializer(serializers.ModelSerializer):
    """Простой сериализатор для списка файлов"""
    class Meta:
        model = File
        fields = [
            'id', 'name', 'is_directory', 'size', 'created_at', 'comment', 'file', 'uid', 'downloaded_at', 'updated_at'
        ]
