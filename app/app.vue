<template>
  <div>
    <NuxtRouteAnnouncer />
    <input type="text" v-model="model"></input>
    <button @click="">Envoyer</button>
    <div v-for="msg in conv">
      {{ msg }}
    </div>
  </div>
</template>


<script setup lang="ts">
const { $socket } = useNuxtApp()
const model =  defineModel<string>()
 
const conv = ref<string[]>([])

onMounted(() => {
  console.log("coucou")
  $socket.emit("hello", "je suis connecté !" + $socket.id)
})


</script>
