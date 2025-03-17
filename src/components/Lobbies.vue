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
        <div class="ownerlobby">Owner: {{_owner}}</div>
        <div class="gamemode">Mode: {{gamemode}}</div>
    </div>

</template>

<style scoped>

.lobby_container{
    background: #7f7f7f;
    border-radius: 25px;
    margin: 15px;
    padding: 15px;
    width: 90%;
    height: 115px;
}

.namelobby{
    position: relative;
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 40px;
    letter-spacing: -0.05em;
    color: #CAFF8A;
    top: 15px;
}

.ownerlobby{
    position: static;
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 35px;
    letter-spacing: -0.05em;
    color: #fff;
    text-align: right;
}

.gamemode{
    position: relative;
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 25px;
    letter-spacing: -0.05em;
    color: #fff;
    bottom: 10px;
}

</style>