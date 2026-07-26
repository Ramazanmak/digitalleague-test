<script setup>
const props = defineProps({
  name:{
    type: String,
    default: 'Кнопка',
  },
  active: {
    type: Boolean,
    default: false,
  },
});

</script>

<template>
  <button type="button" class="menu-button" :class="{'menu-button_active': active}">
    {{ props.name }}
  </button>
</template>

<style scoped>
:global(.menu-button) {
  display: block;
  font-size: 12px;
  font-weight: 600;
  padding:0.3em 1em;
  text-transform: uppercase;
  background-color: var(--accent-first);
  color: var(--main-second);
  border: 1px solid  var(--main-second);
  border-radius: 5px;
  outline: none;
  transition-duration: var(--main-duration);
}

.menu-button_active, :global(.menu-button:active) {
  background-color: var(--main-second);
  border-color: var(--accent-first);
  color: var(--accent-first);
  box-shadow: 0 0 10px 1px var(--accent-first);
}

@media (min-width: 768px) {
  :global(.menu-button){
    font-size: 14px;
  }
}
</style>