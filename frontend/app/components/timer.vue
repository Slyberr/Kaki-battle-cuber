<template>
  <div class="timer w-full flex justify-center min-h-42">
    <div class="flex flex-col items-center gap-3 ">
      <div class="text-4xl transition ease-linear duration-75" :class=timer.color>{{ timer.timeDisplayed }}</div>
      <template v-if="timer.state === 'CONFIRM'">
        <URadioGroup v-model:model-value="penalitySelected" :items="radioSolvePenalities"
          :disabled="inspectionPenality === 'DO_NOT_SOLVE'" variant="card" indicator="hidden" orientation="horizontal"
          :ui="{ container: 'max-h-2' }">
        </URadioGroup>
        <UButton class="my-2" @click="saveTime" :loading="waitOtherPlayer" :label="buttonLabel"></UButton>

      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>

import type { RadioGroupItem } from '@nuxt/ui';

const props = defineProps<{ playerState: "READY" | "RUNNING" | "SCORE", readyHoldingTime: number, activeInspection: boolean }>()

const timer = reactive<{ timeDisplayed: string, state: "NOT_READY" | "INSPECTION" | "READY" | "RUNNING" | "CONFIRM", realTime: number, color: string }>({
  timeDisplayed: "0.00",
  realTime: 0.00,
  state: "NOT_READY",
  color: "text-gray-50"
})

const radioSolvePenalities = ref<RadioGroupItem[]>([
  {
    label: 'OK',
    value: 'OK',
  },
  {
    label: '+2',
    value: 'ALIGN_PENAL',
  },
  {
    label: 'DNF',
    value: 'DO_NOT_SOLVE'
  }
])
const penalitySelected = ref<'OK' | 'ALIGN_PENAL' | 'DO_NOT_SOLVE' >('OK');

const timerIntervalId = ref<NodeJS.Timeout>()
const inspectionId = ref<NodeJS.Timeout>()
const inspectionPenality = ref<"DO_NOT_SOLVE" | "15_17" | "NOTHING">("NOTHING");
const holdingSpaceId = ref<NodeJS.Timeout>()

const inspectionValue = ref<number>(15)

const waitOtherPlayer = ref<boolean>(false)
const buttonLabel = ref<string>("Confirmer")

const emits = defineEmits(["time-ok", "player-running"])

onMounted(() => {


  window.addEventListener('keydown', (event: KeyboardEvent) => {

    if (event.code === 'Space') {
      //Prevent the scroll
      event.preventDefault()
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
          //Save the score.
          timer.realTime = parseFloat(timer.timeDisplayed);
          if (inspectionPenality.value === "15_17") {
            timer.realTime += 2;
            timer.timeDisplayed = (timer.realTime).toFixed(2).concat('+');
          }
          if (inspectionPenality.value === 'DO_NOT_SOLVE') {
            penalitySelected.value = 'DO_NOT_SOLVE';
            timer.timeDisplayed = '('.concat(timer.realTime.toFixed(2), ')', ' DNF')
          }
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
          }

          emits("player-running")
          //Show timer with 0.01 precision.
          const beginTime = Date.now()
          timerIntervalId.value = setInterval(() => {
            timer.timeDisplayed = useTimeForHuman(beginTime)
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
  waitOtherPlayer.value = true;
  buttonLabel.value = 'En attente des autres joueurs';
  inspectionPenality.value = "NOTHING";
  inspectionValue.value = 15;
  penalitySelected.value = 'OK';

  emits('time-ok', timer.timeDisplayed)
}

/**
 * code to create Inspection with penalities (+2 and DNF).
 */
const beginInspection = () => {
  timer.state = "INSPECTION";
  timer.timeDisplayed = inspectionValue.value.toString()
  inspectionId.value = setInterval(() => {
    if (inspectionValue.value > 0) {
      inspectionValue.value--;
      timer.timeDisplayed = inspectionValue.value.toString()
    } else if (inspectionValue.value <= 0 && inspectionValue.value > -2) {
      inspectionValue.value--;

      timer.timeDisplayed = "+2";
      inspectionPenality.value = "15_17";
    } else {
      
      timer.timeDisplayed = "DNF";
      inspectionPenality.value = "DO_NOT_SOLVE";
      
      clearInterval(inspectionId.value);
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
    timer.timeDisplayed = '0.00'
    timer.state = 'NOT_READY'
    waitOtherPlayer.value = false
    buttonLabel.value = "Confirmer"
  }
})

watch(() => penalitySelected.value, (newVal) => {

  //If DNF at Inspection : No button enabled (DNF value is selected).
  if (inspectionPenality.value !== 'DO_NOT_SOLVE') {
    if (newVal === 'ALIGN_PENAL') {
      timer.timeDisplayed = inspectionPenality.value === '15_17' ? (timer.realTime + 2).toFixed(2).concat('++') : (timer.realTime + 2).toFixed(2).concat('+')
    }
    if (newVal === 'DO_NOT_SOLVE') {
      timer.timeDisplayed = '('.concat(timer.realTime.toFixed(2), ')', ' DNF')
    }

    if (newVal === 'OK') {
      timer.timeDisplayed = inspectionPenality.value === '15_17' ?  timer.realTime.toFixed(2).concat('+') : timer.realTime.toFixed(2)
    }
  } 

})
</script>
