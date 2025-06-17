<template>
  <div class="body">
    <!-- 🟡 Лобби -->
    <div v-if="windowState === 1" class="containerWaiting">
      <div class="userList">
        <h3>Lobby: {{ lobbyName }}</h3>
        <p v-if="lobbyOwner">Owner: {{ lobbyOwner }}</p>
        <div v-if="players.length" class="userContainer">
          <PlayerCard
            v-for="el in players"
            :key="el.id || el.username"
            :username="el.username"
            :wins="el.wins"
            :symbol="el.symbol"
            :isReady="el.isReady"
          />
        </div>
        <p v-else>Waiting for players...</p>
      </div>

      <div class="buttons">
        <button id="Ready" class="btn" @click="toggleReady">{{ isReady ? "Unready" : "Ready" }}</button>
        <button id="Leave" class="btn" @click="leaveLobby">Leave</button>
      </div>
    </div>

    <!-- 🔴 Игра -->
    <div v-if="windowState === 2" class="containerGame">
      <div
        class="game-board"
        ref="boardRef"
        @mousedown="startPan"
        @mousemove="onPan"
        @mouseup="endPan"
        @mouseleave="endPan"
        @wheel="onZoom"
        @click="handleCellClick"
        :style="boardStyle"
      >
        <div
          v-for="cell in visibleCells"
          :key="`${cell.x},${cell.y}`"
          class="cell"
          :class="{
            occupied: cell.symbol,
            last: lastMove && lastMove.x === cell.x && cell.y === lastMove.y,
            winning: isWinningCell(cell.x, cell.y)
          }"
          :style="getCellStyle(cell.x, cell.y)"
        >
          <span class="symbol-text"
                :class="{
                  'text-x': cell.symbol === 'X',
                  'text-o': cell.symbol === 'O'
                }">
            {{ cell.symbol || '' }}
          </span>
        </div>
      </div>

      <div class="turn-box">
        <h3>Turn</h3>
        <p :class="{ 'text-green': yourTurn, 'text-red': !yourTurn }">
          {{ yourTurn ? "You're Turn" : "Enemy Turn" }}
        </p>
        <button class="giveup">GIVE UP</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import PlayerCard from "../components/PlayerCard.vue";
import {
  connectWebSocket,
  disconnectWebSocket,
  sendReady,
  sendLeave,
  sendMove,
  onWsEvent,
  offWsEvent,
} from "../services/websocket";

// --- Константы
const CELL_SIZE = 40; // Размер одной ячейки в пикселях (40px, как в CSS)
const EXPANSION_MARGIN = 5; // Маржа расширения поля вокруг занятых ячеек

// --- Routing + Store
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// --- Лобби/игра / Текущее состояние
const windowState = ref(1);
const lobbyName = ref('Loading...');
const lobbyOwner = ref(null);
const players = ref([]);
const isReady = ref(false);

// --- Символы игроков
const playerSymbol = ref(null);
const currentTurnSymbol = ref(null);
const yourTurn = computed(() => currentTurnSymbol.value === playerSymbol.value);

// --- Карта ходов
// `cells` хранит только сделанные ходы (например, '0,0' -> {x:0, y:0, symbol:'X'})
const cells = reactive(new Map());
const lastMove = ref(null);
const winLine = ref([]);

// --- Зум и перемещение доски
const scale = ref(1);
// `offset` теперь представляет смещение ЦЕНТРА game-board от ЦЕНТРА containerGame
const offset = reactive({ x: 0, y: 0 });
const boardRef = ref(null); // Ссылка на DOM-элемент игрового поля

const isPanning = ref(false);
const lastMousePos = reactive({ x: 0, y: 0 });

const startPan = (e) => {
  if (e.button === 0) { // Только левая кнопка мыши
    isPanning.value = true;
    lastMousePos.x = e.clientX;
    lastMousePos.y = e.clientY;
    boardRef.value.style.cursor = 'grabbing';
  }
};

