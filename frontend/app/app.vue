<template>
  <div>
    <NuxtRouteAnnouncer />
    <div class="flex flex-col">
      <Tchatbox :conv="conv"></Tchatbox>
      <div class="flex gap-5">
        <UInput type="text" v-model="model"></UInput>
        <UButton @click="sendMessage">Envoyer</UButton>
      </div>

    </div>

  </div>
</template>


<script setup lang="ts">
import Tchatbox from './components/tchatbox.vue'
import type { Message } from './types/chat'

const { $socket } = useNuxtApp()
const model = defineModel<string>()

const conv = ref<Message[]>([])

onMounted(() => {

  $socket.on("connect", () => {
    $socket.emit("hello", "je suis connecté !" + $socket.id)

    $socket.on("receivemessage", (data: Message) => {
      console.log('message reçu client', data)
      conv.value.push(data)
    })
  })


})

const sendMessage = () => {
  if ($socket && model.value !== "") {
    $socket.emit("sendmessage", $socket.id, model.value, Date.now())
  }

}




</script>
