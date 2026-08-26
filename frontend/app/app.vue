<template>
  <div>
    <UApp>

    <NuxtRouteAnnouncer />
    <NuxtPage/>
    </UApp>
  

    
  </div>
</template>


<script setup lang="ts">
const rooms = useState<{roomName : string,length : number}[]>('rooms')
const socket = useSocket()
const errorToast = useToast()
onMounted(() => {

   socket.on("connect", () => {

    socket?.on("error", (data) => {
      errorToast.add({
        title: "Erreur !",
        description: data,

      })

    })
     socket?.on('get-rooms', (therooms) => {
      rooms.value = therooms
    })
  })
})

</script>
