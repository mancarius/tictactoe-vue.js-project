<template>
    <section class="match-container">
        <router-view></router-view>
    </section>
</template>

<script lang="ts">
import { Actions } from '@/helpers/enums/actions.enum';
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { PlayerStates } from '@/helpers/enums/player-states.enum';
import { useMatch } from '@/plugins/match';
import { useQuasar } from 'quasar';
import { computed, defineComponent, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  components: { },

  name:"MatchHome",

  setup() {
    const match = useMatch();
    const store = useStore();
    const router = useRouter();
    const { notify, dialog } = useQuasar();
    const matchState = computed(() => store.getters[Getters.MATCH_STATE]);
    const playerState = computed(() => store.getters[Getters.PLAYER_STATE]);
    const opponentState = computed(() => store.getters[Getters.OPPONENT_STATE]);

    watch([playerState, opponentState] ,([newPlayer, newOpponent], [oldPlayer, oldOpponent]) => {
      if(newPlayer === oldPlayer && newOpponent === oldOpponent) return;
      
      if(match.service){
        if(newPlayer === PlayerStates.in_game && newOpponent === PlayerStates.in_game)
          match.service.state = MatchStates.in_play;

        else if(newPlayer === PlayerStates.ready && newOpponent === PlayerStates.ready)
          match.service.state = MatchStates.match_ready;

        else if(newPlayer === PlayerStates.in_lobby || newOpponent === PlayerStates.in_lobby)
          match.service.state = MatchStates.waiting_players_ready;
      } else {
        notify({message: "Can't load match"});
        router.push({name:"Home"});
      }
    });

    watch([matchState, playerState], ([match_state, player_state]) => {

      switch(match_state){
        case MatchStates.match_ready:
          if(player_state === PlayerStates.in_game) {
            store.dispatch(Actions.LOADING_START);
          }
          break;
        default:
          store.dispatch(Actions.LOADING_STOP)
      }
    });

    match.uid = store.getters[Getters.USER_DATA].uid;

    onUnmounted(() => {
      // unsubscribe plugin subscriptions
      match.subscriptions.forEach((subs) => {
        subs();
      });
    });

    watch(() => store.getters[Getters.MATCH_EXIT], (current) => {
      if(current) {
        dialog({
          title: 'Confirm',
          message: 'Are you sure you want to left the room?',
          ok: {
            color: 'primary'
          },
          cancel: {
            color: "negative",
            flat: true
          },
          focus: 'cancel',
          persistent: true
        }).onOk(() => {
          router.push({name:"Home"});
        }).onDismiss(() => 
          store.dispatch(Actions.MATCH_EXIT, false)
        );
      }
    })
  }
})
</script>

<style lang="scss" scoped>
.match-container {
    flex: 1;
    display: flex;
    flex-direction: column;
}
</style>