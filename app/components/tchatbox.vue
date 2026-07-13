<template>
<div v-for="msg in conv">
      <div class="msgContainer flex-col">
      <template v-if="msg.id === $socket.id" >
         <div class="text-xs">Vous avez dit :</div>
      </template>
      <template v-else>
         <div class="text-xs">L'utilisateur {{ msg.id }} a dit : </div>
      </template>
       
        <div class="text-xs">{{ msg.data }}</div>
        <div class="bg-gray-500 text-xs">{{ new Date(msg.date)}}</div>
      </div>
    </div>

</template>


<script setup lang="ts">
import type { Message } from '~/types/chat';

const props = defineProps<{conv : Message[]}>()


</script>