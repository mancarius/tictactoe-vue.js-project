<template>
    <button :class="classes">
        <slot></slot>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: "MyButton",
    props: {
        primary: Boolean,
        secondary: Boolean,
        fullWidth: Boolean,
    },
    data(){
        return {
            classes: {
                'bg-primary': this.primary,
                'bg-secondary': this.secondary,
                'full-width': this.fullWidth
            }
        }
    }
})
</script>

<style lang="scss" scoped>
    .full-width {
        width: 100%;
    }
</style>
