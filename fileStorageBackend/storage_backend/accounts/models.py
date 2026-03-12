from django.db import models
from django.utils import timezone


class RegistrationRequest(models.Model):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, null=True, blank=True)
    token_hash = models.CharField(max_length=128, unique=True)
    # Django password hasher output
    password_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_email_sent = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at
