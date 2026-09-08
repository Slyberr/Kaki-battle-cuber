<template>

  <UApp>
    <UHeader mode="drawer" >
      <template #title>
        <NuxtLink to="/home">
          <NuxtImg src="/kbc.svg" width="35" />
        </NuxtLink>
      </template>
      <UNavigationMenu :items="center" variant="link" />
      <template #body>
        <UNavigationMenu orientation="vertical" :items="center" variant="link" />
      </template>
      
    </UHeader>

    <UMain>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </UMain>
      
  </UApp>

</template>


<script setup lang="ts">
import { type NavigationMenuItem } from '@nuxt/ui';
import type { EventID } from './types/solve';

const rooms = useState<{ roomName: string, isPrivate: boolean, currentEvent: EventID; length: number }[]>('rooms');
const socket = useSocket();
const errorToast = useToast();
const center = ref<NavigationMenuItem[]>([
  {
    label: 'Faire un retour',
    icon: 'lucide:pencil',
    to: '/more/feedback',
    target : '_blank'
  },
  {
    label: 'Faire une donation',
    icon: 'lucide:piggy-bank',
    disabled: true,
    target : '_blank'
  },
])

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
