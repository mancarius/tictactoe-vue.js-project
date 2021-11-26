<template>
    <q-btn :class="classes">
        <slot></slot>
    </q-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: "MyButton",
  props: {
    fullWidth: Boolean,
  },
  data(){
    return {
      classes: {
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

  .text-white {
    color: inherit !important;
  }
</style>
