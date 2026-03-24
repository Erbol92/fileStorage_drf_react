# DRF storage backend

admin/ url панели администратора (Django Admin)

## API (основное)
```
GET    api/users                           # список пользователей
GET    api/users/{id}                      # получить конкретного пользователя
DELETE api/users/{id}                      # удалить пользователя
POST   api/users/{id}/update_permissions/  # сменить права пользователю администратора (персонала)

POST   api/register/                       # регистрация
GET    api/confirm-registration/           # подтверждение регистрации
POST   api/token/                          # получить пару аксес/рефреш токен по логину и паролю
POST   api/token/refresh/                  # обновить аксес токен
POST   api/token/verify/                   # проверка аксес токена
POST   api/logout/                         # разлогиниться

GET    api/files/                          # список файлов пользователя
POST   api/files/                          # создать файл у пользователя
GET    api/files/root                      # список файлов и папок в корневой директории пользователя
GET    api/files/{id}/content              # содержимое папки(id) пользователя
POST   api/files/create_folder             # создать папку у пользователя
DELETE api/files/{id}/delete_item          # удалить файл пользователя
GET    api/files/{id}/move                 # переместить файл из папки в папку пользователя
POST   api/files/{id}/rename               # переименовать файл пользователя
POST   api/files/{id}/share                # сформировать uuid для доступа к файлу пользователя
POST   api/files/{id}/comment              # добавить комментарий к файлу пользователя
GET    api/files/search                    # поиск файлов по имени
GET    api/download                        # скачать файл (для владельца)
GET    api/download/{uuid}                 # скачать файл (гостевой доступ)
```
