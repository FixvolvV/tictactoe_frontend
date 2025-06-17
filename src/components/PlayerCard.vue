<!-- src/frontend/src/components/PlayerCard.vue -->
<template>

    <div class="user_data">

        <div class="container1">
          <div id="Username">{{username}}</div>
          <div id="Wins">Wins: {{wins}}</div>
        </div>

        <div class="container2">
          <div v-if="props.symbol == 'X'" id="Symbol">Symbol: <span style="color: #f00; font-size: 45px;">{{symbol}}</span></div>
          <div v-if="props.symbol == 'O'" id="Symbol">Symbol: <span style="color: #2ec0ff; font-size: 45px;">{{symbol}}</span></div>
        </div>

        <div class="container3">
          <div v-if="isReady" id="Ready" style="color: #57ff1a;">Ready</div>
          <div v-else id="Ready" style="color: #fb3b22;">Not Ready</div>
        </div>

    </div>

</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  username: {
    type: String,
    required: true
  },
  wins: {
    type: Number,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  isReady: {
    type: Boolean,
    required: true
  }
});

</script>

<style scoped>

.user_data{
  display: flex;
  flex-direction: row;
  background-color: rgba(52, 52, 52, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  width: 90%;
  height: 12vh;
  gap: 2vw;

  justify-content: center;

  overflow: hidden;
  overflow-y: scroll;
  -ms-overflow-style: none;  /* IE 10+ */
  scrollbar-width: none;


}

.container1{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-grow: 2;
    
}

.container2{
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
}

.container3{
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
}

#Username{
    font-family: var(--font-family);
    font-size: 40px;
    color: #2ec0ff;
}

#Wins{
    font-family: var(--font-family);
    font-size: 35px;
    color: #fff;
}

#Symbol{
  font-family: var(--font-family);
  font-weight: 400;
  font-size: 32px;
  color: #fff;
}

#Ready{
  font-family: var(--font-family);
  font-weight: 400;
  font-size: 32px;
  color: #fff;
}

</style>