const onPan = (e) => {
  if (!isPanning.value) return;
  const dx = e.clientX - lastMousePos.x;
  const dy = e.clientY - lastMousePos.y;
  offset.x += dx; // Просто изменяем смещение центра
  offset.y += dy;
  lastMousePos.x = e.clientX;
  lastMousePos.y = e.clientY;
};

const endPan = () => {
  isPanning.value = false;
  if (boardRef.value) {
    boardRef.value.style.cursor = 'grab';
  }
};

const onZoom = (e) => {
  e.preventDefault();
  const zoomSpeed = 0.1;
  const oldScale = scale.value;
  scale.value = e.deltaY < 0
    ? Math.min(oldScale + zoomSpeed, 3)
    : Math.max(oldScale - zoomSpeed, 0.4);

  // Получаем размеры родительского контейнера для вычисления центра
  const containerGame = document.querySelector('.containerGame');
  if (!containerGame) return;
  const containerRect = containerGame.getBoundingClientRect();

  // Координаты мыши относительно ЦЕНТРА containerGame
  const mouseXRelativeToContainerCenter = e.clientX - (containerRect.left + containerRect.width / 2);
  const mouseYRelativeToContainerCenter = e.clientY - (containerRect.top + containerRect.height / 2);

  // Получаем "мировые" координаты (в системе координат не-трансформированной доски)
  // точки под курсором, относительно центра доски.
  // Эта формула переводит экранные координаты (относительно центра контейнера)
  // в координаты внутри игрового поля (относительно его центра),
  // учитывая текущее смещение и масштаб.
  const mouseWorldX = (mouseXRelativeToContainerCenter - offset.x) / oldScale;
  const mouseWorldY = (mouseYRelativeToContainerCenter - offset.y) / oldScale;

  // Вычисляем новое смещение `offset`, чтобы "мировая" точка осталась под курсором
  offset.x = mouseXRelativeToContainerCenter - mouseWorldX * scale.value;
  offset.y = mouseYRelativeToContainerCenter - mouseWorldY * scale.value;
};


// Вычисление границ активного поля (bounding box)
const currentBoardBounds = computed(() => {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  if (cells.size === 0) {
    // Изначальное поле 3x3: от (-1,-1) до (1,1)
    minX = -1; maxX = 1;
    minY = -1; maxY = 1;
  } else {
    // Вычисляем границы занятых ячеек
    let minOccupiedX = Infinity, maxOccupiedX = -Infinity;
    let minOccupiedY = Infinity, maxOccupiedY = -Infinity;
    for (const cell of cells.values()) {
      if (cell.x < minOccupiedX) minOccupiedX = cell.x;
      if (cell.x > maxOccupiedX) maxOccupiedX = cell.x;
      if (cell.y < minOccupiedY) minOccupiedY = cell.y;
      if (cell.y > maxOccupiedY) maxOccupiedY = cell.y;
    }
    // Расширяем границы на EXPANSION_MARGIN
    minX = minOccupiedX - EXPANSION_MARGIN;
    maxX = maxOccupiedX + EXPANSION_MARGIN;
    minY = minOccupiedY - EXPANSION_MARGIN;
    maxY = maxOccupiedY + EXPANSION_MARGIN;
  }
  return { minX, maxX, minY, maxY };
});

