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
            <img v-if="place in [1, 2, 3, 4]" src="../assets/crown.png">
    
            <div v-if="place in [1, 2, 3, 4]" class="golden place">{{place}}</div>
            <div v-else class="place">{{place}}</div>
        </div>

        <div class="container2">
            <div v-if="place in [1, 2, 3, 4]" class="golden username"> {{username}} </div>
            <div v-else class="username">{{username}}</div>
        </div>
        
        <div class="container3">
            <div class="stat"><span style="color:#2ec0ff">Victory:</span> {{wins}}</div>
            <div class="stat"><span style="color:#ff5e5e">Defeat:</span> {{loses}}</div>
        </div>
    </div>

</template>

<style scoped>

.leaders_container{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    background: rgba(52,52,52, .5);
    border-radius: 25px;
    margin: 15px;
    padding: 15px;
    width: 90%;
    height: 115px;
}

.container1{
    flex: 2;
    display: flex;
    flex-direction: row;
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
    font-size: 50px;
    color: #fff;
    margin: 10px;
}

.username{
    font-family: var(--font-family);
    font-size: 45px;
    color: #fff;
}


.stat{
    font-family: var(--font-family);
    font-size: 40px;
    color: #fff;
}

</style>