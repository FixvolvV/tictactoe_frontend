<script setup>
import { ref } from 'vue';
import { useUserStore } from '../stores/auth.js'

// Пропсы для управления окнами
const props = defineProps({
  closedmodal: {
    type: Function,
    required: true
  },
  openedlogin: {
    type: Function,
    required: true,
  }
});

const authStore = useUserStore();

// Реактивные переменные
const isOpen = ref(true);
const username = ref('');
const password = ref('');
const _error = ref('')

// Логика переключения на окно входа
const switchToLogin = () => {
  props.closedmodal();  // Закрываем текущее окно
  props.openedlogin(); // Открываем окно входа
};

// Отправка формы
const handleRegister = async () => {
  try {
    _error.value = ''

    await authStore.register({ username: username.value, password: password.value });
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

                <h3 class="title">Registration</h3>

                <div class="data_input">

                    <div class="input_text"> Nickname:</div>
                    <input id="name" v-model="username">
                </div>

                <div class=data_input>

                    <div class="input_text"> Password: </div>
                    <input type="password" id="password" v-model="password">

                </div>

                <button id="confirm" @click="handleRegister"> Register </button>

                
                <div class="ps">Registered already? <button id="reftologin" class="ps" @click="switchToLogin"> Click to enter </button></div>
                
            </div>
            <div class="error">{{_error}}</div>
            <button id="exit" @click="closedmodal">&#10006;</button>
        </div>
    </div>
</template>

<style scoped>
* {
    font-family: var(--font-family);
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

.title {
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
    font-size: 45px;
    color: #2ec0ff;
    width: 30%;
}

#name{
    text-align: center;
    font-size: 30px;
    border: 3px solid #fff;
    border-radius: 20px;
    width: 350px;
    height: 40px;
    background: none;
    color: #fff;
}

#password{
    font-size: 30px;
    text-align: center;
    border: 3px solid #fff;
    border-radius: 20px;
    width: 350px;
    height: 40px;
    background: none;
    color: #fff;
}

#confirm{
    border: 3px solid #fff;
    border-radius: 20px;
    width: 200px;
    height: 40px;
    background: none;
    margin: 20px 160px 0px 340px;

    font-size: 25px;
    text-align: center;
    color: #FF5E5E;

    cursor: pointer;
}

.ps{
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
    font-size: 20px;
    text-align: center;
    margin-top: 20px;
    color: #ff5e5e;
    
}

</style>