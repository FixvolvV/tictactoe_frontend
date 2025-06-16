<script setup>
import { ref } from 'vue'; // ref оставляем
// defineEmits не требует импорта в <script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { useUiStore } from '../stores/ui.js';

const emit = defineEmits(['close']); // Объявляем событие 'close'
const authStore = useAuthStore();
const uiStore = useUiStore();
const router = useRouter();

const username = ref('')
const password = ref('');

const _error = ref("")

const handleLogin = async () => {
    try {
        _error.value = ""
        const success = await authStore.login({ username: username.value, password: password.value });
        if (success) {
            emit('close'); // Закрываем модальное окно
            const redirectPath = uiStore.redirectPathAfterLogin || '/';
            uiStore.redirectPathAfterLogin = null; // Очищаем путь
            router.push(redirectPath);
        }
    } catch(error) {
        _error.value = error
    }
};

const openRegisterFromLogin = () => {
  uiStore.openRegisterModal(); 
  emit('close'); 
};
</script>


<template>

    <div class="modal">

        <div class="modal_container">

            <div class="modal_body">

                <h3 class="title">Login</h3>

                <div class="data_input">
                    
                    <input id="name" v-model="username" placeholder="Nickname">
                    <input type="password" id="password" v-model="password" placeholder="Password">
                </div>

                <button id="confirm" @click="handleLogin"> Login </button>

                
                <div class="ps">Not registered yet? <button id="reftologin" class="ps" @click="uiStore.openRegisterModal"> Click to register </button>
                </div>
                
                <div class="error">{{ _error }}</div>
            </div>
            <button id="exit" @click="uiStore.closeAllModals">&#10006;</button>
        </div>

    </div>

</template>

<style scoped>

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

#exit{
    position: absolute;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-size: 45px;
    color: #fff;
    top: 15px;
    right: 20px;
}

.title {
    font-family: var(--font-family);
    text-align: center;
    font-size: 60px;
    margin: 0px;
    margin-top: 25px;
    background-image: linear-gradient(to right, #FF5E5E, #2EC0FF);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    
}

.data_input{
    padding-top: 45px;
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;

}

.input_text {
    font-family: var(--font-family);
    font-size: 45px;
    color: #2ec0ff;
    width: 30%;
}

#name {
    font-family: var(--font-family);
    text-align: center;
    font-size: 30px;
    border: 3px solid #fff;
    border-radius: 20px;
    width: 350px;
    height: 40px;
    background: none;
    color: #fff;
}

#name::placeholder {
    color: rgba(46, 192, 255, 0.5);
    opacity: 1; /* Убедиться, что браузер не снижает яркость */
}

#password {
    font-family: var(--font-family);
    font-size: 30px;
    text-align: center;
    border: 3px solid #fff;
    border-radius: 20px;
    width: 350px;
    height: 40px;
    background: none;
    color: #fff;
    margin-top: 45px;
}

#password::placeholder {
    color: rgba(46, 192, 255, 0.5);
    opacity: 1; /* Убедиться, что браузер не снижает яркость */
}

#confirm{
    border: 3px solid #fff;
    border-radius: 20px;
    width: 200px;
    height: 40px;
    background: none;
    text-align:center;
    margin-top: 20px;

    font-family: var(--font-family);
    font-size: 25px;
    text-align: center;
    color: #FF5E5E;

    cursor: pointer;
}

.ps{
    font-family: var(--font-family);
    font-size: 25px;
    margin-top: 20px;
    text-align:center;
    color: #fff;
}

#reftologin{
    background-color: transparent;
    border: none;
    color: #ff5e5e;
    cursor: pointer;
    margin: 0;
}

.error{
    font-family: var(--font-family);
    font-size: 20px;
    text-align: center;
    margin-top: 20px;
    color: #ff5e5e;
    
}

</style>