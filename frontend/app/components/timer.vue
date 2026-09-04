<template>
  <div class='timer w-full flex justify-center min-h-42'>
    <div v-if="inputMode === 'KEYBOARD'" class='flex flex-col items-center gap-3'>

      <div class='text-4xl transition ease-linear' :class=timer.color>{{ timer.timeDisplayed }}</div>
      <template v-if="timer.state === 'CONFIRM' || timer.state === 'WAITING_OTHER'">
        <URadioGroup v-model:model-value='penalitySelected' :items='radioSolvePenalities'
          :disabled="inspectionPenality === 'DNF' || timer.state === 'WAITING_OTHER'" variant='card'
          indicator='hidden' orientation='horizontal' :ui="{ container: 'max-h-2' }">
        </URadioGroup>
        <UButton class='my-2' :loading="timer.state === 'WAITING_OTHER'" :label='buttonLabel' @click='saveTime'>
        </UButton>
      </template>
    </div>
    <div class="flex flex-col w-[25%]" v-if="inputMode === 'MANUALLY'">
      <template v-if="activeInspection && (timer.state === 'BEGIN_STATE' || timer.state === 'INSPECTION')">

        <div class='text-4xl transition ease-linear duration-75 text-center' :class=timer.color>
          {{ timer.timeDisplayed }}</div>
        <template v-if="timer.state === 'INSPECTION'">
          <p class='text-sm text-center m-4'>(Appuyez sur Espace pour terminer l'inspection)</p>
        </template>

      </template>
      <template v-else>
        <UInput v-model:model-value='manualTime.input' placeholder="Only Digit or 'DNF'." class='w-full' color='primary'
          maxlength='6' :disabled='manualTime.disabled'>
        </UInput>
        <p>{{ 'Votre temps est : ' + isTimeFormatOk(manualTime.input)[1] }}</p>

      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>

import type { RadioGroupItem } from '@nuxt/ui';
import type { PlayerState } from '~/types/player';
import type { Penality } from '~/types/solve';

const props = defineProps<{
  localPlayerState: PlayerState,
  readyHoldingTime: number,
  activeInspection: boolean,
  inputMode: 'KEYBOARD' | 'MANUALLY',
  audios: string[],
}>();

const timer = reactive<{
  realTime: number,
  timeFormated : string,
  timeDisplayed: string,
  state: 'BEGIN_STATE' | 'INSPECTION' | 'READY_TO-SOLVE' | 'RUNNING' | 'CONFIRM' | 'WAITING_OTHER',
  color: string
}>
  ({
    timeDisplayed: '0.00',
    timeFormated : '0.00',
    realTime: 0.00,
    state: 'BEGIN_STATE',
    color: 'text-gray-50'
  });

const manualTime = reactive<{ input: string, disabled: boolean }>({
  input: '',
  disabled: false
});

const radioSolvePenalities = ref<RadioGroupItem[]>([
  {
    label: 'OK',
    value: 'NONE',
  },
  {
    label: '+2',
    value: 'PLUS_2',
  },
  {
    label: 'DNF',
    value: 'DNF'
  }
]);

const timerIntervalId = ref<NodeJS.Timeout>();
const holdingSpaceId = ref<NodeJS.Timeout>();
const inspectionId = ref<NodeJS.Timeout>();

const penalitySelected = ref<Penality>('NONE');
const buttonLabel = ref<string>('Confirmer');

const inspectionValue = ref<number>(15)
const inspectionPenality = ref<Penality>('NONE');

const emits = defineEmits(['player-changeState', 'time-sended']);

onMounted(() => {
  window.addEventListener('keydown', keyDownSpaceManager);
  window.addEventListener('keyup', keyUpSpaceManager);
  window.addEventListener('keydown', onKeyDownEnter);
});



//UTILS don't want to make a utils/UseKeyXSpaceManager beacause lot of variables to send.

const keyUpSpaceManager = (event: KeyboardEvent) => {

  if (event.code === 'Space') {
    if (props.inputMode === 'KEYBOARD') {
      switch (timer.state) {
        case 'BEGIN_STATE':
          //not depending to holding time value.
          if (props.activeInspection) {
            beginInspection();
          } else {
            //press bar not pressed enough (when inspection disactivated)
            timer.color = 'text-gray-50';
            clearInterval(holdingSpaceId.value);
          }

          break;
        case 'INSPECTION':
          //press bar not pressed enough (when inspection activated)
          if (props.activeInspection) {
            timer.color = 'text-gray-50';
            clearInterval(holdingSpaceId.value);
          }

          break;
        //When user pressed space bar enough to start the timer.
        case 'READY_TO-SOLVE':
          timer.color = 'text-gray-50';
          timer.state = 'RUNNING';
          emits('player-changeState', 'SOLVING');
          if (props.activeInspection) {
            clearInterval(inspectionId.value);
          }

          //Show timer with 0.01 precision.
          const beginTime = Date.now();
          timerIntervalId.value = setInterval(() => {
            const timeNow = Date.now();
            timer.realTime = timeNow - beginTime;
            timer.timeDisplayed = useTimeForHuman(timer.realTime);
          }, 10);

          break;
        case 'RUNNING':
        case 'CONFIRM':
          break
      }
    }

    if (props.inputMode === 'MANUALLY') {
      switch (timer.state) {
        case 'BEGIN_STATE':
          if (props.activeInspection) {
            beginInspection();
          }
          break;
        //For fast event: the user can space one more time to skip the all inspection.
        case 'INSPECTION':
          if (props.activeInspection) {
            clearInterval(inspectionId.value);
            timer.state = 'CONFIRM';
            emits('player-changeState', 'CONFIRMATION');
          }
          break;
      }
    }
  }
}

const keyDownSpaceManager = (event: KeyboardEvent) => {

  if (event.code === 'Space') {

    //Disabled the timer fonction on input tag
    if ((event.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    event.preventDefault();

    //not refired the key if is too long press
    if (event.repeat) {
      return;
    }

    //KeyBoard mode 
    if (props.inputMode === 'KEYBOARD') {

      switch (timer.state) {
        case 'BEGIN_STATE':
          if (!props.activeInspection) {
            timer.color = 'text-red-400';
            timerHoldingBeforeGo();
          }
          break;
        case 'INSPECTION':
          if (props.activeInspection) {
            timer.color = 'text-red-400';
            timerHoldingBeforeGo();
            break;
          }
        case 'READY_TO-SOLVE':
        case 'CONFIRM':
          break;
      }
    }
  }

  //TIMER CAN BE STOPPED BY ANY KEY !
  if (timer.state === 'RUNNING' && props.inputMode === 'KEYBOARD') {

    clearInterval(timerIntervalId.value);
    //Save a initial 'toHuman' state before modifie timeDisplayed with the penalities.
    timer.timeFormated = timer.timeDisplayed;
    if (inspectionPenality.value === 'PLUS_2') {
      //ms
      timer.realTime += 2000;
      timer.timeFormated = (parseFloat(timer.timeFormated)+2).toFixed(2);
      timer.timeDisplayed = timer.timeFormated.concat('+');
    }
    if (inspectionPenality.value === 'DNF') {
      penalitySelected.value = 'DNF';
      timer.timeDisplayed = '('.concat(timer.timeFormated, ')', ' DNF');
    }
    timer.state = 'CONFIRM';
    emits('player-changeState', 'CONFIRMATION');

  }

}

const onKeyDownEnter = (event: KeyboardEvent) => {
  if (event.code === 'Enter'
    && ((props.inputMode === 'KEYBOARD' && timer.state === 'CONFIRM')
      || (props.inputMode === 'MANUALLY' && props.activeInspection && timer.state === 'CONFIRM')
      || (props.inputMode === 'MANUALLY' && !props.activeInspection && timer.state === 'BEGIN_STATE')
    )
  ) {
    saveTime();
  }
}

/**
 * code to create Inspection with penalities (+2 and DNF) or not if manual.
 */
const beginInspection = () => {

  timer.state = 'INSPECTION';
  emits('player-changeState', 'INSPECTING');
  timer.timeDisplayed = inspectionValue.value.toString();

  if (props.inputMode === 'KEYBOARD') {
    inspectionId.value = setInterval(async () => {
      if (inspectionValue.value > 0) {
        inspectionValue.value--;
        timer.timeDisplayed = inspectionValue.value.toString();

        if (inspectionValue.value === 7 && props.audios.length === 4) {
          await playAudioInspection(props.audios[2]!);
        }

        if (inspectionValue.value === 3 && props.audios.length === 4) {
          await playAudioInspection(props.audios[3]!);
        }

      } else if (inspectionValue.value <= 0 && inspectionValue.value > -2) {
        inspectionValue.value--;
        timer.timeDisplayed = '+2';
        inspectionPenality.value = 'PLUS_2';
      } else {
        timer.timeDisplayed = 'DNF';
        inspectionPenality.value = 'DNF';
        clearInterval(inspectionId.value);
      }

    }, 1000)
  }
  if (props.inputMode === 'MANUALLY') {
    timer.timeDisplayed = inspectionValue.value.toString();
    inspectionId.value = setInterval(() => {
      if (inspectionValue.value > 0) {
        inspectionValue.value--;
        timer.timeDisplayed = inspectionValue.value.toString();
      } else {
        clearInterval(inspectionId.value);
        timer.state = 'CONFIRM';
      }
    }, 1000);
  }
}

const saveTime = () => {

  if (props.inputMode === 'KEYBOARD') {
    buttonLabel.value = 'En attente des autres joueurs';
    timer.state = 'WAITING_OTHER';
    
    inspectionValue.value = 15;
    if (penalitySelected.value === 'PLUS_2') {
      timer.realTime += 2000;
    }
    
    //save timestamp -> treatement for human in cells.
    emits('time-sended', timer.realTime,inspectionPenality.value,penalitySelected.value);
    inspectionPenality.value = 'NONE';

  }

  if (props.inputMode === 'MANUALLY') {
    const [isOk, timeFormated] = isTimeFormatOk(manualTime.input);
    let [min,sec,ms] : string = '';
    let array  : string[] =  manualTime.input.split(':');
    //If time is > 1 min
    if (array.length > 1) {
      let secondItem = array[1];

    } else {
      min = array[0];
      sec = array[1]
    }

    if (isOk) {
      timer.state = 'WAITING_OTHER';
      inspectionPenality.value = 'NONE';
      inspectionValue.value = 15;
      manualTime.input = '';
      manualTime.disabled = true;
      emits('time-sended', timeFormated);
    } else {
      const toast = useToast();
      toast.add({
        title: 'Temps non envoyé',
        description: "N'entrez que des chiffres ou 'DNF'. Quelques exemples :  012 -> 0.12 ou 41012 -> 4:10.12.",
        duration: 5000
      });
    }
  }
}

/**
 * if the keyup is triggered before x second, do nothing. Else, the timer will start.
 */
const timerHoldingBeforeGo = () => {

  holdingSpaceId.value = setTimeout(() => {
    timer.color = 'text-emerald-400';
    timer.state = 'READY_TO-SOLVE';
  }, props.readyHoldingTime * 1000);
}

//Triggered when all player submit the time on server.
watch(() => props.localPlayerState, async (newState, oldState) => {
  if (oldState !== newState && newState == 'READY') {
    timer.timeDisplayed = '0.00';
    timer.state = 'BEGIN_STATE';
    penalitySelected.value = 'NONE';
    buttonLabel.value = 'Confirmer';
    manualTime.disabled = false;
  }
});

watch(() => penalitySelected.value, async (newVal) => {
  //If DNF at Inspection : No button enabled (DNF value is selected).
  if (inspectionPenality.value !== 'DNF') {
    if (newVal === 'PLUS_2' && timer.state === 'CONFIRM') {
      timer.timeDisplayed = inspectionPenality.value === 'PLUS_2' 
      ? (parseFloat(timer.timeFormated)+2).toFixed(2).concat('++') 
      : (parseFloat(timer.timeFormated)+2).toFixed(2).concat('+')
    }
    if (newVal === 'DNF' && timer.state === 'CONFIRM') {
      timer.timeDisplayed = '('.concat(timer.timeFormated, ')', ' DNF');
    }

    if (newVal === 'NONE' && timer.state === 'CONFIRM') {
      timer.timeDisplayed = inspectionPenality.value === 'PLUS_2' 
      ? timer.timeFormated.concat('+') 
      : timer.timeFormated;
    }
  }

});


onUnmounted(() => {
  window.removeEventListener('keyup', keyUpSpaceManager);
  window.removeEventListener('keydown', keyDownSpaceManager);
  window.removeEventListener('keydown', onKeyDownEnter);
});

</script>
