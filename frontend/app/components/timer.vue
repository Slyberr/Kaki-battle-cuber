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

const waitOtherPlayer = ref<boolean>(false)
const buttonLabel = ref<string>("Confirmer")

const emits = defineEmits(["time-ok", "player-running"])

onMounted(() => {


  window.addEventListener('keydown', (event: KeyboardEvent) => {


    if (event.code === 'Space') {
      //not refired the key if is too long press
      if (event.repeat) {
        return;
      }
      switch (timer.state) {

        //Do something on keydown only if inspection is disactived.
        case "NOT_READY":

          if (!props.activeInspection) {
            timer.color = "text-red-400"
            timerHoldingBeforeGo()
          }

          break;

        //catched only if beginInspection() called (on NOT_READY keyup). Do the same thing like "NOT-READY" ^
        case "INSPECTION":

          if (props.activeInspection) {
            timer.color = "text-red-400"
            timerHoldingBeforeGo()
          }

          break;

        //When timer is stopped (keydown).
        case "RUNNING":
          clearInterval(timerIntervalId.value);
          timer.state = "CONFIRM"
          break;

        //This case should never be catch because when Ready on Keyup, the state READY instantly change into INSPECTION
        case "READY":

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

          //not depending to holding time value.
          if (props.activeInspection) {
            beginInspection()
          } else {
            //press bar not pressed enough (when inspection disactivated)
            timer.color = "text-gray-50"
            clearInterval(holdingSpaceId.value)
          }

          break;
        case "INSPECTION":

          //press bar not pressed enough (when inspection activated)
          if (props.activeInspection) {
            timer.color = "text-gray-50"
            clearInterval(holdingSpaceId.value)
          }
         
          break;

        //When user pressed space bar enough to start the timer.
        case "READY":

          timer.color = "text-gray-50"
          timer.state = 'RUNNING'
          if (props.activeInspection) {
            clearInterval(inspectionId.value)
            inspectionValue = 15
          }

          emits("player-running")
          //Show timer with 0.01 precision.
          const beginTime = Date.now()
          timerIntervalId.value = setInterval(() => {
            timer.time = useTimeForHuman(beginTime)
          }, 10)

          break;

        //This case should never be catch because when RUNNING on keydown the state RUNNING instantly change into "CONFIRM"
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
 * code to create Inspection with penalities (+2 and DNF).
 */
const beginInspection = () => {
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
}

/**
 * if the keyup is triggered before x second, do nothing. Else, the timer will start.
 */
const timerHoldingBeforeGo = () => {

  holdingSpaceId.value = setTimeout(() => {
    timer.color = "text-emerald-400"
    timer.state = "READY"
  }, props.readyHoldingTime * 1000)
}

//Triggered when all player submit the time on server.
watch(() => props.playerState, async (newState, oldState) => {
  if (oldState !== newState && newState == 'READY') {
    timer.time = '0.00'
    timer.state = 'NOT_READY'
    waitOtherPlayer.value = false
    buttonLabel.value = "Confirmer"
  }
})

</script>
