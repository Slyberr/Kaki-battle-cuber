<template>
    {{ props.players }}
<UTable :data="data"></UTable>
</template>


<script setup lang="ts">
const props = defineProps<{players : any}>()
const data = ref([
    {
        'n°'  : 1,
        'joueur1' : '15.10',
        'joueur2' : '15.00+',
        'joueur3' : 'DNF(9.99)'
    },
  
    
])


</script>



