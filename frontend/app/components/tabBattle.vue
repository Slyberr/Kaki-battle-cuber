<template>
    <UTable :columns="colonnes" :data="donnees"></UTable>
</template>


<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'


const props = defineProps<{ players: any[], solveId : number }>()

interface Solve {
    num: number;
    test: number;
    [playerName: string]: any;
}
const currentSolve = ref(1)
const colonnes = computed<TableColumn<Solve>[]>(() => {

    const mainColumns = [
        {
            accessorKey: 'num',
            header: 'n°'
        },
        {
            accessorKey: 'test',
            header: "headerTest"
        }
    ]
    for (let player of props.players) {
        mainColumns.push({ accessorKey: player.id, header: player.pseudo })
    }
    return mainColumns


})

const donnees = ref<Solve[]>([
    { num: 1, test: 12.22 },
])

</script>
