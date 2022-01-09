<template>
    <div :class="cardClasses">
        <header :class="titleClasses">
            <slot name="title"></slot>
        </header>
        <div class="body">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name:"BaseCard",
    props: {
        centerTitle: Boolean,
        primary: Boolean,
        secondary: Boolean
    },
    data() {
        return {
            cardClasses: [
                { 'bg-primary': this.primary },
                { 'bg-secondary': this.secondary },
                { 'bg-default': !this.primary && !this.secondary},
                { card: true }
            ],
            titleClasses: {
                center: this.centerTitle
            }
        };
    },
})
</script>

<style lang="scss" scoped>
    .card {
        border-radius: .5rem;
        box-shadow: 0px 1px 1px 0px #00000040;
        overflow: hidden;
        position: relative;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        background-color: #ffffff;
        box-sizing: border-box;
    }

    .bg-default {
        background-color: #F5F5F5;
    }

    .center {
        display: flex;
        justify-content: center;
    }
</style>