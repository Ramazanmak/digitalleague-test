<script setup>
import { useTemplateRef, ref, reactive, computed, watch, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import MenuButton from './MenuButton.vue';
import HistoryControl from './HistoryControl.vue';
import { useStateHistory } from '../stores/stateHistory.js';

// Задание параметров состояния

const isChanging = ref(false);
const hasMoved = ref(false);
const modes = reactive([
  {
    id: 1,
    name: 'Кисть',
    role: 'draw',
    lineWidth: 1,
  }, 
  {
    id: 2,
    name: 'Ластик',
    role: 'erase',
    lineWidth: 32,
  }, 
]);
const activeRole = ref('draw');

const pointerImg = computed(() => {
  const baseUrl = import.meta.env.BASE_URL;
  let res;
  
  if (activeRole.value === 'draw') {
    res = `url("${baseUrl}/brush.svg") 0 31, pointer`;
  }else if (activeRole.value === 'erase') {
    res = `url("${baseUrl}/eraser.svg") 15 15, pointer`;
  }

  return res;
});


const canvas = useTemplateRef('canvas');
const areToolsOpen = ref(false);
let ctx = null;
const currentSnapshot = shallowRef(null);
const history = useStateHistory();


// Функции и сайд-эффекты

onMounted(() => {
  initiateCanvas();
  window.addEventListener('resize', initiateCanvas);
  window.addEventListener('keydown', goBack);
  currentSnapshot.value = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
  history.addState(currentSnapshot.value);

});

onBeforeUnmount(() => {
  window.removeEventListener('resize', initiateCanvas);
  window.removeEventListener('keydown', goBack);
});

watch(() => history.navigationRequest, async () => {
  const targetImage = history.currentState;
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  await fillCanvasWithImage(targetImage, canvas.value.width, canvas
  .value.height);
  currentSnapshot.value = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
});

function getPointerCoordinates(event) {
  const element = canvas.value;
  const bounds = element.getBoundingClientRect();

  return {
    x:
      (event.clientX - bounds.left - element.clientLeft) *
      (element.width / element.clientWidth),

    y:
      (event.clientY - bounds.top - element.clientTop) *
      (element.height / element.clientHeight),
  };
}

function startDrawing(event) {
  const { x, y } = getPointerCoordinates(event);

  isChanging.value = true;

  
  if (activeRole.value === 'draw') {
    ctx.globalCompositeOperation = 'source-over';
  } else if (activeRole.value === 'erase') {
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
  hasMoved.value = true;

  const { x, y } = getPointerCoordinates(event);

  ctx.lineTo(x, y);
  ctx.stroke();
}

function stopDrawing(event) {

  if (isChanging.value){
    currentSnapshot.value = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
    history.addState(currentSnapshot.value);
  
    if (!hasMoved.value) {
    const { x, y } = getPointerCoordinates(event);
      ctx.arc(x, y, ctx.lineWidth / 2, 0, 2*Math.PI);
      ctx.fill();
    }
  
    isChanging.value = false;
    hasMoved.value = false;
  }
  
  if (canvas.value.hasPointerCapture(event.pointerId)) {
    canvas.value.releasePointerCapture(event.pointerId);
  }

  
}

function changeActive(role) {
  activeRole.value = role;
}

async function initiateCanvas(){
  const newWidth = Math.round(canvas.value.clientWidth);
  const newHeight = Math.round(canvas.value.clientHeight);

  const sizeChanged = newWidth !== canvas.value.width || newHeight !== canvas.value.height;

  if (sizeChanged) {
    canvas.value.width = newWidth;
    canvas.value.height = newHeight;
  
    ctx = canvas.value.getContext('2d');
    ctx.lineWidth = modes.find((el) => el.role === activeRole.value).lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (currentSnapshot.value) {
      await fillCanvasWithImage(currentSnapshot.value, canvas.value.width, canvas.value.height);
    }
  }
  
}

async function fillCanvasWithImage(currentImage, rectWidth, rectHeight) {
  const bitmap = await createImageBitmap(currentImage);
  const currentOperation = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'source-over';

  const scale = Math.min(
    rectWidth / bitmap.width,
    rectHeight / bitmap.height,
  );

  const drawWidth = bitmap.width * scale;
  const drawHeight = bitmap.height * scale;
  const offsetX = (rectWidth - drawWidth) / 2;
  const offsetY = (rectHeight - drawHeight) / 2;
      
  ctx.drawImage(bitmap, offsetX, offsetY, drawWidth, drawHeight);
  bitmap.close();
  
  ctx.globalCompositeOperation = currentOperation;
}

function clear() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  currentSnapshot.value = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
  history.addState(currentSnapshot.value);
}

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'canvas-snapshot.png';
  link.href = canvas.value.toDataURL('image/png');
  link.click();
}

