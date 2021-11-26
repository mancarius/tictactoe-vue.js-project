<template>
    <div class="body">
        <input type="text" placeholder="Insert the room code" ref="input" />
        <q-btn color="primary" @click="joinRoom">Join</q-btn>
    </div>
</template>

<script lang="ts">
import { Actions } from '@/helpers/enums/actions.enum';
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchTypes } from '@/helpers/enums/match-types.enum';
import { Mutations } from '@/helpers/enums/mutations.enum';
import MatchService from '@/services/match.service';
import { useQuasar } from 'quasar';
import { computed, defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router';
import { MutationPayload, useStore } from 'vuex';
import { useMatch } from '@/plugins/match';

export default defineComponent({
  name:"JoinRoomBox",

  setup() {
    const store = useStore();
    const router = useRouter();
    const input = ref<HTMLInputElement>();
    const $match = useMatch();
    const $q = useQuasar();
    const roomCode = computed(() => input.value?.value || null);

    const joinRoom = async () => {
      // perform user auth if needed
      if(!store.getters[Getters.USER_IS_AUTHED]) {
        store.dispatch(Actions.USER_REQUIRE_AUTH);

        await new Promise((resolve, reject) => {
          store.subscribe((mutation: MutationPayload) => {
            if (mutation.type === Mutations.USER_SET) {
              store.getters[Getters.USER_IS_AUTHED] ? resolve(true) : reject();
            }
          });
        })
          .catch((error) => {
            console.error(error);
            $q.notify({message: "Authentication failed"});
            return;
          })
          .finally(() => store.dispatch(Actions.USER_REQUIRE_AUTH, false));
      }
      // find room
      store.dispatch(Actions.LOADING_START, "Knocking on the room...");
      input.value!.disabled = true;

      const user = store.getters[Getters.USER_DATA];

      try{
        if(!roomCode.value){
          throw TypeError("Bad room code");
        }
        
        const room = await searchRoom(roomCode.value);
        $match.service = MatchService.create(room);
        await $match.join(room.id, user);

        $match.service.subscribe(({state}) => {
          if(state !== undefined) store.dispatch(Actions.MATCH_SET_STATE, state);
        });
        $match.player?.subscribe(({state}) => {
          if(state !== undefined) store.dispatch(Actions.PLAYER_SET_STATE, state);
        });
        $match.opponent?.subscribe(({state}) => {
          if(state !== undefined) store.dispatch(Actions.OPPONENT_SET_STATE, state);
        });

      } catch(error) {

        console.error(error);
        $q.notify({message: "Room not found"});
        store.dispatch(Actions.LOADING_STOP);
        input.value!.disabled = false;
        return;

      }

      router.push({
        name: "Lobby", 
        params: {
          matchType: MatchTypes.PLAYER_VS_PLAYER,
          matchId: $match.service.id
        }
      });
    }

    const searchRoom = async (roomCode: string) => {
      if(roomCode) {
        return await $match.find(roomCode as string);
      } else {
        throw new TypeError("Expected a 'string' but received "+typeof roomCode)
      }
    }

    return {
      input,

      roomCode,

      searchRoom, 
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