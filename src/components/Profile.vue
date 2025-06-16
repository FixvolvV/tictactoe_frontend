<template>
    <div class="modal">
        <div class="modal_container">
            <div class="modal_body">

                <h2 id="title">Profile</h2>
                <div class="main">
                    <div id="changePhoto"><button id="photo"><img src="../assets/profile.png" alt=""/></button></div>

                    <div class="infoProfile" v-if="profileData">
                        <h3>Your Nickname: <span id="red">{{profileData.username}}</span></h3>
                        <h3>Rounds played: {{profileData.profile.wins + profileData.profile.loses || 0}}</h3>
                        <h3 id="win">Victory: {{profileData.profile.wins || 0}}</h3>
                        <h3 id="red">Defeat: {{profileData.profile.loses || 0}}</h3>
                        <h3>Place in rank: {{userPlace || 'N/A'}}</h3>
                    </div>
                    <div v-else-if="loading" class="infoProfile">
                        <h3>Loading Profile</h3>
                    </div>
                    <div v-else-if="error" class="infoProfile">
                        <h3>Loading Profile Error</h3>
                    </div>
                </div>

                <div class="footer">
                    <button><img v-if="!user" @click="uiStore.openSettingsModal" src="../assets/settings.png" alt=""/></button>
                    <button><img v-if="!user" @click="authStore.logout" src="../assets/account_leave.png" alt=""/></button>
                </div>
                
            </div>
            <div class="error" v-if="error" style="color: red;">{{error}}</div>
            <button id="exit" @click="uiStore.closeProfileModal()">&#10006;</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../services/axios.js';
import { useUiStore } from '../stores/ui.js';
import { useAuthStore } from '../stores/auth.js'; // Используем authStore для получения currentUser
import { useLeaderboardStore } from '../stores/leaderboard.js';

const uiStore = useUiStore();
const authStore = useAuthStore(); // Получаем authStore
const leaderboardStore = useLeaderboardStore(); // NEW: Получаем экземпляр стора лидеров

const user = ref(null)
const profileData = ref(null);
const loading = ref(false);
const error = ref(null);
const response = ref(null)
const userPlace = ref(null)

const fetchProfile = async (userId) => {
    user.value = userId
    loading.value = true;
    error.value = null;
    try {
        if (userId === null) {
            response.value = await api.get(`/user/`);
        } else {
            response.value = await api.get(`/user/${userId}`);
        }

        profileData.value = response.value.data;
        userPlace.value = leaderboardStore.getUserPlace(response.value.data.id) 
    } catch (err) {
        console.error("Loading Profile Error:", err);
        error.value = err.response?.data?.message || 'Failed to load profile.';
        profileData.value = null;
    } finally {
        loading.value = false;
    }
};

watch(() => uiStore.profileIdToShow, (newId) => {
  if (uiStore.isProfileModalOpen) { 
    fetchProfile(newId);
  } else {
    profileData.value = null; 
    error.value = null; 
  }
}, { immediate: true }); 

onMounted(() => {
  if (leaderboardStore.leaders.length === 0 && !leaderboardStore.loading) {
    leaderboardStore.fetchLeaders();
  }
});

</script>


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

.error {
    text-align: center;
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

    img{
    width: 50px;
    height: 50px;
}
}

</style>