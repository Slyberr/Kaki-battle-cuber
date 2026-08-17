<template>
    <UTable  class="w-full":columns="colonnes" :data=" props.times"></UTable>
</template>


<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'


const props = defineProps<{ players: any[],times: any, solveId : number }>()

interface Solve {
    num: number;
    [playerName: string]: any;
}
const currentSolve = ref(1)
const colonnes = computed<TableColumn<Solve>[]>(() => {

    const mainColumns = [
        {
            accessorKey: 'num',
            header: 'n°'
        },
        
    ]
    for (let player of props.players) {
        mainColumns.push({ accessorKey: player.id, header: player.pseudo })
    }
    return mainColumns


})



</script>
