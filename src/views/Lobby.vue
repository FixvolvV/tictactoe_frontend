<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useUserStore } from '../stores/auth.js'
import { useRoute, useRouter } from 'vue-router'
import { fetchEventSource } from '@microsoft/fetch-event-source';
import CreateLobby from '../components/CreateLobby.vue';
import EventSourcePolyfill from "eventsource-polyfill";
import Lobbies from '../components/Lobbies.vue';
import Profile from '../components/Profile.vue';
import Search from '../components/Search.vue';
import axios from "axios";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const gamemode = ref("Infinity TicTacToe")
const lobbies = ref([{id: 0, lobbyname: 'Xyeta', players: {player1: 'Nick'}}, {id: 1, lobbyname: 'Xyeta', players: {player1: 'Nick'}}, {id: 1, lobbyname: 'Xyeta', players: {player1: 'Nick'}}, {id: 1, lobbyname: 'Xyeta', players: {player1: 'Nick'}}]);
let eventSource = null;

const isCreateLobbyOpen = ref(false);
const isProfile = ref(false);
const isSearch = ref(false);

const openedcreatelobby = () => {
  isCreateLobbyOpen.value = true;
};

const openProfile = () => {
  isProfile.value = true;
};

// Функция открытия поиска
const openSearch = () => {
  isSearch.value = true;
};

const closedmodal = () => {
  isCreateLobbyOpen.value = false;
  isProfile.value = false;
  isSearch.value = false;
};

const reference = async (_to) => {
    eventSource.close;
    router.push(`${_to}`)
}

onMounted(async () => {
  //   await userStore.getSelf()

  //   eventSource = fetchEventSource(`${import.meta.env.VITE_API_BASE_URL}/get/lobbylist`, {
  //   method: "GET",
  //   headers: {
  //     Authorization: `Bearer ${userStore.token}`, // Токен авторизации
  //   },
  //   onmessage(event) {
  //     let data = JSON.parse(event.data);
  //     if (data.event === "update_lobbies") {
  //       lobbies.value = data.data;
  //     }
  //   },
  //   onerror(err) {
  //     console.error("SSE Error:", err);
  //   },
  // });

});

onBeforeUnmount(() => {
  //   if (eventSource) {
  //   eventSource.close;
  // }
});

</script>


<template>
    <div class="body">
      <div class="buttonMenu-wrapper">
          <div class="buttonMenu">
            <button @click="router.push('/')" class="elementMenu"><img src="../assets/backButton.png"/></button>
            <button @click="openProfile" class="elementMenu"><img src="../assets/infoButton.png"/></button>
            <button @click="openedcreatelobby" class="elementMenu"><img src="../assets/createLobby.png"/></button>
            <button @click="openSearch" class="elementMenu"><img src="../assets/search.png"/></button>
          </div>
      </div>
      
      <!-- Обертка для градиентной границы -->
      <div class="lobby-gradient-wrapper">
        <div id="Listlobby">
            <h3>Lobby List</h3>
            <div class="lobbies-container">
                <Lobbies v-for="el in lobbies" :key="el.id"
                        :id="el.id"
                        :name="el.lobbyname"
                        :owner="el.players.player1"
                        :gamemode="gamemode"
                        :reference="reference" />
            </div>
        </div>
      </div>
      
      <CreateLobby v-if="isCreateLobbyOpen" :closedmodal="closedmodal" />
      <Profile v-if="isProfile" :closedmodal="closedmodal"/>
      <Search v-if="isSearch" :closedmodal="closedmodal"/>
    </div>
</template>


<style scoped>

@import url(../css/lobby.css);

.chevron {
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid rgb(255, 255, 255); 
}

.stroke {
    height: 0px;
    width: 50px;
    border-top: 3px solid #ffffff;
    margin: 0%;
}

.listlobby{
  overflow: hidden;
  overflow-y: scroll;
  -ms-overflow-style: none;  /* IE 10+ */
  scrollbar-width: none;
}

</style>