// Стиль для game-board
const boardStyle = computed(() => {
  const { minX, maxX, minY, maxY } = currentBoardBounds.value;

  // Ширина и высота game-board в пикселях
  const width = (maxX - minX + 1) * CELL_SIZE;
  const height = (maxY - minY + 1) * CELL_SIZE;

  // `transform: translate(-50%, -50%)` в CSS (который мы добавим)
  // центрирует элемент. Наши JS `offset` и `scale` добавляются поверх этого.
  return {
    width: `${width}px`,
    height: `${height}px`,
    // Базовый transform: translate(-50%, -50%) должен быть в CSS для правильного transform-origin
    // Затем JS добавляет свое смещение и масштаб:
    transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale.value})`,
    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
  };
});

// Позиционирование ячейки относительно верхнего левого угла game-board
const getCellStyle = (x, y) => {
  const { minX, minY } = currentBoardBounds.value;
  return {
    left: `${(x - minX) * CELL_SIZE}px`,
    top: `${(y - minY) * CELL_SIZE}px`,
  };
};

// Обработка клика
const handleCellClick = (e) => {
  if (!yourTurn.value) return;
  if (isPanning.value) return; // Не обрабатываем клик, если идет панорамирование

  const boardElement = boardRef.value;
  if (!boardElement) return;

  // Получаем размеры родительского контейнера, чтобы найти его центр
  const containerGame = document.querySelector('.containerGame');
  if (!containerGame) return;
  const containerRect = containerGame.getBoundingClientRect();

  // 1. Координаты клика относительно ЦЕНТРА `containerGame`
  const clickXRelativeToContainerCenter = e.clientX - (containerRect.left + containerRect.width / 2);
  const clickYRelativeToContainerCenter = e.clientY - (containerRect.top + containerRect.height / 2);

  // 2. Обратная трансформация: получаем координаты клика в системе координат
  // не-трансформированного `game-board`, относительно ЕГО ЦЕНТРА.
  // Мы вычитаем `offset` (наше смещение от центра) и делим на `scale` (наш масштаб).
  const unscaledXRelativeToBoardCenter = (clickXRelativeToContainerCenter - offset.x) / scale.value;
  const unscaledYRelativeToBoardCenter = (clickYRelativeToContainerCenter - offset.y) / scale.value;

  // 3. Вычисляем пиксельные координаты клика относительно ВЕРХНЕГО ЛЕВОГО угла
  // не-трансформированного `game-board`.
  const { minX, maxX, minY, maxY } = currentBoardBounds.value;
  const boardLogicalWidth = (maxX - minX + 1) * CELL_SIZE;
  const boardLogicalHeight = (maxY - minY + 1) * CELL_SIZE;

  const unscaledXRelativeToBoardTopLeft = unscaledXRelativeToBoardCenter + boardLogicalWidth / 2;
  const unscaledYRelativeToBoardTopLeft = unscaledYRelativeToBoardCenter + boardLogicalHeight / 2;

  // 4. Определяем игровые координаты ячейки (cellX, cellY)
  const cellX = Math.floor(unscaledXRelativeToBoardTopLeft / CELL_SIZE) + minX;
  const cellY = Math.floor(unscaledYRelativeToBoardTopLeft / CELL_SIZE) + minY;

  const key = `${cellX},${cellY}`;

  // Проверяем, что кликнутая ячейка находится в пределах активного поля
  const { minX: boundsMinX, maxX: boundsMaxX, minY: boundsMinY, maxY: boundsMaxY } = currentBoardBounds.value;
  if (cellX < boundsMinX || cellX > boundsMaxX ||
      cellY < boundsMinY || cellY > boundsMaxY) {
    // Кликнули вне активной зоны
    return;
  }

  // Проверяем, что ячейка не занята
  if (cells.has(key) && cells.get(key).symbol) return;

  cells.set(key, { x: cellX, y: cellY, symbol: playerSymbol.value });
  lastMove.value = { x: cellX, y: cellY };
  sendMove(cellX, cellY);
};

// Генерация видимых клеток (такая же, как в currentBoardBounds)
const visibleCells = computed(() => {
  const tempMap = new Map();
  const { minX, maxX, minY, maxY } = currentBoardBounds.value;

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const key = `${x},${y}`;
      tempMap.set(key, cells.get(key) || { x, y, symbol: null });
    }
  }

  const result = Array.from(tempMap.values());
  result.sort((a, b) => a.y - b.y || a.x - b.x); // Для стабильного порядка
  return result;
});

const isWinningCell = (x, y) => winLine.value.some(pt => pt.x === x && pt.y === y);

// --- Lobby handlers: join/start/move/win --
const toggleReady = () => sendReady();
const leaveLobby = () => {
  sendLeave();
  disconnectWebSocket();
  router.push("/lobby");
};

const handleGameJoined = (msg) => {
  players.value = msg.players || [];
  lobbyName.value = msg.name || `Lobby ${route.params.id}`;
  lobbyOwner.value = msg.owner;
  const currentUserName = authStore.user?.username;
  const currentPlayer = players.value.find(p => p.username === currentUserName);
  if (currentPlayer) {
    playerSymbol.value = currentPlayer.symbol;
    isReady.value = currentPlayer.isReady;
  } else {
    isReady.value = false;
    playerSymbol.value = null;
  }
};

const handleGameStart = ({ symbol }) => {
  windowState.value = 2;
  playerSymbol.value = symbol;
  cells.clear();
  lastMove.value = null;
  winLine.value = [];
  // Сбрасываем позицию и масштаб при начале новой игры
  offset.x = 0;
  offset.y = 0;
  scale.value = 1;
  // centerBoard(); // Больше не нужно вызывать здесь, watch сделает это
};

const handleMoveMade = (msg) => {
  const key = `${msg.row},${msg.col}`;
  cells.set(key, { x: msg.row, y: msg.col, symbol: msg.symbol });
  lastMove.value = { x: msg.row, y: msg.col };
};

const handleGameWin = (msg) => {
  if (!msg || !Array.isArray(msg.win_line)) return;
  winLine.value = msg.win_line;
};

const handleGameLose = (msg) => {
  if (!msg || !Array.isArray(msg.win_line)) return;
  winLine.value = msg.win_line;
};

const handleLobbyStateUpdate = (msg) => {
  if (msg.players) players.value = msg.players;
  if (msg.owner) lobbyOwner.value = msg.owner;
  if (msg.name) lobbyName.value = msg.name;
  if (msg.current_turn_symbol) currentTurnSymbol.value = msg.current_turn_symbol;
  if (msg.last_move) lastMove.value = msg.last_move;
  if (msg.board_state) {
    cells.clear();
    msg.board_state.forEach(cell => {
      cells.set(`${cell.x},${cell.y}`, { x: cell.x, y: cell.y, symbol: cell.symbol });
    });
  }
  winLine.value = msg.win_line || [];
};

const handleWsDisconnected = (event) => {
  if (event.code !== 1000 && router.currentRoute.value.path !== '/lobby') {
    router.push('/lobby');
  }
};

// Центрирует игровое поле.
// Так как `offset` теперь означает смещение центра `game-board` от центра `containerGame`,
// для центрирования достаточно установить `offset` в (0,0).
const centerBoard = () => {
  offset.x = 0;
  offset.y = 0;
};

// --- Жизненный цикл (подключение)
onMounted(() => {
  const lobbyId = route.params.id;
  if (!lobbyId) {
    router.push("/lobby");
    return;
  }
  connectWebSocket(lobbyId);
  onWsEvent("game:joined", handleGameJoined);
  onWsEvent("game:start", handleGameStart);
  onWsEvent("game:move_made", handleMoveMade);
  onWsEvent("game:win", handleGameWin);
  onWsEvent("game:lose", handleGameLose);
  onWsEvent("game:lobby_state_update", handleLobbyStateUpdate);
  onWsEvent("ws:disconnected", handleWsDisconnected);

  // Центрируем доску при монтировании и при каждом изменении ее логических границ
  watch([boardRef, currentBoardBounds], ([newBoardRef, newBounds]) => {
    if (newBoardRef && newBounds) {
      newBoardRef.style.cursor = 'grab'; // Начальный курсор
      centerBoard(); // Центрируем
    }
  }, { immediate: true }); // immediate: true - чтобы сработало сразу при монтировании
});

onBeforeUnmount(() => {
  offWsEvent("game:joined", handleGameJoined);
  offWsEvent("game:start", handleGameStart);
  offWsEvent("game:move_made", handleMoveMade);
  offWsEvent("game:win", handleGameWin);
  offWsEvent("game:lose", handleGameLose);
  offWsEvent("game:lobby_state_update", handleLobbyStateUpdate);
  offWsEvent("ws:disconnected", handleWsDisconnected);
  disconnectWebSocket();
});
</script>


<style scoped>
/* Импортируем твои стили */
@import url(../css/game.css);


</style>