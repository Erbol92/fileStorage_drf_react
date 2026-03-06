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

export const api = axios.create({
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