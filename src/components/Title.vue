<template>
    <h1>{{title}}</h1>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: "Title",
    data: () => ({
        title: 'Tic Tc Toe'
    }),
})
</script>

<style lang="scss" scoped>
    h1 {
        font-family: 'Rancho', 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        font-size: 2.625rem;
    }
</style>