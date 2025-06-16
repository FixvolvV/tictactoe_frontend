// src/frontend/src/stores/leaderboard.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/axios.js';
import { useAuthStore } from './auth.js';

export const useLeaderboardStore = defineStore('leaderboard', () => {
    // --- СОСТОЯНИЕ ---
    const leaders = ref([]); // Изначально пустой массив, это правильно
    const loading = ref(false);
    const error = ref(null);

    // --- ГЕТТЕРЫ ---
    const sortedLeaders = computed(() => {
        if (!Array.isArray(leaders.value)) {
            console.warn("leaders.value is not an array:", leaders.value);
            return []; // Возвращаем пустой массив, чтобы не вызывать ошибку
        }

        // Фильтруем (если нужно, исходя из вашего бэкенда)
        const publicLeaders = leaders.value.filter(user => user.isProfilePublic !== false); // TODO: Уточните флаг `isProfilePublic`

        // Сортируем
        return publicLeaders.sort((a, b) => {
            if (b.profile.wins !== a.profile.wins) {
                return b.profile.wins - a.profile.wins;
            }
            if (a.profile.loses !== b.profile.loses) {
                return a.profile.loses - b.profile.loses;
            }
            return a.username.localeCompare(b.username);
        }).map((user, index) => ({
            ...user,
            place: index + 1
        }));
    });

    const getUserPlace = computed(() => (userId) => {
        const user = sortedLeaders.value.find(leader => leader.id === userId);
        if (user && user.place) {
            return user.place;
        }
        return 'N/A';
    });

    // --- ДЕЙСТВИЯ ---

    const fetchLeaders = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.get("/user/all");

            // <<< ИСПРАВЛЕНИЕ ЗДЕСЬ: Убедитесь, что leaders.value всегда массив
            if (Array.isArray(response.data.users)) {
                leaders.value = response.data.users;
            } else {
                console.error("API response for leaders is not an array:", response.data);
                leaders.value = []; // Принудительно устанавливаем пустой массив
                error.value = "Получены некорректные данные от сервера.";
            }
        } catch (err) {
            console.error('Ошибка загрузки списка лидеров:', err);
            error.value = err.response?.data?.message || 'Не удалось загрузить список лидеров.';
            leaders.value = []; // Очищаем список при ошибке, чтобы он был массивом
        } finally {
            loading.value = false;
        }
    };

    return {
        leaders,
        loading,
        error,
        sortedLeaders,
        getUserPlace,
        fetchLeaders,
    };
});