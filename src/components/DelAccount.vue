<template>
  <div class="modal">
    <div class="modal_container">
      <div class="modal_body">
        <h2 id="title">You're a sure?</h2>

        <div class="input_block">
          <label>You’re password:</label>
          <input v-model="password" type="password" />

          <label>Confirmation:</label>
          <input v-model="confirmation" type="text" />
        </div>

        <p class="warning">
          In this field, enter <b>“CONFIRM”</b> to confirm that your account will be deleted.
        </p>

        <button class="delete_button" @click="deleteAccount">
          Delete Account
        </button>
      </div>

      <button id="exit" @click="uiStore.closeDeleteConfirmModal">&#10006;</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import api from '../services/axios'

const password = ref('')
const confirmation = ref('')

const authStore = useAuthStore()
const uiStore = useUiStore()

const deleteAccount = async () => {
  if (confirmation.value !== 'CONFIRM') {
    console.warn('Confirmation phrase incorrect')
    return
  }

  try {
    await api.delete(`/user`, {
      params: {
        password: password.value
      }
    })

    // Удаляем токены, localStorage, закрываем модалки, редиректим
    await authStore.logout()
    console.log('Аккаунт удалён — пользователь разлогинен')
  } catch (err) {
    console.error('Ошибка удаления аккаунта:', err)
    // тут можно добавить отображение ошибки пользователю
  }
}
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
  width: 700px;
  height: 510px;
  border-radius: 30px;
  background-color: black;
}

/* Градиентная рамка */
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
  align-items: center;
  justify-content: center;
  height: 100%;
}

#title {
  font-size: 30px;
  margin-bottom: 30px;
}

.input_block {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 80%;
}

.input_block label {
  font-size: 16px;
}

.input_block input {
  background: transparent;
  border: 2px solid white;
  border-radius: 15px;
  padding: 8px 10px;
  font-size: 14px;
  color: white;
}

.warning {
  color: #FFC800;
  margin-top: 25px;
  margin-bottom: 30px;
  font-size: 12px;
  text-align: center;
  width: 85%;
}

.delete_button {
  background: none;
  border: 2px solid red;
  color: red;
  border-radius: 20px;
  padding: 10px 30px;
  font-size: 14px;
  cursor: pointer;
}

#exit {
  position: absolute;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 45px;
  color: #fff;
  top: 30px;
  right: 30px;
}
</style>