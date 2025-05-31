<script setup>
import { ref, defineProps, onMounted } from 'vue';
import api from '../services/axios.js'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Определяем props
const props = defineProps({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  gamemode: {
    type: String,
    required: true
  },
  reference: {
    type: Function,
    required: true
  }
});

const _owner = ref(null);

const clickHandler = async() => {
  props.reference(`/game/${props.id}`)
}

onMounted( async () => {
  const response = await api.get(`/get/profile/${props.owner}`)
  _owner.value = response.data.user_data.username

});


</script>


<template>

    <div class="lobby_container" @click="clickHandler">
        <div class="namelobby">{{name}}</div>
        <div class="ownerlobby">Owner: {{owner}}</div>
        <div class="gamemode">Mode: {{gamemode}}</div>
    </div>

</template>

<style scoped>

.lobby_container{
    background: rgba(52,52,52, .5);
    border-radius: 25px;
    margin: 0px 35px 20px 35px;
    width: 90%;
    height: 115px;
}

.namelobby{
    position: relative;
    font-family: var(--font-family);
    font-size: 40px;
    color: #2ec0ff;
    top: 15px;
    left: 20px;
}

.ownerlobby{
    position: static;
    font-family: var(--font-family);
    font-size: 35px;
    margin-right: 55px;
    color: #fff;
    text-align: right;
}

.gamemode{
    position: relative;
    font-family: var(--font-family);
    margin-left: 20px;
    font-size: 25px;
    color: #fff;
    bottom: 10px;
}

</style>