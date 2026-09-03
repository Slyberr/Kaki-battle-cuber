<template>
   <div class="flex flex-col border-secondary ">
      <p class="text-primary p-2">Tchat de <i>{{ props.roomname }}</i></p>




      <div class="tchat-container text-gray-400  bg-gray-950 min-h-0 h-80  mr-4 flex flex-col overflow-y-scroll  border rounded-t-2xl  ">

         <div id="area-of-chat">
            <div class="flex flex-col mb-2 text-sm pt-2 pl-2" v-for="msg in conv">
               <div class="flex gap-1">
                  <div class="text-gray-700">{{ '[' + msg.date + ']' }}</div>
                  <div class="text-primary"><i>{{ msg.pseudo }}</i></div>
                  <div><i>dit:</i></div>
               </div>
               <div class="flex break-all whitespace-pre-wrap">{{ msg.data }}</div>
            </div>
         </div>
         <div class="w-full border m-0"></div>
         <p class="text-sm p-4">
            ⚠️ CONCERNANT L'UTILISATION DU CHAT :
            <br>
            <br>
            - Ce chat n'est pas chiffrée de bout en bout : Veillez à ne transmettre AUCUNE information sensibles même
            votre prénom.

            <br>
            - Vous n'avez pas accès à l'ancien historique de message.
            <br>
            - Les messages ne sont conservés qu'en local : le serveur ne fait que transiter les données.
            <br>
            - Lorsque la dernière personne est partie ou que la room est supprimées, les messages sont alors
            naturellement supprimés.
            <br>
            - Restez courtois, polis et veuillez à ne pas céder à l'expression d'une quelqueconque haine.
            <br>

         </p>



      </div>
      <UForm class="flex mt-4 gap-4 w-full" @submit='sendMessage()''>
         <UFormField class="w-full ">
         <UInput class="flex grow-2" v-model="inputModel"></UInput>
         </UFormField>
         <UButton class="flex grow" type="submit">Envoyer</UButton>
       </UForm>
  
   </div>
  
   
   
</template>


<script setup lang="ts">
import { Socket } from 'socket.io-client';
import type { Message } from '~/types/chat';
import type { Player } from '~/types/player';

const props = defineProps<{ me: Player, socket: Socket, roomname: string }>()
const conv = ref<Message[]>([])
const inputModel = ref("")

onMounted(() => {
   props.socket.on('get-message', (newMessage: Message) => {
      conv.value.unshift(newMessage)
   })
})

onUnmounted(() => {
   props.socket.off('get-message')
})

const sendMessage = () => {
   if (inputModel.value.trim().length !== 0) {
      props.socket.emit('send-message', inputModel.value, props.roomname);
     
   }
    inputModel.value = ""
}

</script>