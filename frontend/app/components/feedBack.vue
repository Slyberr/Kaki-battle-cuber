<template>
    <div class="flex flex-col w-full h-full justify-center items-center" @submit="sendMail">
        <UForm  class="flex flex-col  w-full h-[50%]  mx-4 p-8 gap-2 ">
            <UFormField  label="Votre Pseudo (optionnel)">
                <UInput 
                v-model="formData.pseudo" 
                placeholder="Votre pseudo" 
                class="w-full md:w-[40%]" 
                size="xl" 
                maxlength="15" 
                />
            </UFormField>
            
            <UFormField  label="Votre email (optionnel, si vous voulez une réponse)">
                <UInput 
                v-model="formData.mail" 
                placeholder="example@test.fr" 
                class="w-full md:w-[40%]" 
                size="xl"                
                />
            </UFormField>
            <UFormField label="Votre message">
                <UTextarea 
                v-model="formData.text" 
                placeholder="Pas ouf le site faudrait améliorer ce truc ou ce bidule..." 
                class="w-full" 
                :rows="8"  
                size="xl" 
                maxlength="600"
                required>
            </UTextarea>
            <p class="text-muted text-sm my-2">{{ formData.text.length }}/600</p>
            </UFormField>
            <UFormField label="Type de demande">
                <USelect 
                
                v-model="formData.type" 
                class="flex w-full md:w-[30%]" 
                size="xl" 
                :items="items" 
                required></USelect>
            </UFormField>
            <UButton type="submit" class="flex  justify-center text-center w-20 my-4" label="Envoyer"/>
        </UForm>
    </div>



</template>

<script setup lang="ts">


const items = ref(['Bug', 'UI/UX (Design)', 'Nouvelle fonctionnalité'])
const formData = reactive<{pseudo : string,mail: string, text : string,type : string}>({
    pseudo : '',
    mail : '',
    text : '',
    type : 'Bug'
})
useHead({
  title: 'KCB | Feedback' 
});
const toast = useToast();


const sendMail = async() => {
    const [ok,message] = await useSendFeedBack(formData.pseudo,formData.mail,formData.text,formData.type);
    if (ok) {
        toast.add({
            title : 'Retour envoyé !',
            description : message
        })
    } else {
        toast.add({
            title : 'Erreur Serveur.',
            description : message,
            duration: 7000
        })
    }
}
</script>