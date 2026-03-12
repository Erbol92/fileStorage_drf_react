import secrets
import hashlib
from rest_framework.response import Response
from rest_framework import status


def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Унифицированный формат ошибок
    """
    error_messages = []
    if isinstance(errors, dict):
        for field, errors in errors.items():
            error_messages.append(f"{field}: {errors[0]}")
            # Создаем одно сообщение
        errors = ",".join(error_messages)
    response_data = {
        "success": False,
        "message": message,
        "errors": errors or {}
    }
    return Response(response_data, status=status_code)


def success_response(data=None, message=None, status_code=status.HTTP_200_OK):
    """
    Унифицированный формат успешных ответов (опционально)
    """
    response_data = {
        "success": True,
        "data": data,
        "message": message
    }
    return Response(response_data, status=status_code)


def make_token():
    return secrets.token_urlsafe(48)


def hash_token(token):
    return hashlib.sha256(token.encode()).hexdigest()


def to_bool(val):
    if isinstance(val, bool):
        return val
    if val is None:
        return None
    if isinstance(val, str):
        return val.lower() in ('1', 'true', 'yes', 'on')
    try:
        return bool(int(val))
    except Exception:
        return None
