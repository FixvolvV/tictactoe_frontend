<script setup>
import { defineProps } from 'vue';

// Определяем props
defineProps({
  id: {
    type: String,
    required: true
  },
  place: {
    type: Number,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  wins: {
    type: Number,
    required: true
  },
  loses: {
    type: Number,
    required: true
  }
});
</script>


<template>

    <div class="leaders_container">
        <div class="container1">
            <img v-if="place in [1, 2, 3, 4]" src="../assets/corona.png">
    
            <div v-if="place in [1, 2, 3, 4]" class="golden place">{{place}}</div>
            <div v-else class="place">{{place}}</div>
        </div>

        <div class="container2">
            <div v-if="place in [1, 2, 3, 4]" class="golden username"> {{username}} </div>
            <div v-else class="username">{{username}}</div>
        </div>
        
        <div class="container3">
            <div class="wins">Wins: {{wins}}</div>
            <div class="loses">Loses: {{loses}}</div>
        </div>
    </div>

</template>

<style scoped>

.leaders_container{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    background: #7f7f7f;
    border-radius: 25px;
    margin: 15px;
    padding: 15px;
    width: 90%;
    height: 115px;
}

.container1{
    flex: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.container2{
    flex: 6;
    display: flex;
    flex-direction: column;
}

.container3{
    flex: 3;
    display: flex;
    flex-direction: column;
}

img{
    width: 40px;
    height: 40px;
    left: 23px;
}

.place{
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 50px;
    letter-spacing: -0.05em;
    color: #fff;
    margin: 10px;
}

.username{
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 45px;
    letter-spacing: -0.05em;
    color: #fff;
}

.golden{
    color: #ffd52b;
}

.wins{
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 40px;
    letter-spacing: -0.05em;
    color: #fff;
}

.loses{
    position: relative;
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 40px;
    letter-spacing: -0.05em;
    color: #fff;
}

</style>