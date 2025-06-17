// src/frontend/src/services/websocket.js
import { useAuthStore } from '../stores/auth.js';
import { useUiStore } from '../stores/ui.js'; // Для открытия модалки логина при WS аутентификации
import { ref, watch, onUnmounted } from 'vue';
import router from '../route/router.js'; // Для программной навигации (если нужно перенаправить на логин)

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

let socket = null;
let currentLobbyId = null;

const isConnected = ref(false);
const wsMessages = ref([]);
const wsError = ref(null);
const reconnectAttempts = ref(0);
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 2000;

// Система событий для компонентов
const eventListeners = new Map();

const onWsEvent = (eventName, callback) => {
    if (!eventListeners.has(eventName)) {
        eventListeners.set(eventName, []);
    }
    eventListeners.get(eventName).push(callback);
};

const offWsEvent = (eventName, callback) => {
    if (eventListeners.has(eventName)) {
        const listeners = eventListeners.get(eventName);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
};

const emitWsEvent = (eventName, data) => {
    if (eventListeners.has(eventName)) {
        eventListeners.get(eventName).forEach(callback => callback(data));
    }
};

const connectWebSocket = (lobbyId) => {
    const authStore = useAuthStore();
    const uiStore = useUiStore();

    if (!authStore.isLoggedIn) {
        console.log('WebSocket: Пользователь не авторизован, не подключаемся.');
        uiStore.openLoginModal(router.currentRoute.value.fullPath);
        return;
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket: Уже подключено.');
        return;
    }
    if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.CLOSING)) {
        console.log('WebSocket: Соединение уже в процессе или закрывается.');
        return;
    }

    currentLobbyId = lobbyId;
    const fullWsUrl = `${WS_BASE_URL}/game/${lobbyId}`; //${lobbyId}

    console.log(`WebSocket: Попытка подключения к ${fullWsUrl}...`);
    wsError.value = null;

    try {
        socket = new WebSocket(fullWsUrl);

        socket.onopen = () => {
            isConnected.value = true;
            reconnectAttempts.value = 0;
            console.log('WebSocket: Соединение установлено!');
            wsMessages.value.push({ type: 'status', message: 'Connected', timestamp: new Date() });
            emitWsEvent('ws:connected');
        };

        socket.onmessage = (event) => {
            let message;
            try {
                message = JSON.parse(event.data);
            } catch (e) {
                console.error('WebSocket: Не удалось распарсить JSON:', event.data, e);
                wsMessages.value.push({ type: 'error', message: `Невалидный JSON: ${event.data}`, timestamp: new Date() });
                emitWsEvent('ws:error', { type: 'parse_error', data: event.data });
                return;
            }

            console.log('WebSocket: Получено сообщение:', message);
            wsMessages.value.push({ type: 'message', data: message, timestamp: new Date() });

            if (message.error) {
                wsError.value = message.error;
                emitWsEvent('game:error', message.error);
            }
            else if (message.info) {
                emitWsEvent('game:info', message.info);
            }
            else if (message.event) {
                switch (message.event) {
                    case "ping":
                        sendWebSocketMessage({ action: "ping" });
                        emitWsEvent('ws:ping');
                        break;
                    // ИСПРАВЛЕНИЕ 1: Имя события синхронизировано с бэкендом
                    case "game:joined":
                        // Бэкенд теперь посылает полное состояние, включая players, symbol и т.д.
                        // Поэтому просто передаем весь message как данные для 'game:joined'
                        emitWsEvent('game:joined', message);
                        break;
                    case "you_ready": // Это событие бэкенд вроде больше не шлёт явно, его заменяет lobby_state_update
                        emitWsEvent('game:you_ready'); // Можно оставить для обратной совместимости, если бэкенд вернет
                        if (message.players) { emitWsEvent('game:lobby_state_update', message); }
                        break;
                    case "start": // Это событие бэкенд тоже больше не шлёт, его заменяет lobby_state_update
                        emitWsEvent('game:start', { symbol: message.symbol, state: message.state }); // Сохраняем, если бэкенд вернет
                        if (message.players || message.board_state) { emitWsEvent('game:lobby_state_update', message); }
                        break;
                    case "win":
                        emitWsEvent('game:win', message); // Передаем весь message, чтобы получить win_line
                        break;
                    case "lose":
                        emitWsEvent('game:lose', message); // Передаем весь message, чтобы получить win_line
                        break;
                    case "lobby_state_update":
                        emitWsEvent('game:lobby_state_update', message);
                        break;
                    default:
                        console.warn('WebSocket: Неизвестное событие:', message.event, message);
                        emitWsEvent(`game:${message.event}`, message);
                }
            }
            // Эта секция `else if` для `game:move_made` - если она все еще нужна,
            // убедитесь, что бэкенд не отправляет `lobby_state_update` сразу после `move_made`,
            // чтобы избежать двойных обновлений. В текущем бэкенде `handle_move` отправляет
            // `lobby_state_update` после каждого хода, поэтому этот `else if` может быть избыточен.
            // Если бэкенд отправляет `move_made` БЕЗ полного `lobby_state_update`, тогда это нужно.
            // Но обычно `lobby_state_update` - это самый универсальный вариант.
            // Если `move_made` событие прилетает в `message.event` (как string),
            // то оно будет обработано `switch case "move_made"`.
            // Если оно приходит как отдельное JSON-поле, то логика ниже.
            // Я бы рекомендовал придерживаться `message.event` для всех типов сообщений.
            else if (message.row !== undefined && message.col !== undefined && message.symbol) {
                emitWsEvent('game:move_made', message);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket: Ошибка соединения:', error);
            wsError.value = 'Ошибка WebSocket соединения.';
            isConnected.value = false;
            emitWsEvent('ws:error', error);
        };

        socket.onclose = (event) => {
            isConnected.value = false;
            console.log('WebSocket: Соединение закрыто. Код:', event.code, 'Причина:', event.reason);
            wsMessages.value.push({ type: 'status', message: `Disconnected (Code: ${event.code})`, timestamp: new Date() });
            emitWsEvent('ws:disconnected', event);

            // WS_1008_POLICY_VIOLATION (1008) часто означает проблемы с аутентификацией/политикой
            if (event.code === 1008) {
                console.warn('WebSocket: Соединение закрыто из-за нарушения политики (возможно, аутентификация).');
                wsError.value = 'Сессия WebSocket истекла или недействительна. Пожалуйста, войдите снова.';
                const authStore = useAuthStore();
                authStore.logout();
                return;
            }
            if (!event.wasClean && event.code !== 1000 && authStore.isLoggedIn) {
                if (reconnectAttempts.value < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts.value++;
                    console.log(`WebSocket: Попытка переподключения #${reconnectAttempts.value} к лобби ${currentLobbyId} через ${RECONNECT_INTERVAL / 1000} секунд...`);
                    setTimeout(() => connectWebSocket(currentLobbyId), RECONNECT_INTERVAL * reconnectAttempts.value);
                } else {
                    console.error('WebSocket: Достигнуто максимальное количество попыток переподключения. Соединение разорвано.');
                    wsError.value = 'Не удалось восстановить WebSocket соединение. Пожалуйста, перезагрузите страницу или войдите снова.';
                    emitWsEvent('ws:reconnect_failed');
                }
            }
        };
    } catch (err) {
        console.error('WebSocket: Не удалось создать соединение:', err);
        wsError.value = 'Не удалось инициировать WebSocket соединение.';
        isConnected.value = false;
        emitWsEvent('ws:error', err);
    }
};

