// src/frontend/src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './Index.vue'; // Ваш корневой компонент Vue-приложения
import router from './route/router.js'; // Ваш файл маршрутизатора
import { useAuthStore } from './stores/auth.js'; // Pinia Auth Store
import { initWebSocketService } from './services/websocket.js'; // WebSocket Service
import { initSseService } from './services/sse.js'; // Импортируем SSE сервис

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Убедитесь, что Pinia и Router готовы перед инициализацией Auth и WebSocket
router.isReady().then(() => {
    const authStore = useAuthStore();
    authStore.checkAuth(); // Проверяем и восстанавливаем состояние аутентификации

    initWebSocketService(); // Инициализируем WebSocket сервис
    initSseService();       // Инициализируем SSE сервис

    app.mount('#app');
});