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

                <h2 id="title">Profile</h2>
                <div class="main">
                    <div id="changePhoto"><button id="photo"><img src="../assets/profile.png"/></button>
                </div>

                <div class="infoProfile">
                    <h3>Your Nickname: <span id="red">{{nickname}}</span></h3>
                    <h3>Rounds played: {{total}}</h3>
                    <h3 id="win">Victory: {{wins}}</h3>
                    <h3 id="red">Defeat: {{loses}}</h3>
                    <h3>Place in rank: {{place}}</h3>
                </div>

                
                </div>

                <div class="footer">
                    <button><img src="../assets/settings.png"/></button>
                    <button><img src="../assets/delete.png"/></button>
                </div>
                
                
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
    background-color: black; /* Черный фон для контраста */
}

/* Создаем псевдоэлемент для градиентной границы */
.modal_container::before {
    content: '';
    position: absolute;
    top: -6px; /* Смещение вверх */
    left: -6px; /* Смещение влево */
    right: -6px; /* Смещение вправо */
    bottom: -6px; /* Смещение вниз */
    border-radius: 36px; /* Больше радиуса, чтобы граница была видна */
    background: linear-gradient(to right, #ff5e5e, #2ec0ff); /* Градиент */
    z-index: -1; /* Псевдоэлемент находится под основным элементом */
}

.modal_body{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.main{
    width:80%;
    display:flex;
    align-items: left;
    gap: 20%;
}

.infoProfile > h3{
    color: #fff;
    font-size: 30px;
    margin: 15px 0 15px 0;
}

#win{
    color:#4EB1E6;
}
#red{
    color: #FB6061;
}
#photo{
    border-radius:30px;
}

#exit{
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
    margin: 20px;
}

.footer{
    width: 90%;
    text-align: right;
    max-height: 60px;
    display: flex;
    justify-content: right;
    margin-top: 15%;
    gap: 2%;

    button{
        background:none;
        border: none;
        border-radius: 20px;
        cursor:pointer;
    }
}

</style>