<template>
    <div class="body">
        <input type="text" placeholder="Insert the room code" ref="input" />
        <my-button primary @click="searchRoom">Join</my-button>
    </div>
</template>

<script lang="ts">
import { Actions } from '@/helpers/enums/actions.enum';
import { Getters } from '@/helpers/enums/getters.enum';
import { MatchTypes } from '@/helpers/enums/match-types.enum';
import { Mutations } from '@/helpers/enums/mutations.enum';
import MatchService from '@/services/match.service';
import MatchPlugin from '@/plugins/match/types/match-plugin.interface';
import { useQuasar } from 'quasar';
import { computed, defineComponent, inject, ref } from 'vue'
import { useRouter } from 'vue-router';
import { MutationPayload, useStore } from 'vuex';
import MyButton from './MyButton.vue'

export default defineComponent({
  components: { MyButton },
  name:"JoinRoomBox",

  setup() {
    const store = useStore();
    const router = useRouter();
    const input = ref<HTMLInputElement>();
    const $match = inject("match") as MatchPlugin;
    const $q = useQuasar();
    const roomCode = computed(() => input.value?.value || null);

    const searchRoom = async () => {
      if(roomCode.value) {
        
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

        input.value!.disabled = true;
        store.dispatch(Actions.LOADING_START, "Knocking on the room...");

        const room = await $match.find(roomCode.value as string);

        try {
          $match.service = MatchService.create(room);
          router.push({
            name: "Lobby", 
            params: {
              matchType: MatchTypes.PLAYER_VS_PLAYER,
              matchId: $match.service.id
            }
          });
        } catch(error: any) {
          console.error(error.message);
          $q.notify({message: "Room not found"});
          store.dispatch(Actions.LOADING_STOP);
        }
      }
    }

    return {
      input,

      roomCode,

      searchRoom
    }
  }

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