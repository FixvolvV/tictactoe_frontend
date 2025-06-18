// src/frontend/src/services/sse.js
import { ref, watch, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useUiStore } from '../stores/ui.js';
import router from '../route/router.js';

// Используем полифил, который позволяет отправлять заголовки
import { fetchEventSource } from '@microsoft/fetch-event-source';

const SSE_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let eventSourceInstance = null; // Для хранения экземпляра EventSourcePolyfill
let abortController = null; // Для управления отменой запроса fetch

const isConnectedSse = ref(false);
const sseMessages = ref([]); // Общий лог SSE-сообщений (для отладки)
const sseError = ref(null);

// Система событий для компонентов, аналогичная WebSocket-сервису
const eventListeners = new Map();

const onSseEvent = (eventName, callback) => {
    if (!eventListeners.has(eventName)) {
        eventListeners.set(eventName, []);
    }
    eventListeners.get(eventName).push(callback);
};

const offSseEvent = (eventName, callback) => {
    if (eventListeners.has(eventName)) {
        const listeners = eventListeners.get(eventName);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
};

const emitSseEvent = (eventName, data) => {
    if (eventListeners.has(eventName)) {
        eventListeners.get(eventName).forEach(callback => callback(data));
    }
};

const connectSse = (endpoint) => {
    const authStore = useAuthStore();
    const uiStore = useUiStore();

    // Если уже подключено или в процессе подключения/отключения, ничего не делаем
    if (isConnectedSse.value) {
        console.log('SSE: Уже подключено.');
        return;
    }
    // Если нет токена, не пытаемся подключиться и, возможно, предлагаем войти
    if (!authStore.isLoggedIn || !authStore.accessToken) {
        console.log('SSE: Пользователь не авторизован, не подключаемся.');
        sseError.value = 'Требуется аутентификация для SSE.';
        uiStore.openLoginModal(router.currentRoute.value.fullPath);
        return;
    }

    // Отключаем предыдущее соединение, если оно есть
    disconnectSse();

    console.log(`SSE: Попытка подключения к ${SSE_BASE_URL}${endpoint}...`);
    sseError.value = null; // Сброс ошибки
    isConnectedSse.value = false; // Предполагаем, что пока не подключено

    // Создаем новый AbortController для возможности отмены запроса
    abortController = new AbortController();

    try {
        eventSourceInstance = fetchEventSource(`${SSE_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authStore.accessToken}`, // <-- Передаем access token в заголовке
                'Accept': '*/*', // Важно для SSE
            },
            signal: abortController.signal, // Связываем контроллер с запросом

            // Обработчики событий EventSourcePolyfill
            onopen(response) {
                if (response.ok) {
                    isConnectedSse.value = true;
                    console.log('SSE: Соединение установлено!');
                    sseMessages.value.push({ type: 'status', message: 'Connected', timestamp: new Date() });
                    emitSseEvent('sse:connected');
                } else {
                    // Обработка HTTP-ошибок, которые не 401 (401 будет в onerror)
                    console.error('SSE: Ошибка HTTP при подключении:', response.status, response.statusText);
                    sseError.value = `Ошибка подключения SSE: ${response.status} ${response.statusText}`;
                    emitSseEvent('sse:error', { type: 'http_error', status: response.status, statusText: response.statusText });
                    disconnectSse(); // Закрываем соединение при ошибке
                }
            },
            onmessage(event) {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch (e) {
                    console.error('SSE: Не удалось распарсить JSON из сообщения:', event.data, e);
                    sseMessages.value.push({ type: 'error', message: `Невалидный JSON: ${event.data}`, timestamp: new Date() });
                    emitSseEvent('sse:error', { type: 'parse_error', data: event.data });
                    return;
                }

                console.log('SSE: Получено сообщение:', data);
                sseMessages.value.push({ type: 'message', data: data, timestamp: new Date() });

                // Важно: ваш бэкенд шлет "event" в объекте сообщения.
                // Здесь мы обрабатываем "update_lobbies", как в вашем Lobby.vue
                if (event.event === "lobby_update") {
                    emitSseEvent('lobbies:update', data); // data.data - это сам список лобби
                } else {
                    // Если есть другие кастомные события SSE, можно их здесь обрабатывать
                    emitSseEvent(`sse:${data.event}`, data);
                }
            },
            onclose() {
                isConnectedSse.value = false;
                console.log('SSE: Соединение закрыто.');
                sseMessages.value.push({ type: 'status', message: 'Disconnected', timestamp: new Date() });
                emitSseEvent('sse:disconnected');
            },
            onerror(err) {
                isConnectedSse.value = false;
                console.error('SSE: Ошибка EventSource:', err);
                sseError.value = err.message || 'Ошибка SSE соединения.';

                // Обработка 401 Unauthorized (если полифил возвращает статус в ошибке)
                if (err.response && err.response.status === 401) {
                    console.warn('SSE: 401 Unauthorized. Токен недействителен.');
                    sseError.value = 'Сессия SSE истекла. Пожалуйста, войдите снова.';
                }

                emitSseEvent('sse:error', err);
                disconnectSse(); // Закрываем соединение, чтобы EventSourcePolyfill не пытался бесконечно переподключаться на невалидном токене
            },
        });
    } catch (err) {
        console.error('SSE: Не удалось инициировать EventSource:', err);
        sseError.value = 'Не удалось инициировать SSE соединение.';
        isConnectedSse.value = false;
        emitSseEvent('sse:error', err);
    }
};

const disconnectSse = () => {

    if (abortController) { // Если контроллер существует
        console.log('SSE: Отмена запроса EventSource...');
        abortController.abort(); // Вызываем abort() на контроллере
        abortController = null; // Обнуляем контроллер
    }
    isConnectedSse.value = false;
    sseError.value = null;
};

// Инициализация сервиса: наблюдение за состоянием аутентификации
const initSseService = () => {
    const authStore = useAuthStore();

    // Наблюдаем за изменением статуса логина
    watch(() => authStore.isLoggedIn, (newVal) => {
        // Если пользователь залогинился, но SSE не подключено
        // (Попытка подключения будет из Lobby.vue при mounted, но эта часть важна для автоподключения)
        // if (newVal && !isConnectedSse.value) {
        //   // Мы не подключаемся автоматически здесь, так как SSE специфично для страницы Lobby.
        //   // Подключение будет инициировано из Lobby.vue
        // } 
        // Если пользователь разлогинился, отключаем SSE
        if (!newVal) {
            disconnectSse();
        }
    }, { immediate: true }); // immediate: true для проверки при первой загрузке

    // Отключаемся при размонтировании корневого приложения
    onUnmounted(() => {
        disconnectSse();
    });
};

export {
    initSseService,
    connectSse,
    disconnectSse,
    isConnectedSse,
    sseMessages, // Для отладки
    sseError,
    onSseEvent,
    offSseEvent,
};