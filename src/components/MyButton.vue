<template>
  <q-btn :class="classes">
    <slot v-if="!loading"></slot>
    <slot v-else name="loading"></slot>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: "MyButton",
  props: {
    fullWidth: Boolean,
    loading: Boolean
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
</style>
