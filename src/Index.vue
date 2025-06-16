<template>
  <div id="app-wrapper">
    <router-view />


    <Login v-if="uiStore.isLoginModalOpen" @close="uiStore.closeLoginModal" />
    <Register v-if="uiStore.isRegisterModalOpen" @close="uiStore.closeRegisterModal" />
    <Profile v-if="uiStore.isProfileModalOpen" @close="uiStore.closeProfileModal" />
    <Settings v-if="uiStore.isSettingsModalOpen" @close="uiStore.closeSettingsModal" />
    <DelAccount v-if="uiStore.isDeleteConfirmModalOpen" @close="uiStore.closeDeleteConfirmModal" />
    <ChangePassword v-if="uiStore.isChangePasswordModalOpen" @close="uiStore.closeChangePasswordModal" />

  </div>
</template>

<script setup>
import { useUiStore } from './stores/ui.js'; 

import Login from './components/Login.vue';     
import Register from './components/Register.vue'; 
import Profile from './components/Profile.vue';
import Settings from './components/Settings.vue';
import DelAccount from './components/DelAccount.vue';
import ChangePassword from './components/ChangePassword.vue';  

const uiStore = useUiStore();
</script>