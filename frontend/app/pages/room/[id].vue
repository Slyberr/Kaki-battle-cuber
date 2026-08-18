<template>

  <UHeader title="KakiBattle">
    <template #left>
      <UModal>
        <UButton color="primary" variant="ghost" label="Retour" icon="lucide:arrow-left" />
        <template #content>
          <div class="flex flex-col p-8 w-full gap-10 items-center justify-between">
            <p>En quittant la room, vous serez indirectement éjectée. Partir ?</p>

            <UButton class="w-20" label="Oui" @click="leaveRoom()" icon="lucide:check" />
          </div>
        </template>
      </UModal>
    </template>
    <template #body>
      <p>KakiTimer</p>
    </template>
  </UHeader>


  <div v-if="me" class="flex flex-col items-center gap-4 w-full">
    <h1 class="flex text-center text-3xl">{{ roomName }} room</h1>
    <p>Vous êtes <i class="text-primary">{{ me.pseudo }}</i></p>
    <p class="text-2xl">{{ event }}</p>
    <p class="text-center max-w-[max(50%,600px)]">{{ scramble }}</p>

    <Timer class="mt-10"@time-ok="(time: string) => sendTime(time)" @player-running="() => playerState = 'RUNNING'"
      :player-state="playerState""/>
    <UDropdownMenu  v-if="me.owner" :items="dropDownItems">
       
      <UButton variant="ghost" class="self-start m-2" icon="lucide:settings"></UButton>
      <template #content>

      </template>
      </UDropdownMenu >
      <TabBattle v-if="roomPlayers.length > 0" :players="roomPlayers" :times="times" :solve-id="solveID"></TabBattle>
      <!-- <Tchatbox :conv="conv"></Tchatbox>
      <div class="flex gap-5">
        <UInput type="text" v-model="model"></UInput>
        <UButton @click="sendMessage">Envoyer</UButton>
      </div> -->


      <UModal v-if="dropDownModal.modalReset"></UModal>

  </div>
</template>


<script setup lang="ts">
import { Socket } from 'socket.io-client';
import TabBattle from '../../components/tabBattle.vue'
import type { Message } from '../../types/chat.js'
import type { DropdownMenuItem } from '@nuxt/ui';

const mapEvent = new Map([
  ['222', '2x2'],
  ['333', '3x3'],
  ['333oh', '3x3 OH'],
  ['333bf', "3x3 à l'aveugle"],
  ['444', '4x4'],
  ['444bf', "4x4 à l'aveugle"],
  ['555', "5x5"],
  ['555bf', "5x5 à l'aveugle"],
  ['666', '6x6'],
  ['777', '7x7'],
  ['pyram', 'Pyraminx'],
  ['skewb', 'Skewb'],
  ['clock', 'Clock'],
  ['fto', 'Face Turing Octahedron'],
  ['sq1', 'Square-1'],
  ['minx', 'Megaminx']
])

const route = useRoute()
const socket: Socket = useSocket()

const roomName = ref(route.params.id)
const roomPlayers = ref([])
const me = ref()

const times = ref<string[]>([])
const scramble = ref<string>("")
const event = ref<string>("")

const playerState = ref<"READY" | "RUNNING" | "SCORE">("READY")
const dropDownModal = reactive({
  modalEvent: false,
  modalReset: false,

})

const solveID = ref(1)
const model = defineModel<string>()
const conv = ref<Message[]>([])

