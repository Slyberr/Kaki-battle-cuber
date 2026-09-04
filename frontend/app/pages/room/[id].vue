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

  <div class="flex flex-col">
  <div>
    <div v-if="me" id="playground" class="flex flex-col items-center gap-4 w-full">
      <h1 class="flex text-center text-3xl">{{ roomName }}</h1>

      <p v-if="me.owner">(Vous êtes le<i class="text-primary"> modérateur</i>)</p>
      <p class="text-2xl">{{ puzzle }}</p>
      <p class="text-center max-w-[max(50%,600px)] h-20 ">{{ scramble }}</p>

      <Timer class="mt-10 " :local-player-state="localPlayerState" :ready-holding-time="readyHoldingTime"
        :active-inspection="inspection" :input-mode="inputMode" :audios="audiosForInspection"
        @player-change-state="(state: PlayerState) => { socket.emit('change-state', roomName, state) }"
        @time-sended="(time: number,inspectionPenality : string,penalitySelected : string) => sendTime(time,inspectionPenality,penalitySelected)" />

      <UDropdownMenu :items="dropDownItems" :disabled="!dropDownMenuEnabled">
        <UButton variant="ghost" class="self-start m-2" icon="lucide:settings"></UButton>
      </UDropdownMenu>
    
    </div>
     
  </div>
 <div class="grid grid-cols-[2fr_1fr] w-full gap-8">
        <TabBattle class="grow-8" v-if="roomPlayers.length > 0" :players="roomPlayers" :times="allSolves" :solve-id="actualSolveId"
          :me="me">
        </TabBattle>
       <Tchatbox  class="grow min-w-0" :me="me" :socket="socket" :roomname="(roomName as string)"></Tchatbox>
     </div>

</div>
<div id="footer" class=" flex justify-end items-center  bottom-0 w-full">
  <div id="twisty-container" class="2xl:scale-100 xl:scale-90 scale-75 flex items-center "></div>
</div>
</template>


<script setup lang="ts">
import { Socket } from 'socket.io-client';
import TabBattle from '../../components/tabBattle.vue'
import type { DropdownMenuItem } from '@nuxt/ui';
import { TwistyPlayer } from 'cubing/twisty';
import { type Player, type PlayerState } from '~/types/player.ts';
import type { Solve } from '~/types/solve.ts';
import { string } from 'valibot';

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
const actualSolveId = ref<number>(1)

const allSolves = ref<Solve[]>([{ solveId: 0 }])
const scramble = ref<string>("")
const puzzle = ref<string>("")

const localPlayerState = ref<PlayerState>("READY")
const readyHoldingTime = ref<number>(0.3)
const inspection = ref<boolean>(false)
const audiosForInspection = ref<string[]>(['Rien', 'rien']);

const inputMode = ref<"KEYBOARD" | "MANUALLY">("KEYBOARD")
const drawer = ref<TwistyPlayer>()

