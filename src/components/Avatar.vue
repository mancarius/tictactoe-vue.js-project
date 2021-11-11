<template>
    <template v-if="button">
        <button :class="{shadow: shadow, 'browser-default': true}">
            <img :src="imageSRC" />
        </button>
    </template>
    <template v-else>
            <img :src="imageSRC" :class="{shadow: shadow}" />
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "Avatar",
    props: {
        src: String, 
        shadow: Boolean,
        button: Boolean
        },
    computed: {
        imageSRC() {
            return this.src || '@/assets/avatar.jpg'
        }
    },
})
</script>

<style lang="scss" scoped>
    button {
        border: none;
        background: none;
        border-radius: 50%;
        padding: 0;
        cursor: pointer;
        display: inline-flex;
    }

    img {
        border-radius: 50%;
        height: 3rem;
        width: 3rem;
        object-fit: cover;
        object-position: center;
        border: 3px solid #ffffff;
        box-sizing: border-box;
    }
    
    .shadow {
        box-shadow: 0 0 5px -2px #000;
    }
</style>