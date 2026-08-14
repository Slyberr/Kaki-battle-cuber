<template>
  <div class="timer w-full flex justify-center ">
    <div class="flex flex-col items-center">
      <div class="text-4xl">{{ timerValue }}</div>
      <div v-if="localTimerState === 'CONFIRM'">
        <UButton class="my-2" @click="saveTime" :loading="waitOtherPlayer" :label="buttonLabel"></UButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ playerState: "READY" | "RUNNING" | "SCORE" }>()
const timerValue = ref("0.00")
const localTimerState = ref<"READY" | "RUNNING" | "CONFIRM">("READY")
const timerId = ref()

const waitOtherPlayer = ref<boolean>(false)
const buttonLabel = ref<string>("Confirmer")

const emits = defineEmits(["time-ok","player-running"])

onMounted(() => {
  window.addEventListener('keyup', (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      switch (localTimerState.value) {
        case "READY":
          localTimerState.value = 'RUNNING'
          emits("player-running")
          const beginTime = Date.now()
          timerId.value = setInterval(() => {
            const currentTime = Date.now()
            const timeForHuman = (currentTime - beginTime) / 1000
            const min = Math.floor(timeForHuman / 60)

            timerValue.value =
              min == 0
                ? timeForHuman.toFixed(2)
                //1min 8sec 20 : 1:08.20 
                : min + ":" + (timeForHuman - (60 * min) < 10
                  ? '0' + (timeForHuman - (60 * min)).toFixed(2)
                  : (timeForHuman - (60 * min)).toFixed(2))
          }, 10)

          break

        case "RUNNING":
          break
        case "CONFIRM":
          break
      }

    }
  })
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.code === 'Space' && localTimerState.value === 'RUNNING') {
      clearInterval(timerId.value)
      localTimerState.value = 'CONFIRM'
    }


  })
})

const saveTime = () => {
  waitOtherPlayer.value = true
  buttonLabel.value = 'En attente des autres joueurs'
  emits('time-ok', timerValue.value)

}
watch(() => props.playerState, async(newState,oldState) => {
  if (oldState !== newState && newState == 'READY') {
    localTimerState.value = 'READY'
    waitOtherPlayer.value = false
    buttonLabel.value = "Confirmer"
  }
})

</script>
