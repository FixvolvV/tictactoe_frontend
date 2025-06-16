<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'; // Используем useAuthStore
import { useUiStore } from '../stores/ui.js';   // Используем useUiStore
import api from '../services/axios.js';       // Наш настроенный Axios инстанс

// Компоненты, которые Main.vue может содержать
import Patch from '../components/Patch.vue';
// Login и Register теперь модальные окна и управляются Index.vue/uiStore, поэтому здесь не импортируются и не используются

const router = useRouter()
const authStore = useAuthStore() // Используем useAuthStore
const uiStore = useUiStore()     // Используем useUiStore

const active = ref(null);
const total = ref(null);
const patchs = ref();


onMounted(async () => {
  try {
    const response = await api.get('/general/games'); // Пример запроса через настроенный Axios
    active.value = response.data.active;
    total.value = response.data.total;
  } catch (error) {
    console.error("Failed to fetch global data:", error);
  }
});

</script>

<template>
  <div class="body">
    <header>
      <img class="element" src="../assets/logo.png" alt=""/>
      <h1 class="element">TicTacToe</h1>
      <h2 class="element"><button @click="router.push('/lobby')">Play</button></h2>
      <h2 class="element"><button @click="router.push('/leadersboard')">Leaderboard</button></h2>
      <!-- Используем uiStore для открытия модальных окон -->
      <img id="Account" class="element" v-if="authStore.isAuthenticated" @click="uiStore.openProfileModal(null)" src="../assets/account_icon.png" alt=""/>
      <img id="Account" class="element" v-else @click="uiStore.openLoginModal" src="../assets/account_icon_null.png" alt=""/>
    </header>

    <div class="flex-container">
      <div><h2>Now Play: <span style="color: #fff">{{active}}</span></h2> </div>
      <div><h2>Total Games: <span style="color: #fff">{{total}}</span></h2> </div>
    </div>

    <div class="flex-info-container">
        <div class="info">
          <h3>Site Info</h3>
          <p>The website is under development... Did you notice the <span style="color:#ff5e5e">bug</span>?)
            Go to discord and <span style="color:#ff5e5e">report it</span> to the developer. Website dedicated to the famous popular game
“tic-tac-toe” but in their infinite form. In order to win you need to collect 5 crosses or
zeros in a row, on an infinite field.</p>
        </div>
        <div class="patchs"> <h3>Patch Notes</h3>
        <Patch v-for="el in patchs" :idpatch = "el.idpatch" :numberpatch="el.numberpatch" />
        </div>
    </div>

    <footer>
      <img  id="refLogo"src="../assets/disLogo.png" alt=""/>
      <img id="refLogo"src="../assets/gitLogo.png" alt=""/>
    </footer>

    <!-- Модальные окна Login и Register теперь находятся в Index.vue, не нужно их здесь рендерить -->

  </div>
</template>

<style scoped>
@import url(../css/Index.css);

.pathnotes{
  overflow: hidden;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>