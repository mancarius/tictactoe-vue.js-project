<template>
  <q-btn round @click="shuffle" icon="fas fa-random" :class="{disabled: !canShuffle}" />
</template>

<script lang="ts">
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { PlayerStates } from '@/helpers/enums/player-states.enum';
import { useStateUtilities } from '@/mixins/setPlayerState';
import { useMatch } from '@/plugins/match'
import BotService from '@/services/bot.service';
import PlayerService from '@/services/player.service';
import { computed, defineComponent, watch } from 'vue'
import { useStore } from 'vuex';

export default defineComponent({
  setup() {
    const match = useMatch();
    const {setMatchState, setPlayerState, setOpponentState} = useStateUtilities();
    const store = useStore();
    const matchState = computed(() => store.getters[Getters.MATCH_STATE]);
    const playerState = computed(() => store.getters[Getters.PLAYER_STATE]);
    const opponentState = computed(() => store.getters[Getters.OPPONENT_STATE]);
    const canShuffle = computed(() => match.player?.canShuffle);

    watch([playerState, opponentState], (next, previous) => {
      shufflingHandler(next, previous);
    });

    watch(matchState, (next, previous) => {
      if(next === MatchStates.shaking_board) {
        if(opponentState.value === PlayerStates.shuffling) {
          setOpponentState(PlayerStates.last_to_move);
        }
      }
    })

    function shuffle() {
      if(canShuffle.value && match.player) {
        setPlayerState(PlayerStates.shuffling);
        setMatchState(MatchStates.shaking_board);
      }
    }

    function shufflingHandler(next: PlayerStates[], previous: PlayerStates[]): void {
      const [nextPlayerState, nextOpponentState] = next;
      const [previousPlayerState, previousOpponentState] = previous;
      console.log({previousPlayerState, nextPlayerState});

      if(nextOpponentState === PlayerStates.shuffling) {
        setMatchState(MatchStates.shaking_board)
      } else if(previousPlayerState === PlayerStates.shuffling) {
        match.player && clearAndDisablePlayerShuffling(match.player);
      } else if(previousOpponentState === PlayerStates.shuffling) {
        match.opponent && clearAndDisablePlayerShuffling(match.opponent);
      }
    }

    function clearAndDisablePlayerShuffling(player: PlayerService | BotService): void {
      player.clearShuffleBuffer();
      player.disableShuffling();
    }

    return {
      canShuffle,
      shuffle
    }
  },
})
</script>

<style lang="scss" scoped>
.disabled {
  pointer-events: none;
}
</style>