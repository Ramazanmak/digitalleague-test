<script setup>
import {useTemplateRef, ref, reactive, computed, onMounted} from 'vue'
import MenuButton from './MenuButton.vue';

const isChanging = ref(false);
const modes = reactive([
  {
    id: 1,
    name: "Кисть",
    role: "draw",
    lineWidth: 2,
  }, 
  {
    id: 2,
    name: "Ластик",
    role: "erase",
    lineWidth: 40,
  }, 
]);
const activeRole = ref('draw');

const pointerImg = computed(() => {
  let res;
  
  if (activeRole.value === "draw") {
    res = "url(/brush.svg) 0 32, pointer"
  }else if (activeRole.value === "erase") {
    res = "url(/eraser.svg) 16 16, pointer";
  }

  return res;
})



const canvas = useTemplateRef("canvas");
let ctx = null;

onMounted(() => {
  ctx = canvas.value.getContext("2d");

  ctx.lineWidth = modes.find((el) => el.role === activeRole.value).lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
})

function getPointerCoordinates(event) {
  const rect = canvas.value.getBoundingClientRect();

  return {
    x: (event.clientX - rect.left) / rect.width *  canvas.value.width,
    y: (event.clientY - rect.top) / rect.height *  canvas.value.height,
  } 
}

function startDrawing(event) {
  const {x, y} = getPointerCoordinates(event);

  isChanging.value = true;

  
  if (activeRole.value == "draw") {
    ctx.globalCompositeOperation = 'source-over'
  } else if (activeRole.value == "erase") {
    ctx.globalCompositeOperation = 'destination-out';
  }
  
  ctx.lineWidth = modes.find((el) => el.role === activeRole.value).lineWidth;
  ctx.beginPath();
  ctx.moveTo(x, y);

  canvas.value.setPointerCapture(event.pointerId);
}

function draw(event) {
  if (!isChanging.value) {
    return;
  }

  const {x, y} = getPointerCoordinates(event);

  ctx.lineTo(x, y);
  ctx.stroke();
}

function stopDrawing(event) {
  if (isChanging.value){
    isChanging.value = false;
  }

  if (canvas.value.hasPointerCapture(event.pointerId)) {
    canvas.value.releasePointerCapture(event.pointerId);
  }
}

function changeActive(role) {
  activeRole.value = role;
}
</script>

<template>
  <div class="wrapper">
    <canvas 
      id="simple-canvas"
      class="canvas"
      :style="{cursor: pointerImg}"
      ref="canvas" 
      width="800" 
      height="600"
      @pointermove="draw"
      @pointerdown="startDrawing"
      @pointerup="stopDrawing"
      @pointercancel="stopDrawing">
    </canvas>

    <menu class="canvas-menu">
      <li class="canvas-menu_button" v-for="mode in modes" :key="mode.id">
        <MenuButton 
          :name="mode.name" 
          :active="activeRole == mode.role"
          @click="changeActive(mode.role)"></MenuButton>
      </li>
    </menu>
  </div>

</template>

<style scoped>

.wrapper {
  width: 800px;
  max-width: 90%;
  padding: 1em;
  margin: auto;
  margin-top: 2em;
  border: 2px solid rgb(56, 55, 55);
  background-color: var(--main-first);
  border-radius: 15px;
}
.canvas {
  display: block;
  background-color: white;
  border: 2px solid black;
  max-width: 100%;
  transition-duration: var(--main-duration);
  touch-action: none;
  cursor: url(/eraser.svg) 0 32, pointer;
}

.canvas-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1em; 
  padding:10px 0 0;
  list-style-type: none;
}

.canvas:hover {
  border-color: var(--accent-first);
}

</style>