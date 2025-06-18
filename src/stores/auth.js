// src/frontend/src/stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/axios.js';
import { disconnectWebSocket } from '../services/websocket.js';
import { disconnectSse } from '../services/sse.js';
import router from '../route/router.js';
import { useUiStore } from './ui.js';

export const useAuthStore = defineStore('auth', () => {

  const accessToken = ref(localStorage.getItem('accessToken') || null);
  const refreshToken = ref(localStorage.getItem('refreshToken') || null);
  const isAuthenticated = ref(!!localStorage.getItem('accessToken'));
  const loading = ref(false);
  const error = ref(null);

  const _user = ref(JSON.parse(localStorage.getItem('userdata')) || null);
  const userLoading = ref(false);
  const userError = ref(null);


  const isLoggedIn = computed(() => isAuthenticated.value);
  const currentUser = computed(() => _user.value);
  const isUserDataLoaded = computed(() => !!_user.value);


  const _setAuthTokens = (newAccessToken, newRefreshToken) => {
    accessToken.value = newAccessToken;
    refreshToken.value = newRefreshToken;
    isAuthenticated.value = !!newAccessToken;

    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
    } else {
      localStorage.removeItem('accessToken');
    }

    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }

    // После установки токенов, если пользователь авторизован, пытаемся загрузить его профиль
    if (isAuthenticated.value) {
      fetchUserData();
    } else {
      // Если токены очищены (разлогинивание), очищаем и профиль
      _user.value = null;
      localStorage.removeItem('userdata'); // Удаляем кэш профиля из localStorage
      disconnectSse();
    }
  };

  const fetchUserData = async () => {
    if (!accessToken.value) {
      _user.value = null;
      localStorage.removeItem('userdata');
      return;
    }

    userLoading.value = true;
    userError.value = null;
    try {
      const response = await api.get('/user/');
      _user.value = response.data;
      localStorage.setItem('userdata', JSON.stringify(response.data));
    } catch (err) {
      console.error('Failed to get the user:', err);
      userError.value = err.response?.data?.message || 'Failed to load user.';
      _user.value = null; // Очищаем профиль при ошибке
      localStorage.removeItem('userdata');

      if (err.response && err.response.status !== 401) {
        const uiStore = useUiStore(); // Получаем uiStore
        uiStore.openLoginModal(router.currentRoute.value.fullPath);
        logout(); // Или просто разлогинить
      }
    } finally {
      userLoading.value = false;
    }
  };


  const register = async (credentials) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/authentication/register/', credentials);
      const { access_token, refresh_token } = response.data;
      _setAuthTokens(access_token, refresh_token); // Только устанавливаем токены
      loading.value = false;
      return true;
    } catch (err) {
      loading.value = false;
      error.value = err.response?.data?.message || 'Register Error.';
      throw error.value; // Пробрасываем ошибку дальше
    }
  };

  const login = async (credentials) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post('/authentication/login/', credentials);
      const { access_token, refresh_token } = response.data;
      _setAuthTokens(access_token, refresh_token); // Только устанавливаем токены
      loading.value = false;
      return true;
    } catch (err) {
      loading.value = false;
      error.value = err.response?.data?.message || 'Login Error. Check credentials Forbidden';
      return false; // Возвращаем false при неудаче
    }
  };

  const logout = async () => {
    const uiStore = useUiStore();
    uiStore.closeAllModals();
    router.push("/")
    await api.post('/authentication/logout/');
    _setAuthTokens(null, null); // Очищаем токены (это также очистит профиль)
    localStorage.clear(); // Очищаем весь localStorage (токены и кэш профиля)
    disconnectWebSocket(); // Отключаем WebSocket при выходе
    disconnectSse(); // Отключаем SSE при выходе
  };

  const refreshAccessToken = async () => {
    error.value = null;
    if (!refreshToken.value) {
      console.warn('Нет refresh токена для обновления.');
      logout();
      return false;
    }
    try {
      const response = await api.post('/authentication/refresh/', {}, {
        useRefreshTokenHeader: true
      });
      const { access_token, refresh_token } = response.data;
      _setAuthTokens(access_token, refresh_token); // Устанавливаем новые токены
      return true;
    } catch (err) {
      console.error('Token update error:', err);
      error.value = 'The session has expired. Please log in again.';
      logout();
      return false;
    }
  };

  const checkAuth = async () => {

    if (accessToken.value && refreshToken.value && !isAuthenticated.value) {

      await refreshAccessToken();
    } else if (!accessToken.value && isAuthenticated.value) {

      logout();
    } else if (isAuthenticated.value && !_user.value) {

      await fetchUserData();
    }
  };

  return {
    // Состояние, которое доступно снаружи
    accessToken,
    refreshToken,
    isAuthenticated,
    loading,
    error,
    userLoading, // Состояние загрузки профиля
    userError,   // Ошибки загрузки профиля

    // Геттеры
    isLoggedIn,
    currentUser,        // Теперь это геттер для _user
    isUserDataLoaded, // Статус загрузки профиля

    // Действия
    register,
    login,
    logout,
    refreshAccessToken,
    checkAuth,
    fetchUserData, // Экспортируем, если нужно вручную обновить профиль
  };
});