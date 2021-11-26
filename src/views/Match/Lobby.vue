<template>
<status-bar />
<div class="lobby-container">
  <p>Select your symbol.</p>
  <Suspense>
    <template #default>
      <symbols-board class="symbols-board" v-model:selectedSymbol="playerSymbol" :disabled="ready" :disableSymbol="opponentSymbol" />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
  <div class="actions">
    <my-button outline color="negative" @click="leaveRoom">Exit</my-button>
    <my-button :loading="ready" push color="primary" @click="ready = !ready" :disabled="!playerSymbol">
      Ready
      <template v-slot:loading>
        <q-spinner-radio class="on-left" />
        Waiting for opponent ready...
      </template>
    </my-button>
  </div>
</div>
</template>

<script lang="ts">
import StatusBar from '@/components/match/StatusBar.vue';
import SymbolsBoard from '@/components/match/SymbolsBoard.vue';
import MyButton from '@/components/MyButton.vue';
import { Actions } from '@/helpers/enums/actions.enum';
import { PlayerStates } from '@/helpers/enums/player-states.enum';
import { useMatch } from '@/plugins/match';
import { SymbolCode } from '@/plugins/symbols/types/symbols-plugin.interface';
import MatchService from '@/services/match.service';
import PlayerService from '@/services/player.service';
import store from '@/store';
import { options } from '@/types/player.interface';
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
    name: "Lobby",

    components: { StatusBar, SymbolsBoard, MyButton },

    setup() {
      const match = useMatch();
      const router = useRouter();
      const route = useRoute();
      const ready = ref(match.player!.isReady);
      const opponentIsReady = computed(() => match.opponent!.state === PlayerStates.ready );
      const opponentSymbol = computed(() => match.opponent!.options?.sign);
      const playerSymbol = computed({
        get: () => match.player?.options.sign,

        set: (value) => {
          if(value && match.player){
            match.player.options = { sign: value } as options;
          }
        }
      });

      const jumpNextRouteIfPlayersReady = () => {
        if(ready.value && opponentIsReady.value) {
          const { matchType, matchId } = route.params;
          router.push({
            name:"Game",
            params: {
              matchType, matchId
            }
          });
        }
      }
      // if players ready jump to next route
      jumpNextRouteIfPlayersReady();

      watch([ready, opponentIsReady], ([currentReady, currentOpponentIsReady], [previousReady, previousOpponentIsReady]) => {
        if(!match.service) return;

        if( currentReady !== previousReady && match.player ){
          match.player.state = currentReady ? PlayerStates.ready : PlayerStates.in_lobby;
        }

        jumpNextRouteIfPlayersReady();
      });

      return {
        ready,
        match,
        opponentSymbol,
        playerSymbol,
        jumpNextRouteIfPlayersReady
      };
    },

    onBeforeMount() {
      if(this.$match.service instanceof MatchService && this.$match.player){
        this.$match.player.state = PlayerStates.in_lobby;
        this.ready = false;
      }
    },

    mounted() {
      store.dispatch(Actions.LOADING_STOP);
    },

    methods: {
      setSymbol (value: SymbolCode | null) {
        if(value !== null && this.$match.player instanceof PlayerService){
          this.$match.player.options = {sign: value} as options;
        }
      },

      leaveRoom () {
        store.dispatch(Actions.MATCH_EXIT);
      }
    }
})
</script>

<style lang="scss" scoped>
.lobby-container {
  flex: 1;
  display: flex;
  flex-flow: column;
  gap: 2rem;
  margin-top: 2rem;

  p {
    margin: 0;
  }

  .symbols-board {
    flex: 1;
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow-y: auto;
    box-shadow: inset 0 0 70px 0 #33333310;
  }

  .actions {
    display: flex;
    gap: .5rem;
    & * {
      flex: 1;
    }
  }
}
</style>
