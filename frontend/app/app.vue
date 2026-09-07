<template>
  <div>
    <UApp>
    <NuxtRouteAnnouncer />
    <NuxtPage/>
    </UApp>
  </div>
</template>


<script setup lang="ts">
const rooms = useState<{roomName : string,length : number}[]>('rooms');
const socket = useSocket();
const errorToast = useToast();
onMounted(() => {
   socket.on('connect', () => {

    socket?.on('error', (data) => {
      errorToast.add({
        title: 'Erreur !',
        description: data,

      });
    });

    socket?.on('removed', (data) => {
      errorToast.add({
        title: 'Vous avez été exclu de la room.',
        description: data,

      });
      return navigateTo("/home?return=yes");;
    });

    socket?.on('get-rooms', (therooms) => {
      rooms.value = therooms;
    });
  })
});

onUnmounted(()=> {
  socket.off('get-rooms');
});
</script>
