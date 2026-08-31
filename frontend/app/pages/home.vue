<template>

  <UPageHero title="Bienvenue sur KBC!"
    description="Kaki-battle-cuber vous permet de créer une room privée instantanément, sans compte ! Affrontez vos amis sur des épreuves officielles, ou non !"
    headline="v0.1">

    <!--- Créer une room-->
    <UModal>
      <div class="flex justify-center">
        <UButton class="relative" icon="lucide:plus">Créer une nouvelle room</UButton>
      </div>
      <template #content>
        <UForm :schema="schema" :state="state" class="flex flex-col m-8 space-y-4 min-h-[45dvh]" @submit="createRoom">
          <UFormField label="Nom de la salle" name="roomname">
            <UInput v-model="state.roomname"></UInput>
          </UFormField>
          <UFormField label="Votre pseudo" name="pseudo">
            <UInput type="input" v-model="state.pseudo"></UInput>
          </UFormField>
          <UFormField label="Privée ?" name="prive">
            <UCheckbox v-model="state.isPrivate"></UCheckbox>
          </UFormField>
          
          <template v-if="state.isPrivate">
            <UFormField label="Mot de passe" name="password">
              <UInput type="password" v-model="state.password"></UInput>
            </UFormField>
          </template>

          <UButton type="submit" class="flex self-start justify-self-end">Créer et accéder à la salle</UButton>
        </UForm>
      </template>
    </UModal>


    <!--- Rejoindre une room-->
    <UModal>
      <div class="flex justify-center">
        <UButton class="relative" icon="lucide:users">Rejoindre une room</UButton>
      </div>
      <template #content>
        <p class="text-xl m-2">{{ (rooms.length) }} Rooms actives</p>
        <div class="flex" v-for="room in rooms">

          <UModal>
            <div class="flex justify-between w-full m-2">
              <p class="self-center">{{ room.roomName }}</p>
              <p class="self-center">{{ room.length }} <UIcon name="lucide:users"></UIcon>
              </p>
              <UButton class="relative" icon="lucide:arrow-up-right">Rejoindre</UButton>
            </div>
            <template #content>
              <p class="text-center text-xl">{{ room.roomName }}</p>
              <UForm :state="stateJoin" class="m-8 space-y-4" @submit="joinRoom(room.roomName)">
                <UFormField label="Mot de passe" name="password">
                  <UInput type="password" v-model="stateJoin.password"></UInput>
                </UFormField>
                <UFormField label="Votre pseudo" name="pseudo">
                  <UInput type="input" v-model="stateJoin.pseudo"></UInput>
                </UFormField>
                <UButton type="submit">Accéder à la salle</UButton>
              </UForm>
            </template>
          </UModal>
        </div>
        <UForm :schema="schema" :state="state" class="m-8 space-y-4" @submit="">

        </UForm>
      </template>
    </UModal>
  </UPageHero>


</template>

<script setup lang="ts">

import * as v from 'valibot'

const rooms = useState<{ roomName: string, length: number }[]>('rooms')

const schema = v.object({
  roomname: v.pipe(v.string(), v.minLength(4, "Le nom doit au moins faire 4 caractères")),
  password: v.pipe(v.string(), v.minLength(4, "le mot de passe doit faire au moins 4 caractères")),
  pseudo: v.pipe(v.string(), v.minLength(1, "Votre pseudo ne doit pas être vide !")),
})

const state = reactive<{ roomname: string, isPrivate: false, password: string, pseudo: string }>({
  roomname: "",
  isPrivate: false,
  password: "",
  pseudo: ""
})

const stateJoin = reactive<{ password: string, pseudo: string }>({
  password: "",
  pseudo: "",
})


definePageMeta({
  middleware: [
    function (to, from) {
      if (from.path.includes('/room/') && !to.query.return) {

        const redirectToast = useToast()
        redirectToast.add({
          title: "Redirection",
          description: "Vous avez tenté de joindre la salle via une URL. \n Veuillez utiliser le bouton 'Rejoindre une room.'",
          duration: 10000
        })
      }
    }
  ]
})

let socket = useSocket()

onMounted(() => {

  socket.on("go-to-room", (roomName) => {
    navigateTo('/room/' + roomName);
  })
})
onUnmounted(() => {
  socket.off("go-to-room");
})


const createRoom = async () => {

  if (socket !== null) {
    socket.emit("create-room", {
      roomName: state.roomname,
      isPrivate : state.isPrivate,
      password: state.password,
      pseudo: state.pseudo
    });
  }
}

const joinRoom = async (currentRoom: string) => {

  if (socket !== null) {
    socket.emit("join-room", {
      roomName: currentRoom,
      password: stateJoin.password,
      pseudo: stateJoin.pseudo
    })
  }

}

</script>