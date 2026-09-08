<template>
    <div class="flex w-full h-full justify-center items-center my-8" @submit="">
        <UForm class="flex flex-col gap-y-10 w-[40%] h-[50%]">
            <UFormField  label="Votre mail">
                <UInput class="w-full" size="xl" type="email" />
            </UFormField>
            <UFormField label="Texte explicatif">
                <UTextarea class="w-full" :rows="12" v-model="formData.text" size="xl"></UTextarea>
            </UFormField>
            <UFormField>
                <USelect class="flex w-full" size="xl" :items="items"></USelect>
            </UFormField>
            <UButton type="submit" class="flex w-[40%]" label="Envoyer"/>
        </UForm>
    </div>



</template>

<script setup lang="ts">


const items = ref(['Bug', 'UI/UX', 'Nouvelle fonctionnalité'])
const formData = reactive<{mail : string, text : string,type : string}>({
    mail : '',
    text : '',
    type : ''
})




</script>