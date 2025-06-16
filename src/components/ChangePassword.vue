<template>
  <div class="modal">
    <div class="modal_container">
      <div class="modal_body">
        <h2 id="title">Change Password</h2>

        <input
          v-model="oldPassword"
          type="password"
          placeholder="Old password"
        />
        <input
          v-model="newPassword"
          type="password"
          placeholder="New password"
        />

        <div class="message error" v-if="errorMessage">{{ errorMessage }}</div>
        <div class="message success" v-if="successMessage">{{ successMessage }}</div>

        <button class="blue" @click="changePassword">Change password</button>
      </div>

      <button id="exit" @click="closeModal">&#10006;</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUiStore } from '../stores/ui'
import api from '../services/axios'

const uiStore = useUiStore()

const oldPassword = ref('')
const newPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const changePassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!oldPassword.value || !newPassword.value) {
    errorMessage.value = 'Both fields are required.'
    return
  }

  try {
    await api.post('/user/change_password', {
      old_password: oldPassword.value,
      new_password: newPassword.value
    })

    successMessage.value = 'Password changed successfully!'
    setTimeout(() => {
      uiStore.closeChangePasswordModal()
    }, 1000)
  } catch (err) {
    errorMessage.value =
      err.response?.data?.message || 'Failed to change password.'
    console.error(err)
  }
}

const closeModal = () => {
  uiStore.closeChangePasswordModal()
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
  width: 500px;
  height: 500px;
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
  background: linear-gradient(to right, #ff5e5e, #2ec0ff);
  z-index: -1;
}

.modal_body {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 25px;
}

#title {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

input {
  width: 280px;
  padding: 10px;
  border: 2px solid white;
  border-radius: 20px;
  background-color: transparent;
  color: white;
  font-size: 14px;
  text-align: center;
}

.blue {
  padding: 10px 25px;
  border-radius: 20px;
  background: none;
  border: 2px solid #00ccff;
  color: #00ccff;
  font-size: 14px;
  cursor: pointer;
}

#exit {
  position: absolute;
  right: 30px;
  top: 30px;
  font-size: 40px;
  color: white;
  border: none;
  background: none;
  cursor: pointer;
}

.message {
  font-size: 12px;
  margin-top: -10px;
  margin-bottom: 10px;
  text-align: center;
}

.error {
  color: red;
}

.success {
  color: #00ffcc;
}

</style>