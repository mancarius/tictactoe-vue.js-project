<template>
  <div class="score">{{score}}</div>
</template>


<script lang="ts">
import { useMatch } from '@/plugins/match'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: "Score",

  props: {
    uid: String
  },

  setup(props) {
    const match = useMatch();
    const score = computed(() => match.service?.getPlayer(props.uid as string).score);

    return {
      score
    }
  },
})
</script>


<style lang="scss" scoped>
</style>
