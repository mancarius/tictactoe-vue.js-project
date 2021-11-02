<template>
    <header>
        <title-vue/>
    </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleVue from '@/components/Title.vue';

export default defineComponent({
    name: "PageHeader",
    components: {TitleVue},
})
</script>
