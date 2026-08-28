<template>
  <UHeader title="KakiBattle">

    <template #left>
      <UModal>
        <UButton color="primary" variant="ghost" label="Retour" icon="lucide:arrow-left" />
        <template #content="{ close }">
          <div class="flex flex-col p-8 w-full gap-10 items-center justify-between">
            <p>En quittant la room, vous serez indirectement éjectée et vos scores seront supprimés. Partir ? </p>
            <div class="flex justify-between w-[50%]">
              <UButton class="w-20" label="Oui" @click="leaveRoom()" icon="lucide:check" />
              <UButton class="w-20" label="Non" @click="close" icon="lucide:x" />
            </div>
          </div>
        </template>
      </UModal>
    </template>
    <template #body>
      <p>KakiTimer</p>
    </template>
  </UHeader>

  <div class="overflow-y-hidden">
    <div v-if="me" id="playground" class="flex flex-col items-center gap-4 w-full">
      <h1 class="flex text-center text-3xl">{{ roomName }} room</h1>
      <p>Vous êtes <i class="text-primary">{{ me.pseudo }} {{ me.owner ? "(modérateur)" : "" }}</i></p>
      <p class="text-2xl">{{ puzzle }}</p>
      <p class="text-center max-w-[max(50%,600px)] ">{{ scramble }}</p>

      <Timer class="mt-10" @time-ok="(time: string) => sendTime(time)" @player-running="() => playerState = 'RUNNING'"
        :player-state="playerState" :ready-holding-time="readyHoldingTime" :active-inspection="inspection" />
      <UDropdownMenu :items="dropDownItems">

        <UButton variant="ghost" class="self-start m-2" icon="lucide:settings"></UButton>
        <template #content>

        </template>
      </UDropdownMenu>
      <TabBattle v-if="roomPlayers.length > 0" :players="roomPlayers" :times="times" :solve-id="solveID"></TabBattle>
      <!-- <Tchatbox :conv="conv"></Tchatbox>
      <div class="flex gap-5">
        <UInput type="text" v-model="model"></UInput>
        <UButton @click="sendMessage">Envoyer</UButton>
      </div> -->

    </div>
  </div>

</template>


<script setup lang="ts">
import { Socket } from 'socket.io-client';
import TabBattle from '../../components/tabBattle.vue'
import type { Message } from '../../types/chat.js'
import type { DropdownMenuItem } from '@nuxt/ui';
import { TwistyPlayer } from 'cubing/twisty';
import { type Player } from '~/types/player.ts';


const mapEvent = new Map<string, { toDisplay: string, toDrawer: string }>([
  ['222', { toDisplay: '2x2', toDrawer: '2x2x2' }],
  ['333', { toDisplay: '3x3', toDrawer: '3x3x3' }],
  ['333oh', { toDisplay: '3x3 à une main', toDrawer: '3x3x3' }],
  ['333bf', { toDisplay: "3x3 à l'aveugle", toDrawer: '3x3x3' }],
  ['444', { toDisplay: '4x4', toDrawer: '4x4x4' }],
  ['444bf', { toDisplay: "4x4 à l'aveugle", toDrawer: '4x4x4' }],
  ['555', { toDisplay: '5x5', toDrawer: '5x5x5' }],
  ['555bf', { toDisplay: "5x5 à l'aveugle", toDrawer: "5x5x5" }],
  ['666', { toDisplay: '6x6', toDrawer: '6x6x6' }],
  ['777', { toDisplay: '7x7', toDrawer: '7x7x7' }],
  ['pyram', { toDisplay: 'Pyraminx', toDrawer: 'pyraminx' }],
  ['skewb', { toDisplay: 'Skewb', toDrawer: 'skewb' }],
  ['clock', { toDisplay: 'Clock', toDrawer: 'clock' }],
  ['fto', { toDisplay: 'FTO', toDrawer: 'fto' }],
  ['sq1', { toDisplay: 'Square-1', toDrawer: 'square1' }],
  ['minx', { toDisplay: 'Megaminx', toDrawer: 'megaminx' }]
])

