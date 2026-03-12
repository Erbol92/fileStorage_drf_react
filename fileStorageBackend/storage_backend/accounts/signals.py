from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
from storage.models import File
import os
from storage_backend.settings import MEDIA_ROOT
# from storage.models import File


@receiver(post_save, sender=User)
def create_user_directory(sender, instance, created, **kwargs):
    if not created:
        return
    user = instance
    folder_path = os.path.join(MEDIA_ROOT, user.username)
    folder = os.makedirs(folder_path, exist_ok=True)
    file = File.objects.get_or_create(
        name=user.username,
        owner=user,
        is_directory=True,
        mime_type='inode/directory',
        file=None,
        parent=None
    )
