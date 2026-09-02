<template>

  <UPageHero title="Bienvenue sur KBC!"
    description="Kaki-battle-cuber vous permet de créer une room privée instantanément, sans compte ! Affrontez vos amis sur des épreuves officielles, ou non !"
    headline="v0.1">

    <!--- Créer une room-->
    <UModal>
      <div class="flex justify-center ">
        <UButton class="relative" icon="lucide:plus">Créer une nouvelle room</UButton>
      </div>
      <template #content>
        <UForm :schema="schema" :state="state" class="flex flex-col m-8 space-y-4 h-full overflow-scroll" @submit="createRoom">
          <UFormField class="h-18" label="Nom de la salle" name="roomname">
            <UInput v-model="state.roomname"></UInput>
          </UFormField>
          <UFormField class="h-18" label="Votre pseudo" name="pseudo">
            <UInput type="input" v-model="state.pseudo"></UInput>
          </UFormField>
          <UFormField  label="Privée ?" name="prive">
            <UCheckbox v-model="state.isPrivate"></UCheckbox>
          </UFormField>

          <Transition>
            <div v-if="state.isPrivate">
              <UFormField class="h-20" label="Mot de passe" name="password">
                <UInput type="password" v-model="state.password"></UInput>
              </UFormField>
            </div>
          </Transition>
          <UButton type="submit" class="relative flex self-start ">Créer et accéder à la salle</UButton>
        </UForm>
      </template>
    </UModal>

    <!--- Rejoindre une room-->
    <UModal>
      <div class="flex justify-center">
        <UButton class="relative" icon="lucide:users">Rejoindre une room</UButton>
      </div>
      <template #content>

        <div class="overflow-auto h-full">
          <p class="text-xl m-2">{{ (rooms.length) }} Rooms actives</p>
          <div class="flex " v-for="room in rooms">

            <UModal class="px-3">
              <div class="grid grid-cols-[3fr_3fr_1fr] w-full py-5">
                <div class="flex items-center gap-4">
                  <p class="self-center">{{ room.roomName }}</p>
                  <UIcon :name="room.isPrivate ? 'lucide:lock' : 'lucide:globe'"></UIcon>
                </div>

                <div class="flex items-center gap-2">
                  <p>{{ room.length }}</p>
                  <UIcon name="lucide:users"></UIcon>
                </div>
                <UButton class="relative" icon="lucide:arrow-up-right">Rejoindre</UButton>
              </div>
              <template #content>
                <p class="text-center text-xl">{{ room.roomName }}</p>
                <UForm :schema="schemaJoin" :state="stateJoin" class="m-8 space-y-4" @submit="joinRoom(room.roomName)">

                  <UFormField label="Votre pseudo" name="pseudo">
                    <UInput type="input" v-model="stateJoin.pseudo"></UInput>
                  </UFormField>
                  <UFormField v-if="room.isPrivate" label="Mot de passe" name="password">
                    <UInput type="password" v-model="stateJoin.password"></UInput>
                  </UFormField>
                  <UButton type="submit">Accéder à la salle</UButton>
                </UForm>
              </template>

            </UModal>
          </div>
        </div>
        <UForm :schema="schema" :state="state" class="m-8 space-y-4" @submit="">

        </UForm>
      </template>
    </UModal>
  </UPageHero>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const rooms = useState<{ roomName: string, isPrivate: boolean, length: number }[]>('rooms')

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

const schema = computed(() => v.object({
  roomname: v.pipe(v.string(), v.minLength(3, "Minimum 3 caractères."), v.maxLength(20, "Maximum de 20 caractères.")),
  password: state.isPrivate ? v.pipe(v.string(), v.minLength(4, "Au moins 4 caractères"), v.maxLength(10, "Maximum de 10 caractères.")) : v.pipe(v.string(), v.minLength(0)),
  pseudo: v.pipe(v.string(), v.minLength(1, "Une lettre au moins !"), v.maxLength(15, "Maximum de 15 caractères")),
})
)

const schemaJoin = computed(() => v.object({
  password: v.pipe(v.string()),
  pseudo: v.pipe(v.string(), v.minLength(1, "Une lettre au moins !"), v.maxLength(15, "Maximum de 15 caractères")),
})
)
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
      isPrivate: state.isPrivate,
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