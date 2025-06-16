<script setup>
import { onMounted, ref } from 'vue';
import Leaders from '../components/Leaders.vue';
import Profile from '../components/Profile.vue';
import Search from '../components/Search.vue';
import { useAuthStore } from '../stores/auth.js';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui.js';
import { useLeaderboardStore } from '../stores/leaderboard.js'; 

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore(); 
const leaderboardStore = useLeaderboardStore();

const isSearchOpen = ref(false);  

const openSearch = () => { isSearchOpen.value = true; };

const closedLocalModals = () => {
    isProfileOpen.value = false;
    isSearchOpen.value = false;
};

onMounted(async () => {
    await leaderboardStore.fetchLeaders(); 
});
</script>
<template>
    <div class="body">
        <div class="buttonMenu-wrapper">
          <div class="buttonMenu">
            <button @click="router.push('/')" class="elementMenu"><img src="../assets/backButton.png"/></button>
            <button @click="uiStore.openProfileModal(null)" class="elementMenu"><img src="../assets/infoButton.png"/></button>
            <button @click="openSearch" class="elementMenu"><img src="../assets/search.png"/></button>
          </div>
        </div>

        <div class="leaderboard-gradient-wrapper">
            <div id="leaderbord">
                <h3>Leaderboard</h3>
                <div class="leaderbord-container">
                    <Leaders v-for="(el, index) in leaderboardStore.sortedLeaders"
                            :key="el.id"
                            :id="el.id"
                            :place="el.place"
                            :username="el.username"
                            :wins="el.profile.wins"
                            :loses="el.profile.loses" />
                </div>
            </div>
        </div>

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