<template>
    <div>Status Bar</div>
</template>


<script lang="ts">
import { useMatch } from '@/plugins/match';
import MatchPlugin from '@/plugins/match/types/match-plugin.interface';
import { computed, defineComponent, inject } from 'vue'

export default defineComponent({
    name: "StatusBar",

    setup() {
        const match = useMatch();
    },
})
</script>
