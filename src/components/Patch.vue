<script setup>
import { defineProps } from 'vue';

// Определяем props
defineProps({
  idpatch: {
    type: Number,
    required: true
  },
  numberpatch: {
    type: String,
    required: true
  }
});

</script>

<template>

    <div class="patch_container">
        <div class="patch_number">Patch v{{ numberpatch }}</div>
        <div class="click">Click to info</div>
    </div>


</template>

<style scoped>

.patch_container{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(46,192,255, .65);
    border-radius: 15px 0px 15px 15px;
    margin: 15px;
    padding: 5px;
    width: 80%;
    height: 115px;
    transition: 1.2s;
    cursor: pointer;
}
.patch_container:hover{
  background: rgba(46,192,255, .85);
  transform: scale(1.05);
}

.patch_number{
    font-family: var(--font-family);
    font-size: 30px;
    text-align:center;
    color: #ffff;
    margin: 5px;
}

.click{
    font-family: var(--font-family);
    font-weight: 600;
    font-size: 25px;
    color: #ff5e5e;
    margin: 5px;
}

</style>