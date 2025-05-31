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
const patchs = ref([{idpatch: 1, numberpatch: "0.0.0"}, {idpatch: 1, numberpatch:"0.0.0"}] );

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
  // const response = await api.get('/get/global');
  // now.value = response.data.now
  // total.value = response.data.total
  // await userStore.getSelf()

})

</script>


<template>
  <div class="body">
    <header>
      <img class="element" src="../assets/logo.png"/>
      <h1 class="element">TicTacToe</h1>
      <h2 class="element"><button @click="router.push('/lobby')">Play</button></h2>
      <h2 class="element"><button @click="router.push('/leadersboard')">Leaderboard</button></h2>
      <img  id="Account" class="element" @click="openedregister" src="../assets/account_icon_null.png"/>
    </header>



    <div class="flex-container">
      <div><h2>Now Play: <span style="color: #fff">{{now}}</span></h2> </div>

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
      <img  id="refLogo"src="../assets/disLogo.png"/>
      <img id="refLogo"src="../assets/gitLogo.png"/>
    </footer>


    <Register v-if="isRegisterOpen" :closedmodal="closedmodal" :openedlogin="openedlogin" />


  <Login v-if="isLoginOpen" :closedmodal="closedmodal" :openedregister="openedregister" />


  </div>


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