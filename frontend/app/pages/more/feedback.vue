<template>
    <div class="flex flex-col w-full h-full justify-center items-center my-8" @submit="">
        <p class="text-2xl p-4 text-muted"> Faire un retour pour améliorer le site :)</p>
        <UForm  class="flex flex-col gap-y-10 w-[60%] h-[50%] p-8 border-2 border-muted rounded-2xl">
            <UFormField  label="Votre mail">
                <UInput placeholder="example@issue.fr" class="w-full md:w-[40%]" size="xl" type="email" />
            </UFormField>
            <UFormField label="Texte explicatif">
                <UTextarea placeholder="Pas ouf le site faudrait améliorer ce truc ou ce bidule..." class="w-full" :rows="12" v-model="formData.text" size="xl"></UTextarea>
            </UFormField>
            <UFormField>
                <USelect v-model="formData.type" class="flex w-full md:w-[30%] " size="xl" :items="items"></USelect>
            </UFormField>
            <UButton type="submit" class="flex  justify-center text-center w-20" label="Envoyer"/>
        </UForm>
    </div>



</template>

<script setup lang="ts">


const items = ref(['Bug', 'UI/UX', 'Nouvelle fonctionnalité'])
const formData = reactive<{mail : string, text : string,type : string}>({
    mail : '',
    text : '',
    type : 'Bug'
})




</script>