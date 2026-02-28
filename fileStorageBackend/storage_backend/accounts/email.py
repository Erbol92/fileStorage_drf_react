from django.core.mail import send_mail
from django.conf import settings
import logging
logger = logging.getLogger(__name__)

def send_confirmation_email(request, email, token):
    verify_url = request.build_absolute_uri(f"/api/confirm-registration/?token={token}")
    subject = "подтвердите почту"
    message = f"перейдите по ссылке для потдверждения: {verify_url}"
    try:
        sent = send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
        logger.info("send_mail returned %s for %s url=%s", sent, email, verify_url)
    except Exception as e:
        logger.exception("send_mail failed: %s", e)
        raise
