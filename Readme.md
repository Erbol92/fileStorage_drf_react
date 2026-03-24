# FILESTORAGE

### Как развернуть
1. Копируем проект с github
```
git clone https://github.com/Erbol92/fileStorage_drf_react.git
```
2. Создаем .env файл, прописываем значения и сохраняем в fileStorage\fileStorageBackend\storage_backend
```
DEBUG=False/True
SECRET_KEY=random_string
ALLOWED_HOSTS=ip,domain_name....
DB_NAME=storage_db
DB_USER=example_user
DB_PASSWORD=example_password
DB_HOST=db or host
DB_PORT=5432
REDIS_HOST=redis or host
REDIS_PORT=6379
CORS_ALLOWED_ORIGINS=ip,domain_name....
CSRF_TRUSTED_ORIGINS=ip,domain_name....
EMAIL_HOST=smtp_server_name or ip
EMAIL_PORT=smtp_server_port
EMAIL_HOST_USER=email_user
EMAIL_HOST_PASSWORD=email_pass
EMAIL_USE_TLS=True/False
DEFAULT_FROM_EMAIL=example@mail.ru
FRONTEND_URL=ip,domain_name....
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
VITE_BACKEND_URL=ip or domain_name
VITE_API_URL=ip or domain_name/api
POSTGRES_DB=storage_db
POSTGRES_USER=example_user
POSTGRES_PASSWORD=example_password
```
3. В nginx/front/nginx.conf указываем свой server_name и пути до ssl сертификатов
4. Создание БД в скрипте init.sql, в случае изменения меняем .env
5. Запустить контейнеры
    ```
    docker compose up -d
    ```
6. создаем админа
   ```
   docker exec -it storage_backend bash
   python manage.py createsuperuser
   ```
7. docker compose down потушить контейнеры.