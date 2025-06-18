// src/frontend/src/services/axios.js
import axios from 'axios';
import { useAuthStore } from '../stores/auth.js'; // Используем useAuthStore
import router from '../route/router.js'; // Правильный импорт роутера
import { useUiStore } from '../stores/ui.js'; // Для открытия модалки логина

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // КРИТИЧЕСКИ ВАЖНО для куки!
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Перехватчик запросов: динамически добавляем accessToken или refreshToken
api.interceptors.request.use(
  config => {
    const authStore = useAuthStore();

    // Если кастомный флаг useRefreshTokenHeader установлен, используем refreshToken
    if (config.useRefreshTokenHeader) {
      if (authStore.refreshToken) {
        config.headers.Authorization = `Bearer ${authStore.refreshToken}`;
      }
      return config;
    }

    // Для всех остальных запросов, используем accessToken
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов: обрабатываем 401 ошибки и обновляем токен
api.interceptors.response.use(
  response => response,
  async error => {
    const authStore = useAuthStore();
    const uiStore = useUiStore(); // Для открытия модалки
    const originalRequest = error.config;

    // Если ошибка 401 и это не запрос на логин или refresh (чтобы не зациклиться), и запрос еще не был повторен
    if (error.response.status === 401 && !originalRequest.url.includes('/login') && !originalRequest.url.includes('/refresh') && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const success = await authStore.refreshAccessToken(); // Вызываем действие обновления токена
        if (success) {
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
          processQueue(null, authStore.accessToken);
          return api(originalRequest);
        } else {
          // Если refresh не удался, разлогиниваем пользователя и открываем модалку логина
          processQueue(error);
          authStore.logout();
          uiStore.openLoginModal(router.currentRoute.value.fullPath); // Открываем модалку, передавая текущий путь
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        authStore.logout();
        uiStore.openLoginModal(router.currentRoute.value.fullPath); // Открываем модалку при ошибке
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;