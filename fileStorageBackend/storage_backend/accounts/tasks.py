from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task
from .models import RegistrationRequest

@shared_task(
    bind=True, 
    default_retry_delay=60,  # Повтор через 1 минуту при сбое
    max_retries=3            # Максимум 3 попытки
)
def send_confirmation_email(self, reg_id, verify_url, email):
    try:
        subject = "подтвердите почту"
        message = f"перейдите по ссылке для потдверждения: {verify_url}"
        sent = send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False)
        if sent:
            RegistrationRequest.objects.filter(id=reg_id).update(
                is_email_sent=True,
            )
            return f"письмо {email} успешно отправленно"
    except Exception as exc:
        raise self.retry(exc=exc)