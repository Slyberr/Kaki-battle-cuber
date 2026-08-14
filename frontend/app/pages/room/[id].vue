<template>

  <UHeader title="KakiBattle"></UHeader>
  <div v-if ="me"class="flex flex-col">
    Vous êtes {{ me.pseudo }}

    <Timer @time-ok="(time : string)  => sendTime(time)" @player-running="() => playerState = 'RUNNING'" :player-state="playerState""/>
    <TabBattle v-if="roomPlayers.length > 0" :players="roomPlayers" :solve-id="solveID"></TabBattle>
    <!-- <Tchatbox :conv="conv"></Tchatbox>
      <div class="flex gap-5">
        <UInput type="text" v-model="model"></UInput>
        <UButton @click="sendMessage">Envoyer</UButton>
      </div> -->

  </div>
</template>


<script setup lang="ts">
import { io, Socket } from 'socket.io-client';
import TabBattle from '../../components/tabBattle.vue'
import type { Message } from '../../types/chat.js'


const route = useRoute()
const socket: Socket = useSocket()
const roomName = ref(route.params.id)
const roomPlayers = ref([])
const me = ref()
const playerState = ref<"READY" | "RUNNING" | "SCORE">("READY")

const solveID = ref(1)
const model = defineModel<string>()
const conv = ref<Message[]>([])

socket.emit("i-want-room-data", roomName.value);

//when your a new player in this room
socket.on("send-all-room-data", (players: []) => {
  roomPlayers.value = players
  me.value = roomPlayers.value[roomPlayers.value.length -1]
})

//When a new player arrived
socket.on("new-player", (players) => {
  roomPlayers.value = players
})

//When a player disconnect
socket.on("remove-player", (players) => {
  roomPlayers.value = players
})

socket.on("nextSolve", () => {
  solveID.value += 1
  playerState.value = "READY"

})

const sendTime = (time : string) => {
  socket.emit("save-time", {roomName : roomName.value,time : time, playerId : me.value.id, solveId : solveID.value })
  playerState.value = "SCORE"
}

// socket.on("receivemessage", (data: Message) => {
//   console.log('message reçu client', data)
//   conv.value.push(data)
// })


// const sendMessage = () => {
//   if (socket && model.value !== "") {
//     socket.emit("sendmessage", socket.id, model.value, Date.now())
//   }
// }




</script>
