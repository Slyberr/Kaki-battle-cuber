<template>
  <div>
    <NuxtRouteAnnouncer />
    <UPageHero title="Bienvenue sur KBC!"
      description="Kaki-battle-cuber vous permet de créer une room privée instantanément, sans compte ! Affrontez vos amis sur des épreuves officielles, ou non !"
      headline="v0.1">
    <UModal>
      <div class="flex justify-center">
      <UButton class="relative" icon="lucide:plus" @click=""">Créer une nouvelle room</UButton>
    </div>
      <template #content>
        <UForm :schema="schema" :state="state" class="m-8 space-y-4" @submit="createRoom">
          <UFormField label="Nom de la salle" name="roomname">
            <UInput v-model="state.roomname"></UInput>
          </UFormField>
          <UFormField label="Mot de passe" name="password">
            <UInput type="password" v-model="state.password"></UInput>
          </UFormField>
          <UButton type="submit">Accéder à la salle</UButton>
        </UForm>
      </template>

      
    </UModal>

    </UPageHero>

    
  </div>
</template>


<script setup lang="ts">

import * as v from 'valibot'

const schema = v.object({
  roomname: v.pipe(v.string(), v.minLength(4, "Le nom doit au moins dépasser 3 caractères")),
  password: v.pipe(v.string(), v.minLength(4, "le mot de passe doit faire au moins 4 caractères")),
})

const state = ref({
  roomname: "",
  password: ""
})


const createRoom = async() => {
 await $fetch('http://localhost:3001/api/create/room', {
  method : "POST",
  body: {roomname : state.value.roomname, password : state.value.password},
  headers: {
    'Content-Type' :'application/json'
  }
 })
}

</script>
