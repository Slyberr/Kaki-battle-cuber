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
        <UForm :schema="schema" :state="state" class="m-8 space-y-4" @submit="createRoom">
          <UFormField label="Nom de la salle" name="roomname">
            <UInput v-model="state.roomname"></UInput>
          </UFormField>
          <UFormField label="Mot de passe" name="password">
            <UInput type="password" v-model="state.password"></UInput>
          </UFormField>
          <UFormField label="Votre pseudo" name="pseudo">
            <UInput type="input" v-model="state.pseudo"></UInput>
          </UFormField>
          <UButton type="submit">Créer et accéder à la salle</UButton>
        </UForm>
      </template>
    </UModal>


    <!--- Rejoindre une room-->
    <UModal >
      <div class="flex justify-center">
        <UButton class="relative" icon="lucide:users">Rejoindre une room</UButton>
      </div>
      <template #content>
        <p class="text-xl m-2">{{ allrooms.length }} Rooms actives</p>
        <div class="flex" v-for="room in allrooms">
         
          <UModal >
            <div class="flex justify-between w-full m-2">
               <p class="self-center">{{ room }}</p>
              <UButton class="relative" icon="lucide:arrow-up-right">Rejoindre</UButton>
            </div>
            <template #content>
              <p class="text-center text-xl">{{ room }}</p>
              <UForm :state="stateJoin" class="m-8 space-y-4" @submit="joinRoom(room)">
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

const allrooms = ref([])

const schema = v.object({
  roomname: v.pipe(v.string(), v.minLength(4, "Le nom doit au moins faire 4 caractères")),
  password: v.pipe(v.string(), v.minLength(4, "le mot de passe doit faire au moins 4 caractères")),
  pseudo: v.pipe(v.string(), v.minLength(1, "Votre pseudo ne doit pas être vide !")),
})

const state = ref({
  roomname: "",
  password: "",
  pseudo: ""
})

const stateJoin = ref({
  password: "",
  pseudo: "",
})

const errorToast = useToast()
let socket = useSocket()
onMounted(() => {
  socket.on("connect", () => {

    socket?.on("error", (data) => {
      console.log(data, "ici")
      errorToast.add({
        title: "Erreur !",
        description: data,

      })

    })

    socket?.on("go-to-room", (roomName) => {
      navigateTo('/room/' + roomName)
    })
    socket?.on('get-rooms', (therooms) => {
      allrooms.value = therooms
    })
  })

})

const createRoom = async () => {

  if (socket !== null) {
    socket.emit("create-room", {
      roomName: state.value.roomname,
      password: state.value.password,
      pseudo: state.value.pseudo
    });
  }
}

const joinRoom = async (currentRoom : string) => {

  if (socket !== null) {
    socket.emit("join-room", {
      roomName : currentRoom,
      password : stateJoin.value.password,
      pseudo: stateJoin.value.pseudo
    })
  }

}

</script>