import { defineStore } from 'pinia';
import api from '../services/axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const username = ref(null);
  const leaders_place = ref(null);
  const totalgames = ref(null);
  const wins = ref(null);
  const loses = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const router = useRouter();

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      token.value = response.data.token_data.token;
      user.value = response.data.user;
      localStorage.setItem('token', token.value);
    } catch (error) {
      console.error('Ошибка регистрации:', error.response.data);
      throw error.response.data.detail[0].msg;
    }
  };

  const login = async (userData) => {
    try {
      const response = await api.post('/auth/login', userData);
      token.value = response.data.token_data.token;
      user.value = response.data.user;
      localStorage.setItem('token', token.value);
    } catch (error) {
      console.error('Ошибка авторизации:', error.response.data);
      throw error.response.data.detail[0].msg;
    }
  };

  const getSelf = async () => {
    try {
      const response = await api.get('/get/self');
      user.value = response.data.user_data.id;
      username.value = response.data.user_data.username;
      leaders_place.value = response.data.leaders_place
      totalgames.value = response.data.user_data.games["total"];
      wins.value = response.data.user_data.games["wins"];
      loses.value = response.data.user_data.games["loses"];
    } catch (error) {
      console.error(error.response.data);
      throw error.response.data.detail[0].msg;
    }

  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    router.push('/');
  };

  return { user, token, username, leaders_place, totalgames, wins, loses, register, login, getSelf, logout };
});