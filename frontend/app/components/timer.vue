<template>
  <div class="timer w-full flex justify-center ">
    <div class="flex flex-col items-center">
    <div class="text-4xl">{{ timerValue }}</div>
    <div v-if="timerState === 'SCORE'">
      <UButton class="my-2" @click="sendTime()">Valider le temps</UButton>
    </div>
    </div>
  </div>
</template>
 
<script lang="ts" setup>
const timerValue = ref("0.00")
const timerId = ref()
const timerState = ref<"READY" | "RUNNING" | "SCORE">("READY")
onMounted(() => {
  window.addEventListener('keyup', (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      switch (timerState.value) {
        case "READY":
          const beginTime = Date.now()
          timerState.value = "RUNNING"
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
        case "SCORE": 
          break
      }

    }
  })
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.code === 'Space' && timerState.value === "RUNNING") {
      clearInterval(timerId.value)
      timerState.value = "SCORE"
    }


  })
})

const sendTime = () => {
  timerState.value = 'READY'
  timerValue.value = '0.00'
}

</script>
