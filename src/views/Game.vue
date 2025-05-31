<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import Grid from '../components/Grid.vue';
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/auth.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const ws = ref(null);

// Игровые данные
const player1 = ref(null);
const player1_wins = ref(0);
const player2 = ref(null);
const player2_wins = ref(0);

const user_symbol = ref(null);

const turn = ref(false); // Чей ход
const gameBoard = ref({}); // Игровое поле

// Подключение к WebSocket
const connectWebSocket = async () => {
  ws.value = new WebSocket(`${import.meta.env.VITE_API_WEBSOCKET_URL}/game/${route.params.id}`);

  ws.value.onopen = async () => {
    ws.value.send(JSON.stringify({
      type: "Init",
      token: `Bearer ${userStore.token}`,
      user_id: `${userStore.user}`,
      username: `${userStore.username}`,
      wins: `${userStore.wins}`
    }));

    console.log("WebSocket подключен!");

  };

  ws.value.onclose = async () => {
    console.log("WebSocket отключен!");
  };

  ws.value.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'Init'){

      if (data.data.symbol){
        user_symbol.value = data.data.symbol
      };

      if (data.data.X){
        player1.value = data.data.X.username;
        player1_wins.value = data.data.X.wins;
      };

      if (data.data.O){
        player2.value = data.data.O.username;
        player2_wins.value = data.data.O.wins;
      };

    };

    if (data.type === "Auth"){
      console.log(data)
    };

    if (data.type === "Active"){
      if (data.board){
        gameBoard.value = data.board;
      };
      console.log(gameBoard.value)
      turn.value = data.turn;
    };

    if (data.type === "Warning"){
      alert(data.message);
    };

    if (data.type === "Error"){
      alert(data.message);
      router.push("/")
    };

    if (data.type === "Complete"){
      alert(data.message);
      router.push("/")
    };
  };
};

// Отправка хода на сервер
const sendMove = async (row, col) => {
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN){
    console.log("Не смог найти вебсокет");
    return
  };

  if (!turn.value){
    console.log("Не твой ход");
    return; // Если не наш ход, нельзя кликать
  };

  try {
    let type = "Active"
    await ws.value.send(JSON.stringify({type, row, col}));
  } catch (error) {
    console.error("Ошибка отправки хода:", error);
  }
};

const disconnect = async () => {
  if (ws.value) {
    ws.value.close();
    ws.value = null;
  }
};

const handleGiveUp = async () => {
  disconnect();
  router.push("/lobby");
}

onMounted(async () => {
  await userStore.getSelf()
  await connectWebSocket();
});

onBeforeUnmount(() => {
    disconnect();
  })


</script>

<template>
  <div class="body">

    <div class="header">

      <div class="element player1">

        <h3>Player 1</h3>

        <div>Nickname: {{ player1 }}</div>

        <div>Wins: {{ player1_wins }}</div>

      </div>

      <div class="element timer">

        <h3>Time</h3>

        <div>00:00</div>
      </div>

      <div class="element player2">

        <h3>Player 2</h3>

        <div>Nickname: {{ player2 }}</div>

        <div>Wins: {{ player2_wins }}</div>

      </div>

    </div>

    <div class="game">

      <div class="container">
        <Grid :gameBoard="gameBoard" :sendMove="sendMove" :user_symbol="user_symbol" />
      </div>
    </div>

    <div class="footer">

      <button class="element giveup" @click="handleGiveUp">Give Up</button>

      <div class="element info">

        <div class="symbol">Your Symbol</div>

        <div class="timeturn">Time to move</div>

        <div v-if="user_symbol === 'X'" class="symbol_1" style="color: #ff5e5e">X</div>

        <div v-if="user_symbol === 'O'" class="symbol_1" style="color: #2ec0ff">O</div>

        <div v-else class="symbol_1"> </div>

        <div v-if="turn" class="timeturn_1" style="color: #49b52e;">Your Turn</div>

        <div v-else class="timeturn_1" style="color: #fff;">Waiting...</div>

      </div>

    </div>
    
  </div>
</template>

<style scoped>
@import url(../css/game.css);
</style>