<template>
<div class="container">
  <game-players-bar/>
  <game-status-display/>
  <score-board/>
  <game-board />
  <div class="actions">
    <game-shuffle-button v-if="useShuffling"/>
  </div>
</div>
</template>




<script lang="ts">
import GameBoard from '@/components/match/GameBoard.vue';
import GameStatusDisplay from '@/components/match/GameStatusDisplay.vue';
import ScoreBoard from '@/components/match/ScoreBoard.vue';
import GameShuffleButton from '@/components/match/GameShuffleButton.vue';
import GamePlayersBar from '@/components/match/GamePlayersBar.vue';
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { PlayerStates } from '@/helpers/enums/player-states.enum';
import { Routes } from '@/helpers/enums/routes.enum';
import { useSetStates } from '@/injectables/setStates';
import { useMatch } from '@/plugins/match';
import _ from 'lodash';
import { useQuasar } from 'quasar';
import { computed, defineComponent, onMounted, watch } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  name: "PageGame",

  components: {GamePlayersBar, ScoreBoard, GameBoard, GameShuffleButton, GameStatusDisplay},

  setup() {
    const match = useMatch();
    const router = useRouter();
    const store = useStore();
    const { setPlayerState } = useSetStates();
    const { dialog } = useQuasar();
    const useShuffling = match.service?.useShuffling;
    const matchState = computed(() => store.getters[Getters.MATCH_STATE]);
    const playerState = computed(() => store.getters[Getters.PLAYER_STATE]);
    let dialogInstance:any = null;

    watch(matchState, (next) => {
      switch (next) {
        case MatchStates.terminated: {
        onMatchTerminated();
        break;
      } case MatchStates.player_left_the_room : {
        dialogInstance && dialogInstance.hide();
        break;
      } default:
        return;
      }
    });

    onMounted(() => {
      setPlayerState(PlayerStates.in_game);
    });

    onBeforeRouteLeave((to, from, next) => {
      const {isRedirect} = to.params;
      // if press history back button, redirect to Home to trigger confirmation pop-up located Match view
      if(to.name === Routes.lobby && !isRedirect) {
        next(false);
        router.push({name: Routes.home});
      } else {
        next(true);
      }
    });

    function onMatchTerminated() {
      const dialogTitle = playerState.value === PlayerStates.winner 
          ? "Awesome! You win!" 
          : playerState.value === PlayerStates.loser
            ? "You lose"
            : "Draw";

      dialogInstance = dialog({
        title: dialogTitle,
        message: 'What you want to do now?',
        ok: {
          label: "Play again",
          color: "accent",
        },
        cancel: {
          label: "Exit",
          color: "negative"
        },
        focus: 'ok',
        persistent: true
      }).onOk(() => {
        match.reset();
        router.push({name: Routes.lobby, params: {isRedirect:1}})
      }).onCancel(() => {
        router.push({name: Routes.home, params: {isRedirect:1}})
      });
    }

    return {
      useShuffling
    }
  },
})
</script>




<style lang="scss" scoped>
.container {
  display: flex;
  flex-flow: column;

  .actions {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
  }
}
</style>