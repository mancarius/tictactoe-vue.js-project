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
import { PlayerStates } from '@/helpers/enums/player-states.enum';
import { useMatch } from '@/plugins/match';
import { useSymbols } from '@/plugins/symbols';
import { SymbolCode } from '@/plugins/symbols/types/symbols-plugin.interface';
import { WinningSequence } from '@/types/board-types.interface';
import _ from 'lodash';
import { useQuasar } from 'quasar';
import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex';
import { useStateUtilities } from '@/mixins/setPlayerState'
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
    const matchState = computed(() => store.getters[Getters.MATCH_STATE]);
    const playerState = computed(() => store.getters[Getters.PLAYER_STATE]);
    const opponentState = computed(() => store.getters[Getters.OPPONENT_STATE]);
    const playerSymbolCode = match.player?.options.sign;
    const playerSymbolURL = symbols.getFullPath(playerSymbolCode as SymbolCode);
    const opponentSymbolCode = match.opponent?.options.sign;
    const opponentSymbolURL = symbols.getFullPath(opponentSymbolCode as SymbolCode);
    const canMoveTemplate = [MatchStates.waiting_player_move, PlayerStates.waiting_for_opponent_move];
    const canMove = ref(false);
    const gameStartTemplate = [MatchStates.in_play, PlayerStates.in_game,PlayerStates.in_game];
    const isBotFindingNextMove = ref(false);
    const isWinningSequence = ref(false);
    const classes = computed(() => ({
      ['cols'+columns]: true, 
      disabled: !canMove.value
    }));
    const {setPlayerState, setOpponentState, setMatchState} = useStateUtilities();

    watch(matchState, (next, previous) => {

      isWinningSequence.value = next === MatchStates.sequence_found;

      movingTurnHandler([next, playerState.value, opponentState.value]);

      if(next === MatchStates.shaking_board) {
        shuffle();
      }

      if(next === MatchStates.terminated) {
        setMatchWinner();
      }

    });

    watch([opponentState, matchState], ([nextOpponentState, nextMatchState], [oldOpponentState, oldMatchState]) => {
      
      canMove.value = _.isEqual([nextMatchState, nextOpponentState], canMoveTemplate);

      isBotFindingNextMove.value = nextOpponentState === PlayerStates.calculating_next_move;
    });

    watch(canMove, (next) => {
      next && setPlayerState(PlayerStates.moving)
    });

    watch(isBotFindingNextMove, (next) => {
      console.log('isBotFindingNextMove', next)
      next ? openLoading() : closeLoading;
    });

    watch(isWinningSequence, (next) => {
      const winningSequence = match.service?.board.winningSequence;

      if(next && winningSequence) {
        setTimeout(() => {
          updatePlayerScore(winningSequence);
          clearWinningCells();
          checkLastUpdatedCells();
        }, 2000);
      }
    });

    function setMatchWinner() {
      if( match.player && match.opponent ) {
        if (match.player.score > match.opponent.score) {
          setPlayerState(PlayerStates.winner);
          setOpponentState(PlayerStates.loser);
        } else if (match.player.score < match.opponent.score) {
          setPlayerState(PlayerStates.loser);
          setOpponentState(PlayerStates.winner);
        } else {
          setPlayerState(PlayerStates.draw);
          setOpponentState(PlayerStates.draw);
        }
      }
    }

    function checkLastUpdatedCells() {
      if( match.service ) {
        match.service.checkLastUpdatedCells();
      }
    }

    function shuffle() {
      setTimeout(() => {
        if(match.service) {
          match.service.board.shuffleCells();
        }
      }, 2000);
    }

    function movingTurnHandler(
      states: [MatchStates, PlayerStates, PlayerStates], 
    ) {
      const [nextMatchState, nextPlayerState, nextOpponentState] = states;
      const isGameStart = _.isEqual([nextMatchState, nextPlayerState, nextOpponentState], gameStartTemplate);

      console.log(...states);

      if (isGameStart) {
        const isOwner = match.player?.isOwner ?? false;
        isOwner && setFirstMove();
        setMatchState(MatchStates.waiting_player_move);
      } else {
        const isPossibleToMove = nextMatchState === MatchStates.waiting_player_move;
        isPossibleToMove 
          ? setTurn(nextPlayerState, nextOpponentState) 
          : prepareNextTurn(nextPlayerState, nextOpponentState)
      }
    }

    function prepareNextTurn(playerState: PlayerStates, opponentState: PlayerStates) {
      const isOpponentTurn = playerState === PlayerStates.last_to_move;
      const isPlayerTurn = opponentState === PlayerStates.last_to_move;
      if (isOpponentTurn) setOpponentState(PlayerStates.next_to_move);
      else if (isPlayerTurn) setPlayerState(PlayerStates.next_to_move);
    }

    function setTurn(playerState: PlayerStates, opponentState: PlayerStates) {
      const isPlayerTurn = playerState === PlayerStates.next_to_move || opponentState === PlayerStates.waiting_for_opponent_move;
      const isOpponentTurn = opponentState === PlayerStates.next_to_move || playerState === PlayerStates.waiting_for_opponent_move;;
      if (isOpponentTurn) {
        setOpponentState(PlayerStates.moving);
        setPlayerState(PlayerStates.waiting_for_opponent_move);
      } else if (isPlayerTurn) {
        setPlayerState(PlayerStates.moving);
        setOpponentState(PlayerStates.waiting_for_opponent_move);
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

    function openLoading(message = '') {
      loading.label = message;
      loading.visible = true;
    }

    function closeLoading() {
      loading.visible = false;
    }

    function updatePlayerScore(winningSequence: WinningSequence) {
      if(winningSequence) {
        const { player, sequence } = winningSequence;
        const score = sequence.length;
        match.service && (match.service.getPlayer(player).score += score);
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