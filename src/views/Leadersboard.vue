<script setup>
import { ref, onMounted } from 'vue';
import Leaders from '../components/Leaders.vue';
import { useUserStore } from '../stores/auth.js'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/axios.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const leaders = ref([]);


const getLeaders = async () => {
    leaders.value = await api.get("/get/leaderslist")
    leaders.value = leaders._rawValue.data
}


onMounted(async () => {
    await userStore.getSelf()
    await getLeaders()
})

</script>

<template>

    <div class="body">

    <div class="group1">
        <button id="Back" class="back element" @click="router.push('/')">
            <div class="chevron"></div><div class="stroke"></div>
        </button>
    </div>

    <div class="group2">
        <div id="Search" class="search element">
            <h3>Search</h3>
            <input id="Binput"> <button id="Bsearch"><img src="../assets/search_logo.png"></button>
        </div>
        <div id="Info" class="info element">
            <h3>You’re Info</h3>
            <div>Nickname: {{userStore.username}}</div>
            <div>Your place: {{userStore.leaders_place}}</div>
            <div>Wins: {{userStore.wins}}</div>
            <div>Loses: {{userStore.loses}}</div>
        </div>
        <div id="Listleaders" class="listleaders element">
            <h3>Leadersboard</h3>
            <Leaders v-for="(el, index) in leaders" :id="el.id" :place="index+1" :username="el.username" :wins="el.games['wins']" :loses="el.games['loses']" />
        </div>
    </div>

    </div>

</template>


<style scoped>

@import url(../css/leadersboard.css);

.chevron {
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid rgb(255, 255, 255); 
}

.stroke {
    height: 0px;
    width: 50px;
    border-top: 3px solid #ffffff;
    margin: 0%;
}

.listleaders{
  overflow: hidden;
  overflow-y: scroll;
  -ms-overflow-style: none;  /* IE 10+ */
  scrollbar-width: none;
}

</style>