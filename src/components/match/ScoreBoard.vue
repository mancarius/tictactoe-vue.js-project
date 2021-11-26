<template>
  <div class="score-board">
    <score :uid="match.opponent.uid" class="score-box left" />
    <h6 class="label">score</h6>
    <score :uid="match.player.uid" class="score-box right" />
  </div>
</template>

<script lang="ts">
import { useMatch } from '@/plugins/match'
import { defineComponent } from 'vue'
import Score from './Score.vue';

export default defineComponent({
  name: "ScoreBoard",

  components: { Score },

  setup() {
    const match = useMatch();

    return {
      match
    }
  },
})
</script>

<style lang="scss" scoped>
.score-board {
  position: relative;
  background-color: #f4f4f4;
  width: 100%;
  display: flex;

  .label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-transform: uppercase;
    font-size: .8em;
    font-weight: bold;
  }

  .score-box {
    font-size: 1.5em;
    padding: .5rem 1rem;
    width: 50%;

    &:first-child {
      text-align: left;
    }

    &:last-child {
      text-align: right;
    }
  }
}

</style>