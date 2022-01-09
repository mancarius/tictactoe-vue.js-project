<template>
  <div class="score">{{score}}</div>
</template>


<script lang="ts">
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { useMatch } from '@/plugins/match'
import { defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex';

export default defineComponent({
  name: "ScoreItem",

  props: {
    uid: {
        type: String,
        required: true
    },
  },

  setup(props) {
    const store = useStore();
    const match = useMatch();
    const score = ref(match.service?.getPlayer(props.uid as string).score ?? '0');

    watch(() => store.getters[Getters.MATCH_STATE], (next, prev) => {
      if(prev === MatchStates.sequence_found || prev === MatchStates.resetting || next === MatchStates.started) {
        score.value = match.service?.getPlayer(props.uid as string).score ?? '0';
      }
    });

    return {
      score
    }
  },
})
</script>


<style lang="scss" scoped>
</style>
