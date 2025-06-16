// src/frontend/src/route/router.js
import { createWebHistory, createRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth.js'; // Pinia Auth Store
import { useUiStore } from '../stores/ui.js';     // Pinia UI Store

// Импортируем ваши компоненты представлений
import Main from '../views/Main.vue'
import Lobby from '../views/Lobby.vue'
import Leadersboard from '../views/Leadersboard.vue'
import Game from '../views/Game.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'main',
    component: Main
  },
  {
    path: '/lobby',
    name: 'lobby',
    component: Lobby,
    meta: { requiresAuth: true } // Для лобби требуется авторизация
  },
  {
    path: '/leadersboard',
    name: 'leadersboard',
    component: Leadersboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/game/:lobbyId', // ID лобби как параметр маршрута
    name: 'game',
    component: Game,
    meta: { requiresAuth: true } // Страница игры требует авторизации
  },
  {
    path: '/:pathMatch(.*)*', // Catch-all маршрут для 404
    name: 'NotFound',
    component: NotFound
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const uiStore = useUiStore();

  // Проверка аутентификации для защищенных маршрутов
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // Открываем модальное окно входа и передаем целевой путь
    uiStore.openLoginModal(to.fullPath);
    next(false); // Предотвращаем навигацию
  }
  // Если пользователь залогинен и пытается перейти на любой маршрут
  // (или маршрут не требует авторизации)
  else {
    uiStore.closeAllModals(); // Закрываем все модальные окна
    next(); // Разрешаем навигацию
  }
});

export default router