async function uploadImage(event) {
  const file = event.target.files?.[0];
  
  if (file) {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    await fillCanvasWithImage(file, canvas.value.width, canvas.value.height);
    currentSnapshot.value = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
    history.addState(currentSnapshot.value);
  }
}

async function goBack(event) {
  if ((event.ctrlKey || event.metaKey)&& event.shiftKey && event.code === 'KeyZ') {
    event.preventDefault();
    history.goForward();
  } else if((event.ctrlKey || event.metaKey) && event.code === 'KeyZ') {
    event.preventDefault();
    history.goBack();
  }
}

function toggleTools() {
  areToolsOpen.value = !areToolsOpen.value;
}

</script>

<template>
  <div class="wrapper">
    <canvas 
      id="simple-canvas"
      class="canvas"
      :style="{cursor: pointerImg}"
      ref="canvas" 
      @pointermove="draw"
      @pointerdown="startDrawing"
      @pointerup="stopDrawing"
      @pointercancel="stopDrawing">
    </canvas>

    <div class="bottom-menu">
      <button @click="toggleTools" class="menu-button"> {{ areToolsOpen ? "Открыть" : "Закрыть"}} меню </button>
      <HistoryControl></HistoryControl>
    </div>

    <aside class="canvas-tools" :class="{'canvas-tools__hidden': areToolsOpen}">
      <menu class="canvas-menu">
        <li class="canvas-menu__button" v-for="mode in modes" :key="mode.id">
          <MenuButton 
            :name="mode.name" 
            :active="activeRole === mode.role"
            @click="changeActive(mode.role)"></MenuButton>
        </li>
        <li class="canvas-menu__button">
          <MenuButton 
            name="Стереть всё" 
            @click="clear"></MenuButton>
        </li>
      </menu>

      <menu class="canvas-menu">
        <li class="canvas-menu__button">
          <MenuButton 
            name="Скачать фото" 
            @click="downloadImage"></MenuButton>
        </li>
        <li class="canvas-menu__button">
          <label class="menu-button">
            <span class="menu-button__caption"> Загрузить фото </span>
            <input @change="uploadImage" id="upload" type="file" accept="image/*" hidden>
          </label>
        </li>
      </menu>
    </aside>
  </div>

</template>

<style scoped>

.wrapper {
  width: 100%;
  height: 100dvh;
  padding: 5px 5px 15px;
  margin: auto;
  border: 2px solid rgb(56, 55, 55);
  background-color: var(--main-first);
  position: relative;
}
.canvas {
  display: block;
  background-color: white;
  border: 2px solid black;
  width: 100%;
  height: 95%;
  transition-duration: var(--main-duration);
  touch-action: none;
}

.bottom-menu {
  padding: 5px 0;
  display:flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.canvas-tools{
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 10px;
  background-color: var(--main-first);
  padding:1em;
  width: 82%;
  max-width: 290px;
  border-radius: 1em;
  position: absolute;
  bottom: 10%;
  left: calc((100% - 290px) / 2);
  opacity: 1;
  visibility: visible;
  transition-duration: var(--main-duration);
}

.canvas-tools__hidden {
  opacity: 0;
  visibility: hidden;
}

.canvas-menu {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5em; 
  padding: 0;
  list-style-type: none;
}

.canvas:hover {
  border-color: var(--accent-first);
}


@media (min-width: 768px) {
  .canvas-tools {
    flex-direction: row;
    max-width: none;
    left: 9%;
  }
}
</style>