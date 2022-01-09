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
    <base-button v-if="!ready" outline color="negative" @click="leaveRoom">Exit</base-button>
    <base-button :loading="ready" push color="accent" :disabled="!playerSymbol" @click="ready = !ready">
      Ready
      <template v-slot:loading>
        <div class="nowrap-content">
          <q-spinner-radio class="on-left" />
          Waiting for opponent...
        </div>
      </template>
    </base-button>
  </div>
</div>
</template>

<script lang="ts">
import StatusBar from '@/components/match/GamePlayersBar.vue';
import SymbolsBoard from '@/components/match/SymbolsBoard.vue';
import BaseButton from '@/components/BaseButton.vue';
import { Actions } from '@/helpers/enums/actions.enum';
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { PlayerStates } from '@/helpers/enums/player-states.enum';
import { Routes } from '@/helpers/enums/routes.enum';
import { useSetStates } from '@/injectables/setStates';
import { useMatch } from '@/plugins/match';
import store from '@/store';
import { options } from '@/types/player.interface';
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
    name: "PageLobby",

    components: { StatusBar, SymbolsBoard, BaseButton },

    setup() {
      const match = useMatch();
      const router = useRouter();
      const route = useRoute();
      const store = useStore();
      const { setPlayerState } = useSetStates();
      const matchState = computed(() => store.getters[Getters.MATCH_STATE]);
      const ready = ref(match.player!.isReady);
      const opponentSymbol = computed(() => match.opponent!.options?.sign);
      const playerSymbol = computed({
        get: () => match.player?.options.sign,

        set: (value) => {
          if(value && match.player){
            match.player.options = { ...match.player.options, sign: value } as options;
          }
        }
      });

      const jumpNextRouteIfPlayersReady = () => {
          const { matchType, matchId } = route.params;
          router.push({
            name:"Game",
            params: {
              matchType, matchId
            }
          });
      }

      watch(ready, (next) => {
        const nextState = next ? PlayerStates.ready : PlayerStates.in_lobby;
        setPlayerState(nextState);
      });

      watch(matchState, (next) => {
        next === MatchStates.ready && jumpNextRouteIfPlayersReady();
      });

      return {
        ready,
        opponentSymbol,
        playerSymbol,
        setPlayerState,
      };
    },

    mounted() {
      this.setPlayerState(PlayerStates.in_lobby);
      store.dispatch(Actions.LOADING_STOP);
    },

    methods: {
      leaveRoom () {
        this.$router.push({name: Routes.home})
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
    & > * {
      flex: 1;
    }
  }

  .nowrap-content {
    display: flex;
    flex-wrap: nowrap;
    white-space: nowrap;
  }
}
</style>
