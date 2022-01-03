<template>
  <div class="board-container">
    <div class="board" :class="classes">
      <cell v-for="(cell, index) in cells" :key="cell.coords.x+'.'+cell.coords.y" :cellIndex="index"/>
    </div>

    <q-inner-loading
      :showing="loading.visible"
      :label="loading.label"
      label-class="text-teal"
      label-style="font-size: 1em"
    />
  </div>
</template>


<script lang="ts">
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { MatchTypes } from '@/helpers/enums/match-types.enum';
import { PlayerStates } from '@/helpers/enums/player-states.enum';
import { useSetStates } from '@/injectables/setStates';
import { useMatch } from '@/plugins/match';
import { useSymbols } from '@/plugins/symbols';
import { SymbolCode } from '@/plugins/symbols/types/symbols-plugin.interface';
import _ from 'lodash';
import { useQuasar } from 'quasar';
import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex';
import cell from './cell.vue'

export default defineComponent({
  name:"GameBoard",

  components: { cell },

  setup() {
    const { notify } = useQuasar();
    const store = useStore();
    const match = useMatch();
    const symbols = useSymbols();
    const rows = match.service?.board.configurations.rows ?? 0;
    const columns = match.service?.board.configurations.columns ?? 0;
    const cells = computed(() => match.service?.board.cells);
    const loading = reactive({ visible: true, label: '' });
    const matchType = match.service?.type;
    const matchState = computed(() => store.getters[Getters.MATCH_STATE]);
    const playerState = computed(() => store.getters[Getters.PLAYER_STATE]);
    const opponentState = computed(() => store.getters[Getters.OPPONENT_STATE]);
    const playerSymbolCode = match.player?.options.sign;
    const playerSymbolURL = symbols.getFilename(playerSymbolCode as SymbolCode);
    const opponentSymbolCode = match.opponent?.options.sign;
    const opponentSymbolURL = symbols.getFilename(opponentSymbolCode as SymbolCode);
    const canMove = ref(false);
    const isBotFindingNextMove = ref(false);
    const isWinningSequence = ref(false);
    const classes = computed(() => ({
      ['cols'+columns]: true, 
      disabled: !canMove.value
    }));
    const {setPlayerState, setOpponentState} = useSetStates();

    watch(matchState, (next) => {

      isWinningSequence.value = next === MatchStates.sequence_found;

      turnHandler([next, playerState.value, opponentState.value]);

      if(next === MatchStates.shaking_board) {
        shuffle();
      }

    }, {deep: true});

    watch(playerState, (next) => {
      canMove.value = next === PlayerStates.moving
    });

    watch([opponentState, matchState], ([nextOpponentState, nextMatchState], [oldOpponentState, oldMatchState]) => {
      isBotFindingNextMove.value = nextOpponentState === PlayerStates.calculating_next_move;
    }, {deep: true});

    watch(isWinningSequence, (next) => {
      const winningSequence = match.service?.board.winningSequence;

      if(next && winningSequence) {
        setTimeout(() => {
          clearWinningCells();
          checkLastUpdatedCells();
        }, 2000);
      }
    });

    function checkLastUpdatedCells() {
      if( match.service ) {
        match.service.checkLastUpdatedCells();
      }
    }

    function shuffle() {
      setTimeout(() => {
        if(match.service) {
          if(playerState.value === PlayerStates.shuffling) {
            match.service.board.shuffleCells();
            setPlayerState(PlayerStates.last_to_move);
          } else if(matchType === MatchTypes.PLAYER_VS_COMPUTER) {
            match.service.board.shuffleCells();
            matchType === MatchTypes.PLAYER_VS_COMPUTER && setOpponentState(PlayerStates.last_to_move);
          }
        }
      }, 2000);
    }

    function turnHandler(
      states: [MatchStates, PlayerStates, PlayerStates], 
    ) {
      const [nextMatchState, nextPlayerState, nextOpponentState] = states;
      const isGameStart = nextMatchState === MatchStates.started;

      if (isGameStart) {
        const isOwner = match.player?.isOwner ?? false;
        isOwner && setFirstMove();
      } else {
        const isPossibleToMove = nextMatchState === MatchStates.waiting_for_player_move;
        
        if(isPossibleToMove) {
          const nextPlayerToMove = match.service?.nextPlayerToMove ?? null;
          setTurn(nextPlayerToMove)
        }
      }
    }


    function setTurn(nextPlayerToMove: string | null) {
      const isOpponentTurn: boolean = nextPlayerToMove 
        ? match.opponent?.uid === nextPlayerToMove
        : playerState.value === PlayerStates.waiting_for_opponent_move || playerState.value === PlayerStates.last_to_move;
      const isPlayerTurn: boolean = nextPlayerToMove 
        ? match.player?.uid === nextPlayerToMove
        : opponentState.value === PlayerStates.waiting_for_opponent_move || opponentState.value === PlayerStates.last_to_move;

      if (isOpponentTurn) {
        matchType === MatchTypes.PLAYER_VS_COMPUTER && setOpponentState(PlayerStates.moving);
        setPlayerState(PlayerStates.waiting_for_opponent_move);
      } else if (isPlayerTurn) {
        setPlayerState(PlayerStates.moving);
        matchType === MatchTypes.PLAYER_VS_COMPUTER && setOpponentState(PlayerStates.waiting_for_opponent_move);
      }
    }

    function setFirstMove() {
      try{
        match.setFirstMove();
      } catch(error: any) {
        console.error(error);
        notify({message: error.message || "An error occured"});
      }
    }

    function clearWinningCells() {
      match.service && match.service.board.clearWinningCells();
    }

    return {
      rows, 
      columns,
      cells,
      classes,
      playerSymbolURL,
      opponentSymbolURL,
      loading,
    }
  },

  mounted() {
    this.loading.visible = false;
  }
})
</script>


<style lang="scss" scoped>
.board-container {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  aspect-ratio: 1/1;

  .board {
    display: grid;
    gap: .5rem;

    &.cols3 {
      grid-template-columns: repeat(3, minmax(min(5rem, 100%), 1fr));
    }

    &.cols4 {
      grid-template-columns: repeat(4, minmax(min(5rem, 100%), 1fr));
    }

    &.cols5 {
      grid-template-columns: repeat(5, minmax(min(5rem, 100%), 1fr));
    }

    &.cols6 {
      grid-template-columns: repeat(6, minmax(min(5rem, 100%), 1fr));
    }

    &.cols7 {
      grid-template-columns: repeat(7, minmax(min(5rem, 100%), 1fr));
    }

    &.cols8 {
      grid-template-columns: repeat(8, minmax(min(5rem, 100%), 1fr));
    }

    &.disabled {
      pointer-events: none;
      opacity: 1 !important;
    }
  }
}
</style>

<style lang="scss">
@keyframes blink {
  0%    { opacity: 0; }
  100%  { opacity: 1; }
}

@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
</style>