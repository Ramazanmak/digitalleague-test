<script setup>
import MenuButton from './MenuButton.vue';
import { useStateHistory } from '@/stores/stateHistory.js';

const history = useStateHistory();

</script>

<template>

  <menu class="history-menu">
    <MenuButton name="Назад" @click="history.goBack()"></MenuButton>
    <MenuButton name="Вперёд" @click="history.goForward()"></MenuButton>
  </menu>

</template>

<style scoped>
.history-menu {
  display: flex;
  gap: 10px;
}
</style>