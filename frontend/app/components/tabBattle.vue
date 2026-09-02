<template>
    <UTable sticky class="w-full h-[min(400px,30dvh)]" :columns="colonnes" :data="props.times"></UTable>
</template>


<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Player, PlayerState } from '~/types/player';
import type { Solve } from '~/types/solve';


const props = defineProps<{ players: Player[], times: Solve[], solveId: number, me : Player }>()


const colonnes = computed<TableColumn<Solve>[]>(() => {

    const mainColumns : TableColumn<Solve>[] = [
        {
            accessorKey: 'solveId',
            header: 'n°',
            meta: {
                class: {
                    td: 'w-10',
                }
            },
            
        },

    ]
    for (let player of props.players) {
        mainColumns.push({
            accessorKey: player.id, 
            header:  () => (`${player.pseudo} \n ${stateForHuman(player.state)}`),
            meta: {
                class: {
                    td: 'border-l min-w-37',
                    th: player.id === props.me.id ? "text-primary whitespace-pre-line" : "text-neutral whitespace-pre-line"
                },       
            },
        })
    }
    return mainColumns
})

const stateForHuman = (state: PlayerState) => {

    switch (state) {
        case 'READY':
            return ' (prêt)'
        case 'INSPECTING':
            return ' (inspection...)'
        case 'SOLVING':
            return ' (résolution...)'
        case 'CONFIRMATION':
            return ' (confirmation...)'
        case 'SCORED':
            return ' (fini !)'
    }
}
</script>
