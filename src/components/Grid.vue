<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';

const props = defineProps({
  gameBoard: Object, // Игровое поле (словарь координат)
  sendMove: Function, // Функция отправки хода
});

// Переменные для управления полем
const gameContainer = ref(null)
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const scrollLeft = ref(0);
const scrollTop = ref(0);
const scale = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);

// Начальный размер сетки, если поле пустое
const DEFAULT_GRID_SIZE = 15;

// Вычисляем границы заполненного игрового поля
const gridBounds = computed(() => {
  if (Object.keys(props.gameBoard).length === 0) {
    return {
      minX: -Math.floor(DEFAULT_GRID_SIZE / 2),
      maxX: Math.floor(DEFAULT_GRID_SIZE / 2),
      minY: -Math.floor(DEFAULT_GRID_SIZE / 2),
      maxY: Math.floor(DEFAULT_GRID_SIZE / 2),
    };
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const key of Object.keys(props.gameBoard)) {
    const [x, y] = key.split(',').map(Number);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return {
    minX: minX - 5,
    maxX: maxX + 5,
    minY: minY - 5,
    maxY: maxY + 5,
  };
});

// Динамическое игровое поле
const dynamicGrid = computed(() => { 
  const { minX, maxX, minY, maxY } = gridBounds.value;
  const cells = [];
  for (let row = minY; row <= maxY; row++) {
    const rowCells = [];
    for (let col = minX; col <= maxX; col++) {
      const key = `${col},${row}`;
      rowCells.push({
        x: col,
        y: row,
        symbol: props.gameBoard[key] || null,
      });
    }
    cells.push(rowCells);
  }
  return cells;
});

// Обработчик клика (передает ход в Game.vue)
const handleClick = async (rowIndex, colIndex) => {
    await props.sendMove(colIndex, rowIndex);
};

// Центрирование сетки при загрузке
const centerGameField = async () => {
  await nextTick();
  if (gameContainer.value) {
    offsetX.value = 0;
    offsetY.value = 0;
  }
};

// Масштабирование с учетом курсора
const handleZoom = async (event) => {
  event.preventDefault();

  const container = gameContainer.value;
  if (!container) return;

  // Новое значение масштаба
  let newScale = scale.value + (event.deltaY < 0 ? 0.1 : -0.1);
  newScale = Math.min(Math.max(newScale, 0.5), 2);

  // Координаты курсора относительно контейнера
  const rect = container.getBoundingClientRect();
  const cursorX = event.clientX - rect.left;
  const cursorY = event.clientY - rect.top;

  // Корректируем смещение
  offsetX.value = (offsetX.value + cursorX) * (newScale / scale.value) - cursorX;
  offsetY.value = (offsetY.value + cursorY) * (newScale / scale.value) - cursorY;

  // Применяем изменения
  scale.value = newScale;
};

// Перетаскивание поля
const startDragging = async (event) => {
  isDragging.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  document.addEventListener("mousemove", onDragging);
  document.addEventListener("mouseup", stopDragging);
};

const onDragging = async (event) => {
  if (!isDragging.value) return;
  offsetX.value += event.clientX - startX.value;
  offsetY.value += event.clientY - startY.value;
  startX.value = event.clientX;
  startY.value = event.clientY;
};

const stopDragging = async () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDragging);
  document.removeEventListener("mouseup", stopDragging);
};

onMounted(async () => {
  await centerGameField();
  gameContainer.value.addEventListener("wheel", handleZoom, { passive: false });
});
</script>

<template>

    <div class="game-container" ref="gameContainer" @mousedown="startDragging">
        <div class="game-field"
        ref="gameField"
        :style="{
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
            transformOrigin: 'center center'
        }">
        <div v-for="(row, rowIndex) in dynamicGrid" :key="rowIndex" class="row">
            <div v-for="(cell, colIndex) in row" :key="colIndex"
            class="cell" @click="handleClick(cell.y, cell.x)">
            <span v-if="cell.symbol">
                <span v-if="cell.symbol === 'X'" style="color: #ff5e5e">{{ cell.symbol }}</span>
                <span v-if="cell.symbol === 'O'" style="color: #2ec0ff">{{ cell.symbol }}</span>
            </span>
            </div>
        </div>
        </div>
    </div>

</template>

<style scoped>

.game-container{
    width: calc(100% - 10px);
    height: calc(100% - 10px);
    border-radius: 35px;
    background: #131313;

    display: flex;
    justify-content: center;
    align-items: center;

    overflow: hidden;
    position: relative;
    cursor: grab;
}

.game-field {
    margin: 0px;
    padding: 15px;
    display: flex;

    flex-direction: column;
    position: absolute;
    /* transition: transform 0.1s ease-in-out; */
}

/* Ряд клеток */
.row {
  display: flex;
}

.cell {
    width: 30px;
    height: 30px;
    border: 1px dashed #808080;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #343434;
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 20px;
    letter-spacing: -0.05em;
    user-select: none;
}

.cell:hover {
  background-color: #5a5a5a;
  cursor: pointer;
}


</style>