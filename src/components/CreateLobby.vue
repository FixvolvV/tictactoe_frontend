<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.js'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/axios.js'

// Пропсы для управления окнами
const props = defineProps({
  closedmodal: {
    type: Function,
    required: true
  }
});

const authStore = useAuthStore();
const router = useRouter()
const route = useRoute()

// Реактивные переменные
const isOpen = ref(true);
const name = ref('');
const _error = ref('')
// Логика переключения на окно регистрации

// Отправка формы
const handleCreateLobby = async () => {
  try {
    _error.value = ''
    const response = await api.post(`/lobby/create`, null, {
        params: {
            lobbyname: `${name.value}`
        }
    });

    console.log(response)

    router.push(`/game/${response.data}`)

    props.closedmodal();
  } catch (error) {
    console.error(error)
    _error.value = error
  }
};
</script>


<template>
    <div class="modal">
        <div class="modal_container">
            <div class="modal_body">

                <h3 class="title">Create Lobby</h3>
                <div class="data_input">
                    <div class="input_text"> Name: </div> <input id="name" placeholder="Enter name lobby" v-model="name">
                </div>

                <button id="confirm" @click="handleCreateLobby"> Create </button>

                <div class="error">{{ _error }}</div>

            </div>
            <button id="exit" @click="closedmodal">&#10006;</button>
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
    padding: 0;
    top: 35px;
    right: 35px;
}


.title {
    font-family: var(--font-family);
    text-align: center;
    font-size: 45px;
    margin: 35px 0;
    padding: 0px;
    width: 100%;
    background-image: linear-gradient(to right, #FF5E5E, #2EC0FF);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}


.data_input{
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    margin-top: 40px;
}

.input_text {
    font-family: var(--font-family);
    font-size: 40px;
    color: #2ec0ff;
    width: 30%;
}

#name{
    font-family: var(--font-family);
    font-size: 25px;
    width: 40%;
    height: 25px;
    text-align:center;
    border: 3px solid #fff;
    border-radius: 20px;
    background: none;
    color: #fff;

    
}
#name::placeholder{
        color: #fff;
    opacity: 0.65;
    }

#confirm{
    font-family: var(--font-family);
    font-size: 25px;
    text-align:center;
    width: 200px;
    height: 40px;
    border: 3px solid #fff;
    border-radius: 20px;
    background: none;
    margin-top: 50px;
    color: #FF5E5E;
    cursor: pointer;
}

.error{
    font-family: var(--font-family);
    font-size: 15px;
    color: #ff5e5e;
}

</style>