const dropDownItems = ref<DropdownMenuItem[][]>([
  [
    {
      label: "Changer d'épreuve",
      icon: "lucide:puzzle",

      children: [
        [
          {
            label: "Attention : Changer d'épreuve = reset de session !"
          },
          {
            label: "2x2",
            onSelect: () => { socket.emit("update-event", "222",roomName.value) }
          },
          {
            label: "3x3",
            onSelect: () => { socket.emit("update-event", "333",roomName.value) }
          }, 
          {
            label: "3x3oh",
            onSelect: () => { socket.emit("update-event", "333oh",roomName.value) }
          },
          {
            label: "3x3bf",
            onSelect: () => { socket.emit("update-event", "333bf",roomName.value) }
          },
          {
            label: "4x4",
            onSelect: () => { socket.emit("update-event", "444",roomName.value) }
          },
          {
            label: "4x4bf",
            onSelect: () => { socket.emit("update-event", "444bf",roomName.value) }
          },
          {
            label: "5x5",
            onSelect: () => { socket.emit("update-event", "555",roomName.value) }
          },
          {
            label: "5x5bf",
            onSelect: () => { socket.emit("update-event", "555bf",roomName.value) }
          },
          {
            label: "6x6",
            onSelect: () => { socket.emit("update-event", "666",roomName.value) }
          },
          {
            label: "7x7",
            onSelect: () => { socket.emit("update-event", "777",roomName.value) }
          },
          {
            label: "Pyraminx",
            onSelect: () => { socket.emit("update-event", "pyram",roomName.value) }
          },
          {
            label: "Skewb",
            onSelect: () => { socket.emit("update-event", "skewb",roomName.value) }
          },
          {
            label: "Square-1",
            onSelect: () => { socket.emit("update-event", "sq1",roomName.value) }
          },
          {
            label: "Clock",
            onSelect: () => { socket.emit("update-event", "clock",roomName.value) }
          },
          {
            label: "Megaminx",
            onSelect: () => { socket.emit("update-event", "minx",roomName.value) }
          },
          {
            label: "FTO",
            onSelect: () => { socket.emit("update-event", "fto",roomName.value) }
          }

        ]
      ],
      onSelect: (e) => { console.log(e) }
    },
    {
      label: "Réinitialiser la session",
      icon: "lucide:brush-cleaning",

    },
  ]
])

definePageMeta({
  middleware: [
    function (to, from) {
      if (from.path !== '/home') {
        return navigateTo('/home', { redirectCode: 301 })
      }
    }
  ]
})

//Instant ask at server
socket.emit("i-want-room-data", roomName.value);


//ALL LISTENERS SECTIONS

//response of socket.emit("i-want-room-data")
socket.on("send-all-room-data", (info: { players: [], scramble: string, event: string, solveId: number, times: any[] }) => {
  roomPlayers.value = info.players
  scramble.value = info.scramble
  me.value = roomPlayers.value[roomPlayers.value.length - 1]

  //Scenario : i'm new player but the room already begin 
  times.value = info.times
  solveID.value = info.solveId
  event.value = mapEvent.get(info.event) ?? ""
})

//When a new player arrived
socket.on("new-player", (players) => {
  roomPlayers.value = players
})

//When a player disconnect
socket.on("remove-player", (players) => {
  roomPlayers.value = players
  //
  const wasOwner = me.value.owner
  me.value = roomPlayers.value.find((player :any)=> player.id === me.value.id)
  if (me.value.owner && wasOwner === false) {
    const toast = useToast()
    toast.add({
      title: "Le modérateur de salle est parti.",
          description: "Vous êtes maintenant le modérateur ! Choisissez les options via la roue crantée. ",
          duration: 10000
    })
  }
})

//When all players finishs
socket.on("nextSolve", (data: { times: any, scramble: string, solveId: number }) => {
  playerState.value = "READY"
  //I prefer to send only the last solve in order to not surcharge the "nextSolve" data send.
  if (data.solveId === 1) {
    times.value = [data.times]
  } else {
    times.value.push(data.times)
  }

  scramble.value = data.scramble
  solveID.value = data.solveId
})

//When owner change the event
socket.on("event-updated", (info : {event : string,times : [], scramble : string}) => {
  event.value = info.event
  times.value = info.times
  scramble.value = info.scramble
})

const sendTime = (time: string) => {
  socket.emit("save-time", { roomName: roomName.value, time: time, playerId: me.value.id, solveId: solveID.value })
  playerState.value = "SCORE"
}

const leaveRoom = () => {
  socket.emit("leave-room", me.value, roomName.value)
  return navigateTo("/home?return=yes")
}

// socket.on("receivemessage", (data: Message) => {
//   console.log('message reçu client', data)
//   conv.value.push(data)
// })


// const sendMessage = () => {
//   if (socket && model.value !== "") {
//     socket.emit("sendmessage", socket.id, model.value, Date.now())
//   }
// }




</script>
