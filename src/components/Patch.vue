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
    background: #282828;
    border-radius: 15px;
    margin: 15px;
    padding: 5px;
    width: 80%;
    height: 115px;
}

.patch_number{
    font-family: var(--font-family);
    font-weight: 200;
    font-style: italic;
    font-size: 25px;
    letter-spacing: -0.03em;
    color: #fff;
    margin: 5px;
}

.click{
    font-family: var(--font-family);
    font-weight: 600;
    font-size: 20px;
    color: #2ec0ff;
    margin: 5px;
}

</style>