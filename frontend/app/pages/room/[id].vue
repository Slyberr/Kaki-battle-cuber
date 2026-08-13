<template>

  <UHeader title="KakiBattle"></UHeader>
  <div class="flex flex-col">
    {{ roomName }}

    <Timer/>
    <TabBattle v-if="roomPlayers.length > 0" :players="roomPlayers"></TabBattle>
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

const model = defineModel<string>()
const conv = ref<Message[]>([])

socket.emit("i-want-room-data", roomName.value);

//Cela permet d'initialiser toutes les données nécessaires.
socket.on("send-all-room-data", (players: []) => {
  roomPlayers.value = players
})

//Cela permet de mettre à jour quand un nouveau joueur arrive.
socket.on("new-player", (players) => {
  roomPlayers.value = players
})


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
