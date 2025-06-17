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
        <button class="reset-view-btn" @click="resetBoardView">Center View</button>
      </div>
    </div>

    <!-- НОВЫЙ ЭЛЕМЕНТ: Оверлей по окончанию игры - ВЫНЕСЕН ИЗ containerGame -->
    <div v-if="showEndGameOverlay" class="end-game-overlay">
      <div class="end-game-message-box">
        <h2>{{ endGameMessage }}</h2>
        <button class="btn-continue-lobby" @click="goToLobby">Continue to Lobby</button>
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
const CELL_SIZE = 40;
const EXPANSION_MARGIN = 5;
const DRAG_THRESHOLD = 5;

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
const cells = reactive(new Map());
const lastMove = ref(null);
const winLine = ref([]);

// --- Состояние для оверлея конца игры
const showEndGameOverlay = ref(false);
const endGameMessage = ref('');

// --- Зум и перемещение доски
const scale = ref(1);
const offset = reactive({ x: 0, y: 0 });
const boardRef = ref(null);

const isPanning = ref(false);
const lastMousePos = reactive({ x: 0, y: 0 });
const mouseDownStartPos = reactive({ x: 0, y: 0 });
const hasDragged = ref(false);

const startPan = (e) => {
  if (e.button === 0 || e.button === 1) {
    isPanning.value = true;
    hasDragged.value = false;
    lastMousePos.x = e.clientX;
    lastMousePos.y = e.clientY;
    mouseDownStartPos.x = e.clientX;
    mouseDownStartPos.y = e.clientY;

    boardRef.value.style.cursor = 'grabbing';

    if (e.button === 1) {
      e.preventDefault();
    }
  }
};

const onPan = (e) => {
  if (!isPanning.value) return;

  const dx = e.clientX - lastMousePos.x;
  const dy = e.clientY - lastMousePos.y;

  if (!hasDragged.value) {
    const totalDxFromStart = e.clientX - mouseDownStartPos.x;
    const totalDyFromStart = e.clientY - mouseDownStartPos.y;
    if (Math.abs(totalDxFromStart) > DRAG_THRESHOLD || Math.abs(totalDyFromStart) > DRAG_THRESHOLD) {
      hasDragged.value = true;
    }
  }

  offset.x += dx;
  offset.y += dy;
  lastMousePos.x = e.clientX;
  lastMousePos.y = e.clientY;
};

const endPan = (e) => {
  if (!isPanning.value) return;

  isPanning.value = false;
  if (boardRef.value) {
    boardRef.value.style.cursor = 'grab';
  }

  if (!hasDragged.value && e.button === 0) {
    handleCellClick(e);
  }
  hasDragged.value = false;
};

const onZoom = (e) => {
  e.preventDefault();
  const zoomSpeed = 0.1;
  const oldScale = scale.value;
  scale.value = e.deltaY < 0
    ? Math.min(oldScale + zoomSpeed, 3)
    : Math.max(oldScale - zoomSpeed, 0.4);

  const containerGame = document.querySelector('.containerGame');
  if (!containerGame) return;
  const containerRect = containerGame.getBoundingClientRect();

  const mouseXRelativeToContainerCenter = e.clientX - (containerRect.left + containerRect.width / 2);
  const mouseYRelativeToContainerCenter = e.clientY - (containerRect.top + containerRect.height / 2);

  const mouseWorldX = (mouseXRelativeToContainerCenter - offset.x) / oldScale;
  const mouseWorldY = (mouseYRelativeToContainerCenter - offset.y) / oldScale;

  offset.x = mouseXRelativeToContainerCenter - mouseWorldX * scale.value;
  offset.y = mouseYRelativeToContainerCenter - mouseWorldY * scale.value;
};


const currentBoardBounds = computed(() => {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  if (cells.size === 0) {
    minX = -1; maxX = 1;
    minY = -1; maxY = 1;
  } else {
    let minOccupiedX = Infinity, maxOccupiedX = -Infinity;
    let minOccupiedY = Infinity, maxOccupiedY = -Infinity;
    for (const cell of cells.values()) {
      if (cell.x < minOccupiedX) minOccupiedX = cell.x;
      if (cell.x > maxOccupiedX) maxOccupiedX = cell.x;
      if (cell.y < minOccupiedY) minOccupiedY = cell.y;
      if (cell.y > maxOccupiedY) maxOccupiedY = cell.y;
    }
    minX = minOccupiedX - EXPANSION_MARGIN;
    maxX = maxOccupiedX + EXPANSION_MARGIN;
    minY = minOccupiedY - EXPANSION_MARGIN;
    maxY = maxOccupiedY + EXPANSION_MARGIN;
  }
  return { minX, maxX, minY, maxY };
});

