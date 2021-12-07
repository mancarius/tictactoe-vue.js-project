<template>
  <div class="q-pa-md row justify-center" style="position:relative; height: 6rem; overflow: hidden">
    <div class="internal-box" style="width: 100%; max-width: 400px">
      <q-chat-message
        v-for="message in messages"
        :key="message.id"
        :sent="message.sent"
        :label="message.label"
        size="6"
      >
        <div v-if="message.text">{{message.text}}</div>
        <q-spinner-dots v-else-if="message.loading" size="2rem"/>
        <template v-else/>
      </q-chat-message>
    </div>
  </div>
</template>


<script lang="ts">
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { PlayerStates } from '@/helpers/enums/player-states.enum';
import { useMatch } from '@/plugins/match';
import _ from 'lodash';
import { computed, defineComponent, Ref, ref, watch } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: "GameStatusDisplay",

  setup() {
    const match = useMatch();
    const store = useStore();
    const matchState = computed(() => store.getters[Getters.MATCH_STATE]);
    const playerState = computed(() => store.getters[Getters.PLAYER_STATE]);
    const opponentState = computed(() => store.getters[Getters.OPPONENT_STATE]);
    const messages: Ref<{
      text?: string,
      sent: boolean,
      label?: string;
      loading?: boolean;
      id: any;
    }[]> = ref([]);

    watch([matchState, playerState, opponentState], (next, [prevMatchState]) => {
      const [m,p,o] = next;

      if(m === MatchStates.starting) {
        addMessage({label: 'Waiting for opponent'}, true);
      }

      if(m === MatchStates.started) {
        addMessage({label: 'Game start'}, true);
      }

      if(m === MatchStates.waiting_for_player_move) {
        if (p === PlayerStates.moving) addMessage({text:'Moving...'}, true);
        else if (o === PlayerStates.moving || o === PlayerStates.calculating_next_move) addMessage({loading: true}, false);
      }
      
      if(m === MatchStates.shaking_board) {
        if(p === PlayerStates.shuffling) {
          addMessage({text:'BOOM! SHAFFLING!'}, true);
        } else if(o === PlayerStates.shuffling) {
          addMessage({text:'BOOM! SHAFFLING!'}, false);
        }
      }

      if(m === MatchStates.sequence_found) {
        const winner = p === PlayerStates.score
          ? match.player?.nickName 
          : o === PlayerStates.score 
            ? match.opponent?.nickName 
            : null;

        const message = winner + " scored"

        addMessage({label: message}, false);
      }

      if(m === MatchStates.terminated) {
        const winner = p === PlayerStates.winner
          ? match.player?.nickName 
          : o === PlayerStates.winner 
            ? match.opponent?.nickName 
            : null;

        const message = winner ? winner + " won this match" : "The match ended with a draw"

        addMessage({label: message}, false);
      }
    })

    function addMessage(action: {text: string} | {label: string} | {loading: boolean}, sent: boolean) {
      messages.value.push({...action, sent, id:_.uniqueId()});
    }

    return {
      messages
    }
  },
})
</script>



<style lang="scss" scoped>
  .internal-box {
    position: absolute;
    bottom: 0;
    padding: 1rem;
  }
</style>