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
import { Routes } from '@/helpers/enums/routes.enum';
import { useSetStates } from '@/injectables/setStates';
import { useMatch } from '@/plugins/match';
import router from '@/router';
import { useQuasar } from 'quasar';
import { computed, defineComponent, onBeforeUnmount, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useStore } from 'vuex';
import { State } from 'vuex/core';

export default defineComponent({
  components: { },

  name:"PageMatch",

  beforeRouteEnter (to, from, next) {
    if(from.name === undefined)
      next({name: Routes.home});
    else
      next(true);
  },

  setup() {
    const match = useMatch();
    const store = useStore<State>();
    const { setPlayerState } = useSetStates();
    const { dialog, notify } = useQuasar();
    const matchState = computed<MatchStates>(() => store.getters[Getters.MATCH_STATE]);
    const playerState = computed<PlayerStates>(() => store.getters[Getters.PLAYER_STATE]);

    match.uid = store.getters[Getters.USER_DATA].uid;

    onBeforeRouteLeave(async (to, from, next) => {
      const {isRedirect} = to.params;

      if (isRedirect !== undefined) {
        next(true);
      } else {
        const confirm: boolean = await new Promise((resolve) => {
          dialog({
            title: 'Confirm',
            message: 'You are going to left the room. Are you sure?',
            ok: {
              color: 'accent'
            },
            cancel: {
              color: "negative",
              flat: true
            },
            focus: 'cancel',
            persistent: true
          }).onOk(() => {
            resolve(true)
          }).onCancel(() => 
            resolve(false)
          );
        });

        next(confirm);
      }
    });

    onBeforeUnmount(() => {
      match.service && setPlayerState(PlayerStates.disconnected);
      // unsubscribe plugin subscriptions
      match.subscriptions.forEach((subs) => subs());
      store.dispatch(Actions.MATCH_EXIT);
    });

    function redirectToHome(message: string) {
        notify({message});
        store.dispatch(Actions.LOADING_START, "Closing room...");
        setTimeout(() => {
            router.push({ name: Routes.home, params:{ isRedirect: '1' }});
          }, 3000);
      }

    watch([matchState, playerState], ([match_state, player_state]) => {
      switch(match_state){
        case MatchStates.ready:
          if(player_state === PlayerStates.in_game) {
            store.dispatch(Actions.LOADING_START);
          }
          break;
        case MatchStates.error:
          redirectToHome("Something goes wrong. You will be redirect to the home soon");
          break;
        case MatchStates.player_left_the_room:
          player_state !== PlayerStates.disconnected && redirectToHome("The opponent left the game. You will be redirect to the home soon");
          break;
        default:
          store.dispatch(Actions.LOADING_STOP)
      }
    }, {deep: true});

    return {
      matchState,
    }
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