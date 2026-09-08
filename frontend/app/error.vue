<template>

 <UError
    :error="{
      statusCode: props.error.status,
      statusMessage: props.error.status === 404 ? 'Mauvais algo !' : 'Erreur serveur !',
      message: props.error.status === 404 ? 'Cette page n\'existe pas.' :'Ce n\'est pas de votre faute'
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