<script setup>
import { ref, defineProps, onMounted } from 'vue';
import api from '../services/axios.js'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '../stores/ui.js';


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
  }
});


const clickHandler = async() => {
  router.push(`/game/${props.id}`)
}

onMounted( async () => {

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