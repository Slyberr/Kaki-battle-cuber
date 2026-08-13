<template>
    {{ props.players }}
    <UTable :columns="colonnes" :data="donnees"></UTable>
</template>


<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'


const props = defineProps<{ players: any[] }>()

interface Solve {
    num: number;
    test: number;
    [playerName: string]: any;
}

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

const solves = ref([
    {
        'n°': 1,
        'joueur1': '15.10',
        'joueur2': '15.00+',
        'joueur3': 'DNF(9.99)'
    },


])


</script>
