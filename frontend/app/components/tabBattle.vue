<template>
    <UTable sticky class="w-full h-[min(400px,30dvh)]":columns="colonnes" :data=" props.times"></UTable>
</template>


<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Solve } from '~/types/solve';


const props = defineProps<{ players: any[],times: any, solveId : number }>()


const colonnes = computed<TableColumn<Solve>[]>(() => {

    const mainColumns = [
        {
            accessorKey: 'solveId',
            header: 'n°'
        },
        
    ]
    for (let player of props.players) {
        mainColumns.push({ accessorKey: player.id, header: player.pseudo })
    }
    return mainColumns

})



</script>
