from django.contrib import admin
from .models import File
# Register your models here.


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_filter=['parent','owner']
    list_display = ['name','is_directory','mime_type','updated_at','created_at']
    readonly_fields = ('size','created_at','updated_at',)
