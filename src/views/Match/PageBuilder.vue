<template>
  <section class="builder-container">
    <q-list bordered padding class="options">
      <q-item-label header>Board</q-item-label>

      <q-item>
        <q-item-section side>
          <span class="slider-label">Columns</span>
        </q-item-section>
        <q-item-section>
          <q-slider
            v-model="board.columns"
            :min="cols.min"
            :max="cols.max"
            snap
            label
            label-always
            markers
            color="deep-orange"
          />
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section side>
          <span class="slider-label">Rows</span>
        </q-item-section>
        <q-item-section>
          <q-slider
            v-model="board.rows"
            :min="rows.min"
            :max="rows.max"
            snap
            label
            label-always
            markers
            color="light-green"
          />
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section side>
          <span class="slider-label">Winning<br/>sequence</span>
        </q-item-section>
        <q-item-section>
          <q-slider
            v-model="board.winning_sequence_length"
            :min="winningSequence.min"
            :max="winningSequence.max"
            snap
            label
            label-always
            markers
            color="light-blue"
          />
        </q-item-section>
      </q-item>

      <q-separator spaced />
      <q-item-label header>Game</q-item-label>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Shuffle</q-item-label>
          <q-item-label caption>Allow shuffling move</q-item-label>
        </q-item-section>
        <q-item-section side >
          <q-toggle color="blue" v-model="shuffle.active" val="shuffle_active" />
        </q-item-section>
      </q-item>

      <q-item clickable :class="{'item-disabled': !shuffle.active}">
        <q-item-section>
          <q-item-label>Shuffle activation</q-item-label>
          <q-item-label caption>Points needed to activate shuffle move</q-item-label>
        </q-item-section>
        <q-item-section side>
          {{shuffle.activation_threshold}}
        </q-item-section>
        <q-popup-edit v-model.number="shuffle.activation_threshold" title="Edit the threshold" auto-save v-slot="scope">
          <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
        </q-popup-edit>
      </q-item>
    </q-list>

    <div class="actions">
      <base-button outline color="negative" @click="leaveRoom">Exit</base-button>
      <base-button push color="accent" @click="createRoom">
        Create room
      </base-button>
    </div>
  </section>
</template>



<script lang="ts">
import BaseButton from '@/components/BaseButton.vue';
import { Actions } from '@/helpers/enums/actions.enum';
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { MatchTypes } from '@/helpers/enums/match-types.enum';
import { Routes } from '@/helpers/enums/routes.enum';
import { useSetStates } from '@/injectables/setStates';
import MatchService from '@/services/match/match.service';
import store from '@/store';
import { defineComponent, reactive, watch } from 'vue'
import { useRoute } from 'vue-router';

export default defineComponent({
  name: "PageBuilder",

  components: { BaseButton },
  
  setup() {
    const route = useRoute();
    const { setMatchState } = useSetStates();
    const { matchType } = route.params;
    const device = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      memory: navigator.deviceMemory ?? 2,
      threads: navigator.hardwareConcurrency
    };
    const shuffle = reactive({
      active: true,
      activation_threshold: 9
    });
    const board = reactive({
      columns: 3,
      rows: 3,
      winning_sequence_length: 3
    });
    const rows = reactive({
      min: 3,
      max: matchType === MatchTypes.PLAYER_VS_COMPUTER ? 4 : 8
    });
    const cols = reactive({
      min: 3,
      max: matchType === MatchTypes.PLAYER_VS_COMPUTER ? 4 : 8
    });
    const winningSequence = reactive({
      min: 3,
      max: 3
    });

    function getMaxAvailableRows() {
      if(device.memory > 8 && device.threads > 8) {
        return 4
      } else if( device.threads >= 8 && board.columns === 3) {
        return 4
      } else {
        return 3
      }
    }

    function getMaxAvailableCols() {
      if(device.memory > 8 && device.threads > 8) {
        return 4
      } else if( device.threads > 8 && board.rows === 3) {
        return 4
      } else {
        return 3
      }
    }

    watch(board, () => {
      winningSequence.max = Math.min(board.columns, board.rows);

      if(matchType === MatchTypes.PLAYER_VS_COMPUTER) {
        cols.max = getMaxAvailableCols();
        rows.max = getMaxAvailableRows();
      }
    });

    watch(() => shuffle.activation_threshold, (value) => {
      if (value <= 0) shuffle.activation_threshold = 1;
    })

    return {
      shuffle,
      board,
      rows,
      cols,
      winningSequence,
      matchType,
      setMatchState
    };
  },

  methods: {
    leaveRoom () {
      this.$router.push({name: Routes.home, params: {isRedirect: 1}})
    },

    createRoom() {
      store.dispatch(Actions.LOADING_START, "Building the room...");

      this.$match.create(store.getters[Getters.USER_DATA], this.matchType as MatchTypes, this.board)
      .then(() => {
        if(!(this.$match.service instanceof MatchService))
          throw new Error("Bad match service");
        else {
          // set shuffling options
          this.$match.service.useShuffling = this.shuffle.active;
          this.$match.service.shuffleActivationTarget = this.shuffle.activation_threshold;

          this.setMatchState(MatchStates.builded);
          // sync match and player state in store
          this.$match.service?.subscribe(({state}) => {
            if(state !== undefined) store.dispatch(Actions.MATCH_SET_STATE, state);
          });
          this.$match.player?.subscribe(({state}) => {
            if(state !== undefined) store.dispatch(Actions.PLAYER_SET_STATE, state);
          });

          this.$router.push({name: Routes.roomCode});
        }
      })
      .catch (error => {
        console.error(error);
        this.$q.notify({message: "I can't build the room now."});
        setTimeout(() => {
          this.$router.push({name: "Home", params: {isRedirect: 1}});
        }, 2000);
      });
    }
  }
})
</script>



<style lang="scss" scoped>
.builder-container {
  flex: 1;
  display: flex;
  flex-flow: column;
  gap: 2rem;
  margin-top: 2rem;

  .slider-label {
    display: inline-block;
    width: 8ch;
  }

  .item-disabled {
    opacity: .5;
    pointer-events: none;
  }


  .actions {
    display: flex;
    gap: .5rem;
    margin-top: auto;
    margin-bottom: 0;
    & * {
      flex: 1;
    }
  }
}
</style>