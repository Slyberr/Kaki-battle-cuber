<template>

       <UHeader title = "KakiBattle"></UHeader>
    <div class="flex flex-col">
      <TabBattle></TabBattle>
      <Tchatbox :conv="conv"></Tchatbox>
      <div class="flex gap-5">
        <UInput type="text" v-model="model"></UInput>
        <UButton @click="sendMessage">Envoyer</UButton>
      </div>

    </div>
</template>


<script setup lang="ts">
import { io } from 'socket.io-client';
import TabBattle from './components/tabBattle.vue'
import Tchatbox from './components/tchatbox.vue'
import type { Message } from './types/chat'


const model = defineModel<string>()
const socket = io("http://localhost:3001");
const conv = ref<Message[]>([])

onMounted(() => {
  socket.on("connect", () => {
    socket.on("receivemessage", (data: Message) => {
      console.log('message reçu client', data)
      conv.value.push(data)
    })
  })
})

const sendMessage = () => {
  if (socket && model.value !== "") {
    socket.emit("sendmessage", socket.id, model.value, Date.now())
  }
}




</script>