const route = useRoute()
const socket: Socket = useSocket()

const roomName = ref<string | string[] | undefined>(route.params.id)
const roomPlayers = ref<Player[]>([])
const me = ref<Player>({ id: "null", owner: false, pseudo: "johndoe", state: "READY" })

const times = ref<Record<string, any>[]>([])
const scramble = ref<string>("")
const puzzle = ref<string>("")

const playerState = ref<"READY" | "RUNNING" | "SCORE">("READY")
const readyHoldingTime = ref<number>(0.3)
const inspection = ref<boolean>(false)
const drawer = ref<TwistyPlayer>()

const solveID = ref<number>(1)
const model = defineModel<string>()
const conv = ref<Message[]>([])

const dropDownItems = computed((): DropdownMenuItem[][] => {

  const menuForEveryone: DropdownMenuItem[][] = [
    [
      {
        label: `Presser la barre espace pendant... (${readyHoldingTime.value}s)`,
        icon: "lucide:timer",
        children: [
          {
            label: "0 seconde (déclencher dès la touche pressée)",
            onSelect: () => { readyHoldingTime.value = 0 }
          },
          {
            label: "0.3 seconde",
            onSelect: () => { readyHoldingTime.value = 0.3 }
          },
          {
            label: "0.55 seconde (Stackmat)",
            onSelect: () => { readyHoldingTime.value = 0.55 }
          },
          {
            label: "1 seconde",
            onSelect: () => { readyHoldingTime.value = 1 }
          }
        ]
      },
      {
        label: `Activer/Désactiver l'inspection (${inspection.value ? "Activée" : "Désactivée"})`,
        icon: 'lucide:timer-off',
        onSelect: () => { inspection.value = !inspection.value }
      }
    ]
  ]
  if (me.value.owner) {
    menuForEveryone.push([
      {
        label: "Changer d'épreuve",
        icon: "lucide:puzzle",

        children: [
          [
            {
              label: "La session sera réinitialisée."
            },
            {
              label: "2x2",
              onSelect: () => { socket.emit("update-event", "222", roomName.value); }
            },
            {
              label: "3x3",
              onSelect: () => { socket.emit("update-event", "333", roomName.value); }
            },
            {
              label: "3x3oh",
              onSelect: () => { socket.emit("update-event", "333oh", roomName.value); }
            },
            {
              label: "3x3bf",
              onSelect: () => { socket.emit("update-event", "333bf", roomName.value); }
            },
            {
              label: "4x4",
              onSelect: () => { socket.emit("update-event", "444", roomName.value); }
            },
            {
              label: "4x4bf",
              onSelect: () => { socket.emit("update-event", "444bf", roomName.value); }
            },
            {
              label: "5x5",
              onSelect: () => { socket.emit("update-event", "555", roomName.value); }
            },
            {
              label: "5x5bf",
              onSelect: () => { socket.emit("update-event", "555bf", roomName.value); }
            },
            {
              label: "6x6",
              onSelect: () => { socket.emit("update-event", "666", roomName.value); }
            },
            {
              label: "7x7",
              onSelect: () => { socket.emit("update-event", "777", roomName.value); }
            },
            {
              label: "Pyraminx",
              onSelect: () => { socket.emit("update-event", "pyram", roomName.value); }
            },
            {
              label: "Skewb",
              onSelect: () => { socket.emit("update-event", "skewb", roomName.value); }
            },
            {
              label: "Square-1",
              onSelect: () => { socket.emit("update-event", "sq1", roomName.value); }
            },
            {
              label: "Clock",
              onSelect: () => { socket.emit("update-event", "clock", roomName.value); }
            },
            {
              label: "Megaminx",
              onSelect: () => { socket.emit("update-event", "minx", roomName.value); }
            },
            {
              label: "FTO",
              onSelect: () => { socket.emit("update-event", "fto", roomName.value); }
            }
          ]
        ]
      },
      {
        label: "Réinitialiser la session",
        icon: "lucide:brush-cleaning",
        onSelect: () => {
          socket.emit("clear-session", (roomName.value));
        }
      },
    ])
  }
  return menuForEveryone
})

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