const dropDownMenuEnabled = computed(() => roomPlayers.value.every((player) => player.state === 'READY'))
const dropDownItems = computed((): DropdownMenuItem[][] => {
  return useGetDropDownMenu(readyHoldingTime, inspection, inputMode, audiosForInspection, socket, roomName as Ref<string>, me)
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

useHead({
  title: roomName.value as string
})

//Instant ask at server
socket.emit("i-want-room-data", roomName.value);

//ALL LISTENERS SECTIONS

onMounted(() => {
  //response of socket.emit("i-want-room-data")
  socket.on("send-all-room-data", (info: { players: Player[], scramble: string, event: string, actualSolveId: number, allSolves: Solve[] }) => {
    roomPlayers.value = info.players
    scramble.value = info.scramble
    if (document.querySelector('twisty-player') === null) {
      drawer.value = new TwistyPlayer()

      drawer.value.puzzle = (mapEvent.get(info.event)!.toDrawer) as "2x2x2" | "3x3x3" | "4x4x4" | "5x5x5" | "6x6x6" | "pyraminx" | "skewb" | "clock" | "fto" | "square1" | "megaminx" | "7x7x7"
      drawer.value.alg = scramble.value
      drawer.value.visualization = "2D"
      drawer.value.controlPanel = 'none'
      drawer.value.background = 'none'
      const wrapper = document.getElementById('twisty-container')!
      wrapper.appendChild(drawer.value)
     
    }

    if (roomPlayers.value.length > 0) {

      me.value = roomPlayers.value[roomPlayers.value.length - 1]!
    }

    //Scenario : i'm new player but the room already begin 
    allSolves.value = info.allSolves.length !== 0 ? info.allSolves : [{ solveId: 0 }]
    actualSolveId.value = info.actualSolveId
    puzzle.value = mapEvent.get(info.event)?.toDisplay ?? ""
  })

  //new player just come / someone change his state
  socket.on("players-updated", (players: Player[]) => {
    roomPlayers.value = players
  })

  //When a player disconnect
  socket.on("remove-player", (players: Player[], userID: string) => {
    roomPlayers.value = players
    const wasOwner = me.value.owner

    allSolves.value.forEach((solve) => {
      delete solve[userID]
    })

    const newMe = roomPlayers.value.find((player: Player) => player.id === me.value.id)
    const toast = useToast()

    if (newMe) {
      me.value = newMe
      if (me.value.owner && wasOwner === false) {
        toast.add({
          title: "Le modérateur de salle est parti.",
          description: "Vous êtes maintenant le modérateur ! De nouvelles options sont disponibles.",
          duration: 5000
        })
      }
    }

  })

  //When all players finishs
  socket.on("nextSolve", (data: { solveId: number, scramble: string, solveToDisplay: Solve }) => {
    localPlayerState.value = "READY"
    //Note 1 : I prefer to send the last solve only in order to not surcharge the "nextSolve" data send.
    // Note 2 : replace '0' solveID by 1 and after unshift with new scores.
    if (actualSolveId.value === 1) {
      allSolves.value = [data.solveToDisplay]
    } else {
      allSolves.value.unshift(data.solveToDisplay)
    }

    //Refresh scramble
    scramble.value = data.scramble
    if (drawer.value) {
      drawer.value.alg = scramble.value
    }
    actualSolveId.value = data.solveId
  })

  //When owner change the event
  socket.on("event-updated", (info: { event: string, scramble: string }) => {
    const eventInfo = mapEvent.get(info.event)

    if (eventInfo) {
      puzzle.value = eventInfo.toDisplay
      scramble.value = info.scramble

      allSolves.value = [{ solveId: 0 }]
      actualSolveId.value = 1

      //Maj twisty
      drawer.value!.puzzle = eventInfo.toDrawer as "2x2x2" | "3x3x3" | "4x4x4" | "5x5x5" | "6x6x6" | "pyraminx" | "skewb" | "clock" | "fto" | "square1" | "megaminx" | "7x7x7"
      drawer.value!.alg = scramble.value
    }

  })

  socket.on("session-cleaned", () => {
    allSolves.value = [{ solveId: 0 }]
    actualSolveId.value = 1
  })
})

const sendTime = (time: number,inspectionPenality: string, penalitySelected: string) => {
  socket.emit("save-time", { roomName: roomName.value, time: time, inspectionPenality:inspectionPenality,penalitySelected: penalitySelected, solveId: actualSolveId.value })
  localPlayerState.value = "SCORED"
  scramble.value = 'Attente des autres joueurs...'
}

const leaveRoom = () => {
  socket.emit("leave-room", roomName.value)
  return navigateTo("/home?return=yes")
}

onUnmounted(() => {
  document.body.querySelector('twisty-player')?.remove()
  socket.off("send-all-room-data");
  socket.off("players-updated");
  socket.off("remove-player");
  socket.off("nextSolve");
  socket.off("event-updated");
  socket.off("session-cleaned")

  // drawer.value = undefined
})

</script>
