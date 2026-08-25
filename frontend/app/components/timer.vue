<template>
  <div class="timer w-full flex justify-center min-h-25">
    <div class="flex flex-col items-center">
      <div class="text-4xl transition ease-linear duration-75" :class=timer.color>{{ timer.time }}</div>
      <div v-if="timer.state === 'CONFIRM'">
        <UButton class="my-2" @click="saveTime" :loading="waitOtherPlayer" :label="buttonLabel"></UButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ playerState: "READY" | "RUNNING" | "SCORE", readyHoldingTime: number, activeInspection: boolean }>()

const timer = reactive<{ time: string, state: "NOT_READY" | "INSPECTION" | "READY" | "RUNNING" | "CONFIRM", color: string }>({
  time: "0.00",
  state: "NOT_READY",
  color: "text-gray-50"
})


const timerIntervalId = ref<NodeJS.Timeout>()
const inspectionId = ref<NodeJS.Timeout>()
const holdingSpaceId = ref<NodeJS.Timeout>()

let inspectionValue: number = 15

const timeNeededToReady = ref<number>()

const waitOtherPlayer = ref<boolean>(false)
const buttonLabel = ref<string>("Confirmer")

const emits = defineEmits(["time-ok", "player-running"])

onMounted(() => {


  window.addEventListener('keydown', (event: KeyboardEvent) => {


    if (event.code === 'Space') {
      switch (timer.state) {
        case "INSPECTION" :
          timer.color = "text-red-400" 
          timerGo()          

        break;

        //Basic state : the timer is not fired
        case "NOT_READY":
          

          //case if browser retrigger the event after holding space bar too long
          if (event.repeat) {
            return;
          }

          if (props.activeInspection) {
            timer.state = "INSPECTION"
            timer.time = inspectionValue.toString()
            inspectionId.value = setInterval(() => {
              inspectionValue--
              timer.time = inspectionValue.toString()
              if (inspectionValue <= 0) {
                timer.time = "+2"
              } 
              if (inspectionValue <= -2) {
                timer.time = "DNF"
                inspectionValue = 15
                clearInterval(inspectionId.value)
                timer.state = "NOT_READY"
              }
              
            }, 1000)
            
          } else {
            timer.color = "text-red-400"
            timerGo()
          }


          break;

        case "READY":
          break;

        //When timer is stopped
        case "RUNNING":
          clearInterval(timerIntervalId.value);
          timer.state = "CONFIRM"
          break;

        case "CONFIRM":
          break;
      }


    }


  })

  window.addEventListener('keyup', (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      switch (timer.state) {

        case "NOT_READY":
        case "INSPECTION" :
          timer.color = "text-gray-50"
          clearInterval(holdingSpaceId.value)
          break

        case "READY":
          //
          timer.color = "text-gray-50"
          timer.state = 'RUNNING'
          clearInterval(inspectionId.value)
          inspectionValue = 15
          emits("player-running")
          const beginTime = Date.now()
          timerIntervalId.value = setInterval(() => {
            timer.time = useTimeForHuman(beginTime)
          }, 10)

          break

        case "RUNNING":
          break
        case "CONFIRM":
          break
      }

    }
  })

})

const saveTime = () => {
  waitOtherPlayer.value = true
  buttonLabel.value = 'En attente des autres joueurs'
  emits('time-ok', timer.time)
}

/**
 * the solve begin
 */
const timerGo = () => {
  //If not keyUp triggered who kill this interval == holding the key
  
  holdingSpaceId.value = setTimeout(() => {
    timer.color = "text-emerald-400"
    timer.state = "READY"
  }, props.readyHoldingTime * 1000)
}


watch(() => props.playerState, async (newState, oldState) => {
  if (oldState !== newState && newState == 'READY') {
    timer.time = '0.00'
    timer.state = 'NOT_READY'
    waitOtherPlayer.value = false
    buttonLabel.value = "Confirmer"
  }
})

</script>
