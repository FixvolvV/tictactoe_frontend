<template>

  <div class="body">

    <div v-if="windowState == 1" class="containerWaiting">
      <div class="userList">
        <h3>Lobby: {{lobbyName}}</h3>
        <div class="userContainer">
            <PlayerCard v-for="el in players"
              :key="el.id"
              :username="el.username"
              :wins="el.user.profile.wins"
              :symbol="el.symbol"
              :isReady="el.isReady" />
        </div>
      </div>
      <div class="buttons">
        <button id="Ready" class="btn">Ready</button>
        <button id="Leave" class="btn">Leave</button>
      </div>

    <div v-if="windowState == 2" class="containerGame"></div>




    </div>

  </div>

</template>


<script setup>
import { ref } from "vue";
import PlayerCard from "../components/PlayerCard.vue";

const lobbyName = ref();
const windowState = ref(1); // 1- Окно ожидания, 2- Игра

const players = ref();

</script>


<style scoped>
@import url(../css/game.css);


</style>