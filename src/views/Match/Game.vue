<template>
<div class="container">
  <status-bar/>
  <game-status-display/>
  <score-board/>
  <game-board />
  <div class="actions">
    <shuffle-button v-if="useShuffling"/>
  </div>
</div>
</template>




<script lang="ts">
import GameBoard from '@/components/match/GameBoard.vue';
import GameStatusDisplay from '@/components/match/GameStatusDisplay.vue';
import ScoreBoard from '@/components/match/ScoreBoard.vue';
import ShuffleButton from '@/components/match/shuffleButton.vue';
import StatusBar from '@/components/match/StatusBar.vue';
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { MatchTypes } from '@/helpers/enums/match-types.enum';
import { PlayerStates } from '@/helpers/enums/player-states.enum';
import { Routes } from '@/helpers/enums/routes.enum';
import { useMatch } from '@/plugins/match';
import _ from 'lodash';
import { useQuasar } from 'quasar';
import { computed, defineComponent, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  name: "Game",

  components: {StatusBar, ScoreBoard, GameBoard, ShuffleButton, GameStatusDisplay},

  setup() {
    const match = useMatch();
    const router = useRouter();
    const store = useStore();
    const { notify, dialog } = useQuasar();
    const useShuffling = match.service?.useShuffling;
    const matchState = computed(() => store.getters[Getters.MATCH_STATE]);
    const isOwner = match.player?.isOwner as boolean;

    watch(matchState, (next) => {
      if( next === MatchStates.terminated && isOwner ) {
        dialog({
          title: 'And now?',
          message: 'What you want to do now?',
          ok: {
            label: "Play again",
            color: "primary",
          },
          cancel: {
            label: "Exit",
            color: "negative"
          },
          focus: 'ok',
          persistent: true
        }).onOk(() => {
          match.service && match.service.reset();
        }).onCancel(() => {
          router.push({name: Routes.home})
        }).onDismiss(() => {/**/});
      }
    });

    onMounted(() => {
      if(match.player){
        setPlayerState(PlayerStates.in_game);
      } else {
        notify({message: "Can't load player"});
        router.push({name:"Home"});
      }
    });

    onBeforeUnmount(() => {
      setPlayerState(PlayerStates.disconnected);
    })

    function setPlayerState(state: PlayerStates) {
      match.player && (match.player.state = state);
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
    justify-content: right;
  }
}
</style>