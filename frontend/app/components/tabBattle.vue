<template>
    <UTable sticky class="max-h-110" :columns="colonnes" :data="props.times"></UTable>
</template>


<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
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
                    th: 'text-center border-r',
                    td: 'border-r border-l w-15 text-center',
                   
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
                    th: player.id === props.me.id ? "text-primary whitespace-pre-line text-center" : "text-neutral whitespace-pre-line text-center",
                    td: 'border-l border-r min-w-37 ',
                  
                },      
             
            },
            cell : ({row}) => {return h('div',{class:`text-center ${isBestSolveTime(row,player.id) ? 'text-primary' : 'text-gray-100'}`},() => row.getValue(player.id))}
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

const isBestSolveTime = (row : TableRow<Solve>,id: string) => {
    
    const valueToCompare = row.getValue(id) as string
    const actualRow = row.getAllCells();
    if (!valueToCompare || valueToCompare.includes('DNF')) {
        return false
    }
    const noPlusValueToCompare = parseFloat(valueToCompare.replaceAll('+',''))

    let bestTime  : number = 9999999

    for (let i= 1;i<actualRow.length;i++) {
        const currentCellValue = actualRow[i]?.getValue() as string
        if (currentCellValue && !currentCellValue.includes('DNF')) {
            const noPluscurrent = parseFloat(currentCellValue.replaceAll('+',''))
            
            if (noPluscurrent < bestTime) {
                bestTime = noPluscurrent
            } 
        }
    }
    return noPlusValueToCompare === bestTime ? true : false
}
</script>
