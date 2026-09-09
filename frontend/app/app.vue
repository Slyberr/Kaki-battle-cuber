<template>

  <UApp>
    <UHeader mode="drawer">
      <template #title>
        <NuxtLink to="/home">
          <NuxtImg src="/kbc.svg" width="35" />
        </NuxtLink>
      </template>

      <UModal  title="Faire un retour">
        <UButton variant="ghost" class="text-muted" icon="lucide:pencil" label="Faire un retour" ></UButton>
        <template #body>
          <FeedBack />
        </template>
      </UModal>


      <UModal  title="Réaliser un don">
        <UButton variant="ghost" class="text-muted" icon="lucide:piggy-bank" label="Réaliser un don" ></UButton>
        <template #content>
          <FeedBack />
        </template>
      </UModal>

      <template #body>
        <UModal  title="Faire un retour">
          <UButton variant="ghost" class="text-muted" icon="lucide:pencil" label="Faire un retour"></UButton>
          <template #body>
            <FeedBack />
          </template>
        </UModal>
        <UModal  title="Réaliser un don">
          <UButton variant="ghost" class="text-muted" icon="lucide:piggy-bank" label="Réaliser un don"></UButton>
          <template #body>
            <FeedBack />
          </template>
        </UModal>

      </template>
    </UHeader>

    <UMain>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </UMain>

  </UApp>

</template>


<script setup lang="ts">
import type { EventID } from './types/solve';
import FeedBack from './components/feedBack.vue';

const rooms = useState<{ roomName: string, isPrivate: boolean, currentEvent: EventID; length: number }[]>('rooms');
const socket = useSocket();
const errorToast = useToast();


//theme dark is for everyone on 1.0.
const colorMode = useColorMode();
colorMode.preference = 'dark';

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

    socket?.on('get-rooms', (therooms: { roomName: string, isPrivate: boolean, currentEvent: EventID; length: number }[]) => {
      rooms.value = therooms;
    });
  })
});

onBeforeUnmount(() => {
  socket.off('get-rooms');
});
</script>
