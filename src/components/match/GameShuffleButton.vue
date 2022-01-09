<template>
  
  <q-knob
      readonly
      v-model="shuffleBuffer"
      show-value
      size="90px"
      :thickness="0.22"
      track-color="grey-3"
      class="q-ma-md shadow-2 knob"
      color="orange"
  >
    <q-btn flat round class="browser-default" @click="shuffle" icon="fas fa-random" :class="{disabled: !canShuffle, 'text-orange': canShuffle}" />
  </q-knob>
</template>

<script lang="ts">
import { Getters } from '@/helpers/enums/getters.enum';
import { PlayerStates } from '@/helpers/enums/player-states.enum';
import { useSetStates } from '@/injectables/setStates';
import { useMatch } from '@/plugins/match'
import BotService from '@/services/bot.service';
import PlayerService from '@/services/player.service';
import { computed, defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex';

export default defineComponent({
  name: "GameShuffleButton",
  
  setup() {
    const match = useMatch();
    const { setPlayerState } = useSetStates();
    const store = useStore();
    const matchState = computed(() => store.getters[Getters.MATCH_STATE]);
    const playerState = computed(() => store.getters[Getters.PLAYER_STATE]);
    const opponentState = computed(() => store.getters[Getters.OPPONENT_STATE]);
    const canShuffle = ref(false);
    const shuffleBuffer = ref(0);

    watch([playerState, opponentState, matchState], (next, previous) => {
      shufflingHandler(next, previous);
    });

    function shuffle() {
      if(canShuffle.value && match.player) {
        setPlayerState(PlayerStates.shuffling);
      }
    }

    function shufflingHandler(next: PlayerStates[], previous: PlayerStates[]): void {
      const [nextPlayerState] = next;
      const [previousPlayerState] = previous;

      if(previousPlayerState === PlayerStates.shuffling || nextPlayerState === PlayerStates.in_game) {
        match.player && clearAndDisablePlayerShuffling(match.player);
      } else if(previousPlayerState === PlayerStates.score) {
        shuffleBuffer.value = match.player instanceof PlayerService
          ? (match.player.shuffleBuffer * 100 / match.service!.shuffleActivationTarget)
          : 0;
      }

      if (match.player) {
        canShuffle.value = match.player.canShuffle && nextPlayerState === PlayerStates.moving;
      }
    }

    function clearAndDisablePlayerShuffling(player: PlayerService | BotService): void {
      canShuffle.value = false;
      shuffleBuffer.value = 0;
      player.clearShuffleBuffer();
      player.disableShuffling();
    }

    return {
      canShuffle,
      shuffleBuffer,
      shuffle
    }
  },
})
</script>

<style lang="scss" scoped>
.knob {
  border-radius: 50%;

}
.disabled {
  pointer-events: none;
}
</style>