<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useUserStore } from '../stores/auth.js'
import { useRoute, useRouter } from 'vue-router'
import { fetchEventSource } from '@microsoft/fetch-event-source';
import CreateLobby from '../components/CreateLobby.vue';
import EventSourcePolyfill from "eventsource-polyfill";
import Lobbies from '../components/Lobbies.vue';
import axios from "axios";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const gamemode = ref("Infinity TicTacToe")
const lobbies = ref([]);
let eventSource = null;

const isCreateLobbyOpen = ref(false);

const openedcreatelobby = () => {
  isCreateLobbyOpen.value = true;
};

const closedmodal = () => {
  isCreateLobbyOpen.value = false;
};

const reference = async (_to) => {
    eventSource.close;
    router.push(`${_to}`)
}

onMounted(async () => {
    await userStore.getSelf()

    eventSource = fetchEventSource(`${import.meta.env.VITE_API_BASE_URL}/get/lobbylist`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userStore.token}`, // Токен авторизации
    },
    onmessage(event) {
      let data = JSON.parse(event.data);
      if (data.event === "update_lobbies") {
        lobbies.value = data.data;
      }
    },
    onerror(err) {
      console.error("SSE Error:", err);
    },
  });

});

onBeforeUnmount(() => {
    if (eventSource) {
    eventSource.close;
  }
});

</script>



<template>
    
    <div class="body">

        <div class="group1">
            <button id="Back" class="back element" @click="reference('/')">
                <div class="chevron"></div><div class="stroke"></div>
            </button>
            <button id="CreateLobby" class="createlobby element" @click="openedcreatelobby">
                <div>Create Lobby</div>
            </button>
        </div>

        <div class="group2">
            <div id="Search" class="search element">
                <h3>Lobby Search</h3>
                <input id="Binput"> <button id="Bsearch"><img src="../assets/search_logo.png"></button>
            </div>
            <div id="Info" class="info element">
                <h3>You’re Info</h3>
                <div>Nickname: {{userStore.username}}</div>
                <div>Matches played: {{userStore.totalgames}}</div>
            </div>
            <div id="Listlobby" class="listlobby element">
                <h3>Lobby List</h3>
                <Lobbies v-for="el in lobbies" :id="el.id" :name="el.lobbyname" :owner="el.players['player1']" :gamemode="gamemode" :reference="reference" />
            </div>
        </div>

      <CreateLobby v-if="isCreateLobbyOpen" :closedmodal="closedmodal" />

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