<script setup>
import { ref, onMounted, watch } from 'vue';
import image from '../assets/logo.png';
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/auth.js'
import api from '../services/axios.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// Реактивные переменные
const nickname = ref(null);
const total = ref(null);
const wins = ref(null);
const loses = ref(null);
const place = ref(null);

watch(
  async () => route.params.id,
  async (newId) => {
    const response = await api.get(`/get/profile/${route.params.id}`)
    nickname.value = response.data.user_data.username
    total.value = response.data.user_data.games['total']
    wins.value = response.data.user_data.games['wins']
    loses.value = response.data.user_data.games['loses']
    place.value = response.data.leaders_place
  }
);

onMounted(async () => {
  await userStore.getSelf()
  const response = await api.get(`/get/profile/${route.params.id}`)
  nickname.value = response.data.user_data.username
  total.value = response.data.user_data.games['total']
  wins.value = response.data.user_data.games['wins']
  loses.value = response.data.user_data.games['loses']
  place.value = response.data.leaders_place

});
</script>


<template>

    <div class="body">
        <button id="Back" class="back element" @click="router.push('/')">
            <div class="chevron"></div><div class="stroke"></div>
        </button>

        <div id="Profile" class="profile element">
            <h3>Profile</h3>
            <img :src="image">
            <div class="first">Nickname: <span style="color: #fff">{{nickname}}</span></div>
            <div class="first">Mathes played: <span style="color: #fff">{{total}}</span></div>
            <p>Wins: <span style="color: #fff">{{wins}}</span></p>
            <p>Loses: <span style="color: #fff">{{loses}}</span></p>
            <div v-if="userStore.user == route.params.id" class="first">Your place: <span style="color: #fff">{{place}}</span></div>
            <div v-else class="first">Place: <span style="color: #fff">{{place}}</span></div>
        </div>
    </div>

</template>


<style scoped>

@import url(../css/PlayersProfile.css);

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

</style>