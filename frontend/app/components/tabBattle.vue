<template>
    <UTable sticky class="max-h-110" :columns="colonnes" :data="props.times"></UTable>
</template>


<script setup lang="ts">
import type { TableColumn, TableRow} from '@nuxt/ui'
import type { Player, PlayerState } from '~/types/player';
import type { Solve } from '~/types/solve';


const props = defineProps<{ players: Player[], times: Solve[], solveId: number, me: Player }>()


const colonnes = computed<TableColumn<Solve>[]>(() => {

    const mainColumns: TableColumn<Solve>[] = [
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
            header: () => (`${player.pseudo} \n ${stateForHuman(player.state)} \n mean: `),
            meta: {
                class: {
                    th: player.id === props.me.id ? "text-primary whitespace-pre-line text-center" : "text-neutral whitespace-pre-line text-center",
                    td: 'border-l border-r min-w-37 ',

                },

            },
            cell: ({ row }) => {
                return h('div',{class:`text-center ${isBestSolveTime(row,player.id) ? 'text-primary' : 'text-gray-100'}`}, () => {
                    if (row.getValue(player.id) !== undefined) {
                        const obj  = row.getValue(player.id) as { time: number, finalPenality: 'DNF' | '+2' | '+4' | 'OK' }
                        const timeForHuman = useTimeForHuman(obj.time);
                        if(obj.finalPenality === 'DNF') {
                            return `DNF(${timeForHuman})` 
                        } else if (obj.finalPenality === '+2') {
                            return `${timeForHuman}+`
                        } else if (obj.finalPenality === '+4') {
                            return `${timeForHuman}++`
                        } else {
                            return timeForHuman
                        }

                    } else {
                        return ''
                    }
                })
            }
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

    const valueToCompare  = row.getValue(id) as {time :number, finalPenality: 'DNF' | '+2' | '+4' | 'OK'};
    const actualRow = row.getAllCells() ;
    if (!valueToCompare || valueToCompare.finalPenality === 'DNF') {
        return false
    }

    let bestTime  : number = 9999999

    for (let i= 1;i<actualRow.length;i++) {
        const currentCellValue = actualRow[i]?.getValue() as {time :number, finalPenality: 'DNF' | '+2' | '+4' | 'OK'};
        if (currentCellValue && currentCellValue.finalPenality !== 'DNF') {
            
            if (currentCellValue.time < bestTime) {
                bestTime = currentCellValue.time
            } 
        }
    }
    return valueToCompare.time === bestTime ? true : false
}


const mean = (playerid: string) => {

    let timeCumul = 0
    let countWithNoDNF = 0

    for (let i = 0; i < props.times.length; i++) {
        const playerSolve: string = props.times[i]![playerid]
        if (playerSolve && !playerSolve.includes('DNF')) {
            countWithNoDNF++;
            timeCumul += (parseFloat(playerSolve.replaceAll('+', '')));
        }
    }
    return timeCumul === 0 ? 'DNF' : (timeCumul / countWithNoDNF).toFixed(2)
}
</script>
