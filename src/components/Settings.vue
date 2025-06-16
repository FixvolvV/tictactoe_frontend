<!-- src/components/modals/SettingsModal.vue -->
<template>
  <div class="modal">
    <div class="modal_container">
      <div class="modal_body">
        <h2 id="title">Settings</h2>

        <div class="form_content">
          <div class="left_side">
            <label>You,re username:
            <input v-model="username" type="text" />
            </label>

            <label>You,re email:
            <input v-model="email" type="email" />
            </label>

            <label class="checkbox_label">
              Visibility:
              <input type="checkbox" v-model="visibility" />
            </label>
          </div>

          <div class="right_side">
            <label for="avatarInput" class="image_upload_label">
              <div class="image_preview">
                <img v-if="previewImage" :src="previewImage" alt="" />
                <span v-else>📷</span>
              </div>
              <span class="change_text">Change image</span>
            </label>
            <input id="avatarInput" type="file" accept="image/*" @change="onImageChange" hidden />
          </div>
        </div>

        <div class="button_block">
          <button class="button red" @click="change_password">Change Password</button>
          <button class="button red" @click="delete_account">Delete Account</button>
          <button class="button blue" @click="save_changes">Save Changes</button>
        </div>
      </div>

      <button id="exit" @click="uiStore.closeSettingsModal()">&#10006;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';
import api from "../services/axios.js"

const authStore = useAuthStore();
const uiStore = useUiStore();

// Инициализация с текущими данными пользователя
const user = computed(() => authStore.currentUser);
const username = ref(user.value?.username || '');
const email = ref(user.value?.email || '');
const visibility = ref(user.value?.profile?.visibility || false); // Пока флаг, без логики

const previewImage = ref(null);

const closeSettingsModal = () => {
  uiStore.closeSettingsModal();
};


const save_changes = async () => {
    const data = {
        username: username.value,
        email: email.value,
        profile: {
            visibility: visibility.value
        }
    }   

    try {
        await api.patch('/user', data);
        await authStore.fetchUserData();
        uiStore.closeSettingsModal();
        console.log('Профиль успешно обновлён');
    } catch (err) {
        console.error('Ошибка при обновлении профиля:', err);
    }
};

const change_password = () => uiStore.openChangePasswordModal();
const delete_account = () => uiStore.openDeleteConfirmModal();

// const onImageChange = (event) => { #TODO Доделать позже
//   const file = event.target.files[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       previewImage.value = e.target.result;
//     };
//     reader.readAsDataURL(file);
//   }
// };
</script>

<style scoped>
* {
  font-family: var(--font-family);
  color: whitesmoke;
  box-sizing: border-box;
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
  width: 50vw;
  height: 60vh;
  border-radius: 30px;
  background-color: black;
}

.modal_container::before {
  content: '';
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 36px;
  background: linear-gradient(to right, #ff8d8d, #6fd1fa);
  z-index: -1;
}

.modal_body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

#title {
  font-size: 40px;
  margin: 20px;
}

.form_content {
    display: flex;
    width: 85%;
    justify-content: space-between;
    margin-top: 10px;

    label {
        font-family: var(--font-family);
        font-weight: 400;
        font-size: 36px;
        color: #fff;
    }

}

.left_side {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.left_side label {
  font-size: 15px;
}

.left_side input[type="text"],
.left_side input[type="email"] {
  background: transparent;
  border: 2px solid white;
  border-radius: 15px;
  padding: 8px;
  width: 260px;
  color: white;
}

.checkbox_label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox_label input[type="checkbox"] {
  width: 25px;
  height: 25px;
}

.right_side {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image_upload_label {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image_preview {
  width: 9vw;
  height: 15vh;
  background-color: grey;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.image_preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.change_text {
  margin-top: 8px;
  color: #fe6a57;
  font-size: 12px;
}

.button_block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10vh;
  align-items: center;
}

.button {
  padding: 10px 20px;
  border-radius: 20px;
  background: none;
  font-size: 20px;
  cursor: pointer;
  width: 250px;
  text-align: center;
}

.red {
    border: 2px solid #FFF;
    color: #fe6a57;
    transition: 1.2s;
}

.red:hover { 
    font-size: 23px;
    background-color: #603530;
}

.blue {
  color: #00ccff;
  border: 0px;
  transition: 1.2s;
}

.blue:hover { 
    font-size: 23px;
}

#exit {
  position: absolute;
  right: 35px;
  top: 35px;
  font-size: 40px;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
}
</style>