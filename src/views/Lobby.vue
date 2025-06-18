<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '../stores/auth.js'; // Используем useAuthStore
import { useRouter } from 'vue-router'; // useRoute не используется
import { useUiStore } from '../stores/ui.js';
import CreateLobby from '../components/CreateLobby.vue';
import Lobbies from '../components/Lobbies.vue';
import Search from '../components/Search.vue';
import { connectSse, disconnectSse, onSseEvent, offSseEvent} from '../services/sse.js';

const router = useRouter();
const authStore = useAuthStore(); // Используем useAuthStore
const uiStore = useUiStore();

const gamemode = ref("Infinity TicTacToe");
const lobbies = ref();
let eventSource = null; // Для SSE

const isCreateLobbyOpen = ref(false);
const isSearch = ref(false);

const openedcreatelobby = () => { isCreateLobbyOpen.value = true; };
const openSearch = () => { isSearch.value = true; };
const closedmodal = () => {
  isCreateLobbyOpen.value = false;
  isSearch.value = false;
};

// --- Обработчики событий SSE ---
const handleLobbiesUpdate = (data) => {
  lobbies.value = data; // Обновляем список лобби
};

const handleSseConnected = () => {
  console.log('Lobby: SSE connected!');

};

const handleSseDisconnected = () => {
  console.log('Lobby: SSE disconnected!');
};

const handleSseError = (error) => {
  console.error('Lobby: SSE error:', error);
};


onMounted(async () => {
  // Подключаемся к SSE, когда компонент монтируется и пользователь авторизован
  onSseEvent('lobbies:update', handleLobbiesUpdate);
  onSseEvent('sse:connected', handleSseConnected);
  onSseEvent('sse:disconnected', handleSseDisconnected);
  onSseEvent('sse:error', handleSseError);

  if (authStore.isLoggedIn) {
    connectSse('/lobby/all/wait/'); // <-- Эндпоинт для получения списка лобби через SSE
  }
});

onBeforeUnmount(() => {
  // Отключаемся от SSE, когда компонент размонтируется
  disconnectSse(); 
  offSseEvent('lobbies:update', handleLobbiesUpdate);
  offSseEvent('sse:connected', handleSseConnected);
  offSseEvent('sse:disconnected', handleSseDisconnected);
  offSseEvent('sse:error', handleSseError);
});

</script>

<template>
    <div class="body">
      <div class="buttonMenu-wrapper">
          <div class="buttonMenu">
            <button @click="router.push('/')" class="elementMenu"><img src="../assets/backButton.png" alt=""/></button>
            <button @click="uiStore.openProfileModal(null)" class="elementMenu"><img src="../assets/infoButton.png" alt=""/></button>
            <button @click="openedcreatelobby" class="elementMenu"><img src="../assets/createLobby.png" alt=""/></button>
            <button @click="openSearch" class="elementMenu"><img src="../assets/search.png" alt=""/></button>
          </div>
      </div>
      
      <div class="lobby-gradient-wrapper">
        <div id="Listlobby">
            <h3>Lobby List</h3>
            <div class="lobbies-container">
                <Lobbies v-for="el in lobbies" :key="el.id"
                        :id="el.id"
                        :name="el.name"
                        :owner="el.owner"
                        :gamemode="el.gametype" />
            </div>
        </div>
      </div>
      
      <CreateLobby v-if="isCreateLobbyOpen" :closedmodal="closedmodal" />
      <Search v-if="isSearch" :closedmodal="closedmodal"/>
    </div>
</template>


<style scoped>

@import url(../css/lobby.css);


</style>