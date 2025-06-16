import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
    const isLoginModalOpen = ref(false);
    const isRegisterModalOpen = ref(false);

    const isProfileModalOpen = ref(false);
    const profileIdToShow = ref(null);

    const isSettingsModalOpen = ref(false);
    const isDeleteConfirmModalOpen = ref(false)
    const isChangePasswordModalOpen = ref(false)

    const redirectPathAfterLogin = ref(null);

    const openLoginModal = (path = null) => {
        closeAllModals();
        isLoginModalOpen.value = true;
        redirectPathAfterLogin.value = path;
    };

    const closeLoginModal = () => {
        isLoginModalOpen.value = false;
        redirectPathAfterLogin.value = null;
    };

    const openRegisterModal = () => {
        closeAllModals();
        isRegisterModalOpen.value = true;
    };

    const closeRegisterModal = () => {
        isRegisterModalOpen.value = false;
    };

    const openProfileModal = (userId) => {
        closeAllModals();
        isProfileModalOpen.value = true;
        profileIdToShow.value = userId;
    };

    const closeProfileModal = () => {
        isProfileModalOpen.value = false;
        profileIdToShow.value = null;
    };

    const openSettingsModal = () => {
        isProfileModalOpen.value = false;
        isSettingsModalOpen.value = true;
    };

    const closeSettingsModal = () => {
        isSettingsModalOpen.value = false;
        isProfileModalOpen.value = true;
    };

    const openDeleteConfirmModal = () => {
        isSettingsModalOpen.value = false;
        isDeleteConfirmModalOpen.value = true
    }
    const closeDeleteConfirmModal = () => {
        isDeleteConfirmModalOpen.value = false
        isSettingsModalOpen.value = true;
    }

    const openChangePasswordModal = () => {
        isSettingsModalOpen.value = false;
        isChangePasswordModalOpen.value = true
    }
    const closeChangePasswordModal = () => {
        isChangePasswordModalOpen.value = false
        isSettingsModalOpen.value = true;
    }

    const closeAllModals = () => {
        isLoginModalOpen.value = false;
        isRegisterModalOpen.value = false;
        isProfileModalOpen.value = false;
        isSettingsModalOpen.value = false;
        isDeleteConfirmModalOpen.value = false
        isChangePasswordModalOpen.value = false

        redirectPathAfterLogin.value = null;
        profileIdToShow.value = null;
    };

    return {
        isLoginModalOpen,
        isRegisterModalOpen,
        isProfileModalOpen,
        profileIdToShow,

        isSettingsModalOpen,
        openSettingsModal,
        closeSettingsModal,

        isDeleteConfirmModalOpen,
        openDeleteConfirmModal,
        closeDeleteConfirmModal,

        isChangePasswordModalOpen,
        openChangePasswordModal,
        closeChangePasswordModal,

        redirectPathAfterLogin,
        openLoginModal,
        closeLoginModal,
        openRegisterModal,
        closeRegisterModal,
        openProfileModal,
        closeProfileModal,
        closeAllModals,
    };
});