const boardStyle = computed(() => {
  const { minX, maxX, minY, maxY } = currentBoardBounds.value;
  const width = (maxX - minX + 1) * CELL_SIZE;
  const height = (maxY - minY + 1) * CELL_SIZE;

  return {
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale.value})`,
    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
  };
});

const getCellStyle = (x, y) => {
  const { minX, minY } = currentBoardBounds.value;
  return {
    left: `${(x - minX) * CELL_SIZE}px`,
    top: `${(y - minY) * CELL_SIZE}px`,
  };
};

const handleCellClick = (e) => {
  if (!yourTurn.value) return;
  if (showEndGameOverlay.value) return;

  const boardElement = boardRef.value;
  if (!boardElement) return;

  const containerGame = document.querySelector('.containerGame');
  if (!containerGame) return;
  const containerRect = containerGame.getBoundingClientRect();

  const clickXRelativeToContainerCenter = e.clientX - (containerRect.left + containerRect.width / 2);
  const clickYRelativeToContainerCenter = e.clientY - (containerRect.top + containerRect.height / 2);

  const unscaledXRelativeToBoardCenter = (clickXRelativeToContainerCenter - offset.x) / scale.value;
  const unscaledYRelativeToBoardCenter = (clickYRelativeToContainerCenter - offset.y) / scale.value;

  const { minX, maxX, minY, maxY } = currentBoardBounds.value;
  const boardLogicalWidth = (maxX - minX + 1) * CELL_SIZE;
  const boardLogicalHeight = (maxY - minY + 1) * CELL_SIZE;

  const unscaledXRelativeToBoardTopLeft = unscaledXRelativeToBoardCenter + boardLogicalWidth / 2;
  const unscaledYRelativeToBoardTopLeft = unscaledYRelativeToBoardCenter + boardLogicalHeight / 2;

  const cellX = Math.floor(unscaledXRelativeToBoardTopLeft / CELL_SIZE) + minX;
  const cellY = Math.floor(unscaledYRelativeToBoardTopLeft / CELL_SIZE) + minY;

  const key = `${cellX},${cellY}`;

  const { minX: boundsMinX, maxX: boundsMaxX, minY: boundsMinY, maxY: boundsMaxY } = currentBoardBounds.value;
  if (cellX < boundsMinX || cellX > boundsMaxX ||
      cellY < boundsMinY || cellY > boundsMaxY) {
    return;
  }

  if (cells.has(key) && cells.get(key).symbol) return;

  cells.set(key, { x: cellX, y: cellY, symbol: playerSymbol.value });
  lastMove.value = { x: cellX, y: cellY };
  sendMove(cellX, cellY);
};

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
  result.sort((a, b) => a.y - b.y || a.x - b.x);
  return result;
});

const isWinningCell = (x, y) => {
  return winLine.value.some(pt => pt.x === x && pt.y === y);
};

// --- Lobby handlers: join/start/move/win --
const toggleReady = () => sendReady();
const leaveLobby = () => {
  sendLeave();
  disconnectWebSocket(); // Отключаемся перед уходом
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
  offset.x = 0;
  offset.y = 0;
  scale.value = 1;
  showEndGameOverlay.value = false;
  endGameMessage.value = '';
};

const handleMoveMade = (msg) => {
  const key = `${msg.row},${msg.col}`;
  cells.set(key, { x: msg.row, y: msg.col, symbol: msg.symbol });
  lastMove.value = { x: msg.row, y: msg.col };
};

const handleGameWin = (msg) => {
  if (!msg || !Array.isArray(msg.win_line)) return;
  winLine.value = msg.win_line;
  endGameMessage.value = "You Win!";
  showEndGameOverlay.value = true;
};

const handleGameLose = (msg) => {
  if (!msg || !Array.isArray(msg.win_line)) return;
  winLine.value = msg.win_line;
  endGameMessage.value = "You Lose!";
  showEndGameOverlay.value = true;
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
  // Если отключились не по собственной инициативе (код 1000 - нормальное закрытие)
  // И текущий путь не /lobby (т.е. мы еще в игре)
  // Тогда перенаправляем в /lobby, иначе это было ожидаемое отключение.
  if (event.code !== 1000 && router.currentRoute.value.path !== '/lobby') {
    router.push('/lobby');
  }
};

const resetBoardView = () => {
  offset.x = 0;
  offset.y = 0;
  scale.value = 1;
};

const goToLobby = () => {
  cells.clear();
  lastMove.value = null;
  winLine.value = [];
  playerSymbol.value = null;
  currentTurnSymbol.value = null;
  showEndGameOverlay.value = false;
  endGameMessage.value = '';
  offset.x = 0;
  offset.y = 0;
  scale.value = 1;

  disconnectWebSocket(); // Отключаемся от WebSocket
  router.push("/lobby"); // Перенаправляем в лобби
};

onMounted(() => {
  const lobbyId = route.params.id;
  if (!lobbyId) {
    router.push("/lobby");
    return;
  }
  connectWebSocket(lobbyId);
  // ОБНОВЛЕНИЕ: Подписываемся на новое имя события "game:joined"
  onWsEvent("game:joined", handleGameJoined);
  onWsEvent("game:start", handleGameStart);
  onWsEvent("game:move_made", handleMoveMade);
  onWsEvent("game:win", handleGameWin);
  onWsEvent("game:lose", handleGameLose);
  onWsEvent("game:lobby_state_update", handleLobbyStateUpdate);
  onWsEvent("ws:disconnected", handleWsDisconnected);

  watch([boardRef, currentBoardBounds], ([newBoardRef, newBounds]) => {
    if (newBoardRef && newBounds) {
      newBoardRef.style.cursor = 'grab';
      resetBoardView();
    }
  }, { immediate: true });
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