const disconnectWebSocket = () => {
    if (socket) {
        console.log('WebSocket: Закрытие соединения...');
        if (socket.readyState === WebSocket.OPEN) {
            sendWebSocketMessage({ action: "leave" });
        }
        socket.close(1000, 'Client initiated disconnect');
        socket = null;
        currentLobbyId = null;
    }
    isConnected.value = false;
    reconnectAttempts.value = 0;
};

const sendWebSocketMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
        console.log('WebSocket: Отправлено сообщение:', message);
    } else {
        console.warn('WebSocket: Соединение не открыто для отправки сообщения:', message);
        wsError.value = 'Не удалось отправить сообщение: WebSocket не подключен.';
    }
};

const sendReady = () => { sendWebSocketMessage({ action: "ready" }); };
const sendMove = (row, col) => { sendWebSocketMessage({ action: "move", row, col }); };
const sendLeave = () => { disconnectWebSocket(); };

const initWebSocketService = () => {
    const authStore = useAuthStore();
    watch(() => authStore.isLoggedIn, (newVal) => {
        if (!newVal) { disconnectWebSocket(); }
    });
    onUnmounted(() => { disconnectWebSocket(); });
};

export {
    initWebSocketService,
    connectWebSocket,
    disconnectWebSocket,
    sendWebSocketMessage,
    sendReady,
    sendMove,
    sendLeave,
    isConnected,
    wsMessages,
    wsError,
    onWsEvent,
    offWsEvent,
    currentLobbyId
};