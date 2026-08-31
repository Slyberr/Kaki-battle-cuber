<template>
    <UTable sticky class="w-full h-[min(400px,30dvh)]" :columns="colonnes" :data="props.times"></UTable>
</template>


<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Player, PlayerState } from '~/types/player';
import type { Solve } from '~/types/solve';


const props = defineProps<{ players: Player[], times: Solve[], solveId: number }>()


const colonnes = computed<TableColumn<Solve>[]>(() => {

    const mainColumns = [
        {
            accessorKey: 'solveId',
            header: 'n°'
        },

    ]
    for (let player of props.players) {
        mainColumns.push({ accessorKey: player.id , header: player.pseudo + stateForHuman(player.state)  })
    }
    return mainColumns

})

const stateForHuman = (state : PlayerState) => {

    switch  (state){
        case 'READY' :
            return ' (prêt)'
        case 'INSPECTING' :
            return ' (inspection...)'
        case 'SOLVING' :
            return ' (résolution...)'
        case 'CONFIRMATION' :
            return ' (confirmation...)'
        case 'SCORED' :
            return ' (fini !)' 

    }
}



</script>
