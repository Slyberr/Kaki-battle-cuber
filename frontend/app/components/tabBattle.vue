<template>
    {{ props.players }}
    <UTable :columns="colonnes" :data="donnees"></UTable>
    <UButton @click="fakeTime()">Generate fake time</UButton>
</template>


<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'


const props = defineProps<{ players: any[] }>()

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

const fakeTime = () => {
    currentSolve.value++
    const solve : Solve = {
        num : currentSolve.value,
        test : 12.30
    }
     for (let player of props.players) {
        const rand = Math.random() * 100
        solve[player.id] = rand
    }
    donnees.value.push(solve)
}


</script>
