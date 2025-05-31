<script setup>
import { ref, onMounted, watch } from 'vue';
import image from '../assets/logo.png';
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/auth.js'
import api from '../services/axios.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const props = defineProps({
    closedmodal:{
        type: Function,
        required: true,
    }
});

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

  <!-- image
  nickname
  total
  wins
  loses
  place -->

    <div class="modal">
        <div class="modal_container">
            <div class="modal_body">

                <h1 id="title">In development...</h1>
                
                
            </div>
            <div class="error">{{_error}}</div>
            <button id="exit" @click="closedmodal">&#10006;</button>
        </div>
    </div>

</template>


<style scoped>
* {
  font-family: var(--font-family);
  color: whitesmoke;
}
.modal {
  position: fixed;
  display: flex;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
}

.modal_container {
  position: relative;
  margin: auto;
  width: 700px;
  height: 510px;
  border-radius: 30px;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Создаем псевдоэлемент для градиентной границы */
.modal_container::before {
  content: '';
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 36px;
  background: linear-gradient(to right, #ff5e5e, #2ec0ff);
  z-index: -1;
}

.modal_body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

#exit {
  position: absolute;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 45px;
  color: #fff;
  top: 35px;
  right: 35px;
}

#title {
  font-size: 40px;
  margin: 0;
  text-align: center;
}
</style>