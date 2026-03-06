import axios from 'axios';
import { CONFIG } from '../config';
import { store } from '../store';
import { authActions } from '../slices/authSlice';

const API_URL = CONFIG.API_URL

// Переменные для управления обновлением токена
let isRefreshing = false; // Флаг, что мы уже обновляем токен
let failedQueue = []; // Очередь запросов, которые ждут обновления токена

// Функция для обработки очереди запросов
const processQueue = (error, token = null) => {
  // Проходим по всем запросам в очереди
  failedQueue.forEach(prom => {
    if (error) {
      // Если ошибка - отклоняем промис
      prom.reject(error);
    } else {
      // Если успех - разрешаем промис с новым токеном
      prom.resolve(token);
    }
  });
  
  // Очищаем очередь
  failedQueue = [];
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Добавляем токен авторизации
api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth?.access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
  
});

// Интерсептор для добавления токена к запросам
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Сохраняем оригинальный запрос
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Если мы уже обновляем токен
      if (isRefreshing) {
        
        // Создаем новый промис и добавляем его в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ 
            resolve: (token) => {
              // Когда токен обновится - добавляем его к запросу
              originalRequest.headers.Authorization = `Bearer ${token}`;
              // И повторяем запрос
              resolve(api(originalRequest));
            },
            reject: (err) => {
              reject(err);
            }
          });
        });
      }

      // Помечаем, что мы пробуем повторить запрос
      originalRequest._retry = true;
      // Ставим флаг, что начали обновление токена
      isRefreshing = true;

      try {
        // Отправляем запрос на обновление токена
        const response = await axios.post(
          `${api.defaults.baseURL}/token/refresh/`,{}, {
            withCredentials: true
          }
        );
        const newAccessToken = response.data.access;

        // Обновляем токен в Redux store
        store.dispatch(authActions.setAccess(newAccessToken));
        
        // Обновляем заголовки по умолчанию для всех будущих запросов
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Добавляем новый токен к повторному запросу
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Обрабатываем все запросы, которые ждали в очереди
        processQueue(null, newAccessToken);
        
        // Повторяем оригинальный запрос
        return api(originalRequest);
      }
      catch (error) {
        // Если не удалось обновить токен - очищаем очередь с ошибкой
        processQueue(refreshError, null);
        
        // Очищаем токены в Redux store
        // store.dispatch(authActions.logout());
        
        // Редирект на страницу логина
        // window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        // В любом случае снимаем флаг обновления
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const fetchAccessToken = async()=>{
  const response = await api.post('/token/refresh/',{}, {
    withCredentials: true
  })
  return response.data
}

export const fetchRoot = async () => {
  const response = await api.get('/files/root/');
  return response.data;
};

export const fetchFolderContent = async (folderId) => {
  const response = await api.get(`/files/${folderId}/content/`);
  return response.data;
};

export const uploadFile = async (file, parentId, comment, onProgress) => {
  const formData = new FormData();
  formData.append('name', file.name);
  formData.append('file', file);
  formData.append('comment', comment);
  if (parentId) {
    formData.append('parent', parentId);
  }

  const response = await api.post('/files/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress
  });
  return response.data;
};

export const createFolder = async (name, parentId) => {
  const response = await api.post('/files/create_folder/', {
    name,
    parent: parentId
  });
  return response.data;
};

export const deleteItem = async (itemId) => {
  await api.delete(`/files/${itemId}/delete_item/`);
  return itemId;
};

export const moveItem = async (itemId, parentId) => {
  const response = await api.post(`/files/${itemId}/move/`, {
    parent: parentId
  });
  return response.data;
};

export const searchFiles = async (query) => {
  const response = await api.get(`/files/search/?q=${query}`);
  return response.data;
};

export const renameItem = async ({itemId, name}) => {
  const response = await api.post(`/files/${itemId}/rename/`, {
    name
  });
  return response.data;
};

export const shareItem = async ({id, stop=false}) => {
  const response = await api.post(`/files/${id}/share/`,
    null, 
    {params: { "stop":stop} } 
);
  return response.data;
};

export const getShareLink = async (uuid) => {
  const response = await api.get(`/download`,{ params: { uuid } });
  return response.data.path;
};

export const downloadUserFile = async (itemId) => {
  const response = await api.get(`/download`, { 
    params: { "id": itemId },
    responseType: 'blob' 
  });
  return response.data;
};