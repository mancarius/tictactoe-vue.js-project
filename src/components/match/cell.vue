<template>
  <div @click="cellClick" class="cell" :class="classes">
    <symbol-vue v-if="symbolCode" :code="symbolCode" class="symbol" />
  </div>
</template>


<script lang="ts">
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { PlayerStates } from '@/helpers/enums/player-states.enum';
import { useMatch } from '@/plugins/match'
import { SymbolCode } from '@/plugins/symbols/types/symbols-plugin.interface';
import { WinningSequence } from '@/types/board-types.interface';
import _ from 'lodash';
import { computed, defineComponent, reactive, Ref, ref, watch } from 'vue'
import { useStore } from 'vuex';
import SymbolVue from './Symbol.vue';

export default defineComponent({
  name: "Cell",

  components: { SymbolVue },

  props: {
    cellIndex: Number
  },

  setup(props) {
    const match = useMatch();
    const store = useStore();
    const matchState = computed(() => store.getters[Getters.MATCH_STATE]);
    const playerSymbol = match.player!.options.sign;
    const opponentSymbol = match.opponent!.options.sign;
    const classes = reactive({
      empty: true,
      filled: false,
      winner: false,
      shake: false
    });
    const symbolCode: Ref<SymbolCode | null> = ref(null);

    watch(() => match.service?.board.cells[props.cellIndex as number], (newCell, oldCell) => {
      if(newCell?.player !== oldCell?.player){
        setCell();
      }
    });

    watch(matchState, (next, previous) => {
      sequenceHandler(next, previous);
      shakingHandler(next, previous);
    });

    function sequenceHandler(next: MatchStates, previous: MatchStates): void {
      if(next === MatchStates.sequence_found && match.service){
        const winningSequence: WinningSequence = match.service.board.winningSequence;
        if(!_.isEqual(next, previous) && winningSequence) {
          const isCellInSequence = winningSequence.sequence.some((cellIndex) => cellIndex === props.cellIndex);
          classes.winner = isCellInSequence;
        }
      } else if(previous === MatchStates.sequence_found){
        classes.winner = false;
      }
    }

    function shakingHandler(next: MatchStates, previous: MatchStates): void {
      if (next === MatchStates.shaking_board) {
        _.delay(() => { classes.shake = true }, _.random(200, false));
      } else if (previous === MatchStates.shaking_board) {
        classes.shake = false;
      }
    }

    const setCell = () => {
      const cell = match.service?.board.cells[props.cellIndex as number];

      if(cell && cell.player) {
        classes.empty = false;
        classes.filled = true;
        symbolCode.value = match.service?.getPlayer(cell.player).options.sign ?? null;
      } else {
        classes.empty = true;
        classes.filled = false;
        symbolCode.value = null;
      } 
    }

    const cellClick = () => {
      if(classes.empty && props.cellIndex !== undefined && match.service && match.player && match.player.state === PlayerStates.moving) {
        match.player.moveOrShuffle(match.service.board, props.cellIndex);
      }
    }

    setCell();

    return {
      classes,
      match,
      symbolCode,
      playerSymbol,
      opponentSymbol,
      matchState,
      store,
      
      cellClick,
      setCell
    }
  },
})
</script>

<style lang="scss" scoped>
.cell {
  cursor:pointer;
  aspect-ratio: 1/1;
  padding: 1rem;

  &.empty {
    background: rgb(214, 214, 214);
    background: radial-gradient(circle, rgb(158, 158, 158) 6%, rgba(9,9,121,0) 6%);
  }

  &.filled {
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;

    &.winner {
      animation: blink .25s alternate infinite;
    }

    &.shake {
      animation: shake 0.5s;
      animation-iteration-count: infinite;
    }
  }

  .symbol {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
}
</style>