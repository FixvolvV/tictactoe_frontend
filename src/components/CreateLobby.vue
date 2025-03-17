<script setup>
import { ref } from 'vue';
import { useUserStore } from '../stores/auth.js'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/axios.js'

// Пропсы для управления окнами
const props = defineProps({
  closedmodal: {
    type: Function,
    required: true
  }
});

const authStore = useUserStore();
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
    const response = await api.post(`/game/createlobby`, null, {
        params: {
            lobby_name: `${name.value}`
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
                    <div class="input_text"> Lobby Name: </div> <input id="name" v-model="name">
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
    padding: 15px;
}

.modal_container{
    position: relative;
    margin: auto;
    width: 700px;
    height: 510px;
    border-radius: 35px;
    border: 3px dashed #fff;
    background: #272727;
    padding: 10px 20px;
}

.modal_body{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 25px 0px;
}

#exit{
    position: absolute;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-size: 30px;
    color: #fff;
    padding: 0;
    top: 5px;
    right: 15px;
}

.title {
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 35px;
    color: #fff;
    text-align: center;
    margin: 0;
    margin-bottom: 75px;
    padding: 0px;
    width: 100%;
}

.data_input{
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
}

.input_text {
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 30px;
    color: #fff;
    width: 30%;
}

#name{
    font-family: var(--font-family);
    border: 3px solid #fff;
    width: 40%;
    height: 25px;
    background: #272727;
    color: #fff;
}

#confirm{
    border: 3px solid #fff;
    width: 200px;
    height: 40px;
    background: #272727;

    font-family: var(--font-family);
    font-weight: 400;
    font-size: 20px;
    letter-spacing: -0.03em;
    color: #fff;

    cursor: pointer;
}

.error{
    font-family: var(--second-family);
    font-weight: 400;
    font-size: 15px;
    letter-spacing: -0.03em;
    color: #ff5e5e;
}

</style>