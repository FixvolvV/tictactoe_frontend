<script setup>
import { ref, onMounted } from 'vue';
import Leaders from '../components/Leaders.vue';
import Profile from '../components/Profile.vue';
import Search from '../components/Search.vue';
import { useUserStore } from '../stores/auth.js'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/axios.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const leaders = ref([{id: 0, username:'Xuih', games:{wins:3, loses: 4}}, {id: 0, username:'Xuih', games:{wins:3, loses: 4}}, {id: 0, username:'Xuih', games:{wins:3, loses: 4}}, {id: 0, username:'Xuih', games:{wins:3, loses: 4}}, {id: 0, username:'Xuih', games:{wins:3, loses: 4}}]);

// Состояния модальных окон
const isProfile = ref(false);
const isSearch = ref(false);

// Функция открытия профиля
const openProfile = () => {
  isProfile.value = true;
};

// Функция открытия поиска
const openSearch = () => {
  isSearch.value = true;
};

// Функция закрытия модальных окон
const closedmodal = () => {
    isProfile.value = false;
    isSearch.value = false;
};


const getLeaders = async () => {
    leaders.value = await api.get("/get/leaderslist")
    leaders.value = leaders._rawValue.data
}

onMounted(async () => {
    await userStore.getSelf()
    await getLeaders()
})
</script>

<template>
    <div class="body">
        <div class="buttonMenu-wrapper">
          <div class="buttonMenu">
            <button @click="router.push('/')" class="elementMenu"><img src="../assets/backButton.png"/></button>
            <button @click="openProfile" class="elementMenu"><img src="../assets/infoButton.png"/></button>
            <button @click="openSearch" class="elementMenu"><img src="../assets/search.png"/></button>
          </div>
        </div>

        <div class="leaderboard-gradient-wrapper">
            <div id="leaderbord">
                <h3>Leaderboard</h3>
                <div class="leaderbord-container">
                    <Leaders v-for="(el, index) in leaders"
                            :key="el.id"
                            :id="el.id"
                            :place="index+1"
                            :username="el.username"
                            :wins="el.games['wins']"
                            :loses="el.games['loses']" />
                </div>
            </div>
        </div>

        <!-- Модальное окно профиля -->
        <Profile v-if="isProfile" :closedmodal="closedmodal"/>

        <!-- Модальное окно поиска -->
        <Search v-if="isSearch" :closedmodal="closedmodal"/>
    </div>
</template>

<style scoped>
@import url(../css/leadersboard.css);

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

.listleaders{
  overflow: hidden;
  overflow-y: scroll;
  -ms-overflow-style: none;  /* IE 10+ */
  scrollbar-width: none;
}

/* Стили для модальных окон */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #1a1a1a;
  padding: 20px;
  border-radius: 10px;
  max-width: 80%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  border: 2px solid;
  border-image: linear-gradient(to right, #ff5e5e, #2ec0ff);
  border-image-slice: 1;
}
</style>