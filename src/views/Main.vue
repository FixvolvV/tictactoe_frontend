<script setup>
import { ref, onMounted } from 'vue';
import Register from '../components/Register.vue';
import Login from '../components/Login.vue';
import Patch from '../components/Patch.vue';
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/auth.js'
import api from '../services/axios.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// Реактивные переменные (аналог data())
const now = ref(null);
const total = ref(null);
const openregister = ref(false);
const openlogin = ref(false);
const patchs = ref([]);

// Управляем состоянием окон
const isLoginOpen = ref(false);
const isRegisterOpen = ref(false);

// Функции открытия и закрытия окон
const openedlogin = () => {
  isLoginOpen.value = true;
  isRegisterOpen.value = false;
};

const openedregister = () => {
  isRegisterOpen.value = true;
  isLoginOpen.value = false;
};

const closedmodal = () => {
  isLoginOpen.value = false;
  isRegisterOpen.value = false;
};

onMounted(async () => {
  const response = await api.get('/get/global');
  now.value = response.data.now
  total.value = response.data.total
  await userStore.getSelf()

})

</script>


<template>
 
 <div class="body">

  <div id="Header" class="header">
      <img id="Logo" class="element" src="../assets/logo.png">
      <h1 id="Name" class="element"> TicTacToe </h1>
      <button id="BPlay" class="element" @click="router.push('/lobby')"> Play </button>
      <button id="BLeadersboard" class="element" @click="router.push('/leadersboard')"> Leadersboard </button>
      <button v-if="!userStore.token" id="BAccount" class="element" @click="openedregister">Account<img src="../assets/account_icon_null.png"></button>
      <button v-if="userStore.token" id="BAccount" class="element" @click="router.push(`/profile/${userStore.user}`)">You're logged in<img src="../assets/account_icon_full.png"></button>
  </div>

    <div class="info">
      
      <div id="General" class="general">
        <div><span class="static">Now Play:</span> {{ now }} </div>
        <div><span class="static">Total Games:</span> {{ total }} </div>
      </div>

      <div id="Siteinfo" class="siteinfo">
        <h2>Site Info</h2>
        <div class="line"></div>
        <div class="info1">Сайт находиться в разработке !!!</div>
        <div class="info2">Заметили баг? :) <br/> Зайдите в дискорд и сообщите о нем!</div>
        <div class="info3">Сайт посвященный известной популярной игре “крестики нолики” но в их бесконечной форме.</div>
        <div class="info3">Для того что бы победить вам нужно собрать 5 крестов или ноликов в ряд, на бесконечном поле.</div>
      </div>

      <div id="Pathnotes" class="pathnotes">
        <h2>Path notes</h2>
        <Patch v-for="el in patchs" :idpatch = "el.idpatch" :numberpatch="el.numberpatch" />
      </div>
    </div>

    <div id="Footer" class="footer">
      <img src="../assets/github_logo.png">
      <img src="../assets/discord_logo.png">
    </div>

  </div>

  <Register v-if="isRegisterOpen" :closedmodal="closedmodal" :openedlogin="openedlogin" />
  <Login v-if="isLoginOpen" :closedmodal="closedmodal" :openedregister="openedregister" />

</template>

<style scoped>

@import url(../css/Index.css);

.pathnotes{
  overflow: hidden;
  overflow-y: scroll;
  -ms-overflow-style: none;  /* IE 10+ */
  scrollbar-width: none;
}

</style>