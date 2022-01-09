<template>
<template v-if="button">
    <button class="container" :class="{ ...classes, 'browser-default': true }">
        <img :src="imageSRC" />
    </button>
</template>
<template v-else>
    <div class="container" :class="classes">
        <img :src="imageSRC" />
    </div>
</template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';


export default defineComponent({
    name: "BaseAvatar",
    props: {
        src: {
            type: String,
            required: true
        },
        shadow: Boolean,
        button: Boolean,
        grayscale: Boolean,
        opacity: Boolean
    },
    computed: {
        imageSRC() {
            return this.src?.trim().length ? this.src : require('@/assets/avatar_default.jpg')
        },
        classes() {
            return {
                shadow: this.shadow,
                grayscale: this.grayscale,
                opacity: this.opacity
            }
        }
    },
})
</script>

<style lang="scss" scoped>
.container {
    border: none;
    background: none;
    border-radius: 50%;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    background-color: #ffffff;
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

.greyscale {
    filter: grayscale(100%);
}

.opacity {
    opacity: .52;
}
</style>