onMounted(() => {
  //response of socket.emit("i-want-room-data")
  socket.on("send-all-room-data", (info: { players: Player[], scramble: string, event: string, solveId: number, times: Record<string, any>[] }) => {
    roomPlayers.value = info.players
    scramble.value = info.scramble
    if (document.querySelector('twisty-player') === null) {
      drawer.value = new TwistyPlayer()

      drawer.value.puzzle = (mapEvent.get(info.event)!.toDrawer) as "2x2x2" | "3x3x3" | "4x4x4" | "5x5x5" | "6x6x6" | "pyraminx" | "skewb" | "clock" | "fto" | "square1" | "megaminx" | "7x7x7"
      drawer.value.alg = scramble.value
      drawer.value.visualization = "2D"
      drawer.value.controlPanel = 'none'
      drawer.value.background = 'none'
      const wrapper = document.createElement('div')
      wrapper.classList.add('flex', 'justify-end')
      wrapper.appendChild(drawer.value)
      document.body.appendChild(wrapper)
    }

    if (roomPlayers.value.length > 0) {

      me.value = roomPlayers.value[roomPlayers.value.length - 1]!
    }

    //Scenario : i'm new player but the room already begin 
    times.value = info.times
    solveID.value = info.solveId
    puzzle.value = mapEvent.get(info.event)?.toDisplay ?? ""
  })

  //When a new player arrived
  socket.on("new-player", (players: Player[]) => {
    roomPlayers.value = players
  })

  //When a player disconnect
  socket.on("remove-player", (players: Player[], userID: string) => {
    roomPlayers.value = players
    const wasOwner = me.value.owner

    me.value = roomPlayers.value.find((player: any) => player.id === me.value.id)!
    times.value.forEach((time) => {
      delete time[userID]
    })

    if (me.value.owner && wasOwner === false) {
      const toast = useToast()
      toast.add({
        title: "Le modérateur de salle est parti.",
        description: "Vous êtes maintenant le modérateur ! De nouvelles options sont disponibles.",
        duration: 10000
      })
    }
  })

  //When all players finishs
  socket.on("nextSolve", (data: { times: Record<string, any>, scramble: string, solveId: number }) => {
    playerState.value = "READY"
    //I prefer to send only the last solve in order to not surcharge the "nextSolve" data send.
    if (data.solveId === 1) {
      times.value = [data.times]
    } else {
      times.value.unshift(data.times)
    }

    scramble.value = data.scramble
    // drawer.value!.alg = scramble.value
    solveID.value = data.solveId
  })

  //When owner change the event
  socket.on("event-updated", (info: { event: string, times: [], scramble: string }) => {
    const eventInfo = mapEvent.get(info.event)!
    puzzle.value = eventInfo.toDisplay
    times.value = info.times
    scramble.value = info.scramble
    solveID.value = 1

    //Maj twisty
    drawer.value!.puzzle = eventInfo.toDrawer as "2x2x2" | "3x3x3" | "4x4x4" | "5x5x5" | "6x6x6" | "pyraminx" | "skewb" | "clock" | "fto" | "square1" | "megaminx" | "7x7x7"
    drawer.value!.alg = scramble.value
  })

  socket.on("session-cleaned", (info: { times: [], solveId: number }) => {
    times.value = info.times
    solveID.value = info.solveId
  })
})

const sendTime = (time: string) => {
  socket.emit("save-time", { roomName: roomName.value, time: time, userId: me.value.id, solveId: solveID.value })
  playerState.value = "SCORE"
}

const leaveRoom = () => {
  socket.emit("leave-room", me.value, roomName.value)
  return navigateTo("/home?return=yes")
}

onUnmounted(() => {
  document.body.querySelector('twisty-player')?.remove()
  socket.off("send-all-room-data");
  socket.off("new-player");
  socket.off("remove-player");
  socket.off("nextSolve");
  socket.off("event-updated");
  socket.off("session-cleaned")

  // drawer.value = undefined
})

</script>
