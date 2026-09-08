<template>

 <UError
    :error="{
      statusCode: props.error.status,
      statusMessage: 'Mauvais algo !',
      message: 'Cette page n\'existe pas.'
    }",
    :clear="{
        label:'Revenir à l\'accueil'
    }"
  >
  
   <template #leading>
      <img src="/kbc.svg" alt="Logo" class="size-10 rounded-full" />
    </template>
  </UError>
</template>


<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>()


</script>