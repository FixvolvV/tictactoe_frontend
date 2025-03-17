import { createWebHistory, createRouter } from 'vue-router'

import { useUserStore } from '../stores/auth';

import Main from '../views/Main.vue'
import Lobby from '../views/Lobby.vue'
import Leadersboard from '../views/Leadersboard.vue'
import Profile from '../views/Players_Profile.vue'
import Game from '../views/Game.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/', component: Main },
  { path: '/lobby', name: 'lobby', component: Lobby, meta: { requiresAuth: true } },
  { path: '/leadersboard', name: 'leadersboard', component: Leadersboard, meta: { requiresAuth: true } },
  { path: '/profile/:id', name: 'profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/game/:id', name: 'game', component: Game},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useUserStore();
  if (to.meta.requiresAuth && !authStore.token) {
    next('/');
  } else {
    next();
  }
});

export default router