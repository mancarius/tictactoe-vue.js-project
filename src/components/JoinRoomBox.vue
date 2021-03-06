<template>
    <form class="body" @submit.prevent="joinRoom">
        <input type="text" outlined placeholder="Insert the room code" ref="input" v-model="roomCode" />
        <q-btn color="accent" type="submit">Join</q-btn>
    </form>
</template>

<script lang="ts">
import { Actions } from '@/helpers/enums/actions.enum';
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchTypes } from '@/helpers/enums/match-types.enum';
import MatchService from '@/services/match/match.service';
import { useQuasar } from 'quasar';
import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useMatch } from '@/plugins/match';
import PlayerService from '@/services/player.service';
import useMatchObservables from '@/injectables/match-observables'
import useUserAuth from '@/injectables/user-auth'

export default defineComponent({
  name:"JoinRoomBox",

  props: {
    'modelValue': {
        type: String,
        required: true
    },
  },

  setup() {
    const store = useStore();
    const router = useRouter();
    const input = ref<HTMLInputElement>();
    const $match = useMatch();
    const $q = useQuasar();
    const {requireAuth} = useUserAuth();
    const {subscribeMatch, subscribePlayer, subscribeOpponent} = useMatchObservables();
    const roomCodeByQuery = router.currentRoute.value.query.roomCode;
    const roomCode = ref<string>( typeof roomCodeByQuery === 'string' ? roomCodeByQuery : '');

    const joinRoom = async () => {
      // perform user auth if needed
      if(!store.getters[Getters.USER_IS_AUTHED]) {
        try {
          await requireAuth()
        } catch( error ) {
          $q.notify({message: "Authentication failed"});
          return;
        };
      }
      // join room
      store.dispatch(Actions.LOADING_START, "Knocking on the room...");
      input.value!.disabled = true;

      const user = store.getters[Getters.USER_DATA];

      try{
        if(!roomCode.value || roomCode.value.trim().length === 0){
          throw TypeError("Bad room code");
        }
        
        await $match.join(roomCode.value, user);
      
        subscribeMatch(({state}: MatchService) => {
          if(state !== undefined) store.dispatch(Actions.MATCH_SET_STATE, state);
        });
        subscribePlayer(({state}: PlayerService) => {
          if(state !== undefined) store.dispatch(Actions.PLAYER_SET_STATE, state);
        });
        subscribeOpponent(({state}: PlayerService) => {
          if(state !== undefined) store.dispatch(Actions.OPPONENT_SET_STATE, state);
        });
      } catch(error) {
        console.error(error);
        $q.notify({message: "Impossible to join the room"});
        store.dispatch(Actions.LOADING_STOP);
        input.value!.disabled = false;
        return;
      }

      router.push({
        name: "Lobby", 
        params: {
          matchType: MatchTypes.PLAYER_VS_PLAYER,
          matchId: $match.service?.id
        }
      });
    }


    onMounted(() => {
      if(typeof roomCodeByQuery === 'string' && roomCodeByQuery.trim().length > 0) {
        joinRoom();
      }
    });


    return {
      input,

      roomCode,

      joinRoom
    }
  },

})
</script>

<style lang="scss" scoped>
.body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
}
</style>