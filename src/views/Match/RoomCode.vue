<template>
  <section class="room-code-container">
    <template v-if="render">
      <room-code-generator/>
      <div class="opponent-connection-state-container">
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <div v-if="opponent" class="opponent-connected-box">
            <avatar src="{{opponent.photoURL}}" shadow />
            <p>
              {{opponent.displayName}} is connected!
            </p>
          </div>
        </transition>
        <q-inner-loading
          :showing="!opponent"
          label="Waiting for the opponent...">
        </q-inner-loading>
      </div>
    </template>
  </section>
</template>


<script lang="ts">
import Avatar from '@/components/Avatar.vue';
import RoomCodeGenerator from '@/components/RoomCodeGenerator.vue';
import { Getters } from '@/helpers/enums/getters.enum';
import PlayerService from '@/services/player.service';
import store from '@/store';
import MatchPlugin from '@/plugins/match/types/match-plugin.interface';
import User from '@/types/user.interface';
import { defineComponent, ref, watchEffect } from '@vue/runtime-core';
import _ from 'lodash';
import { useMatch } from '@/plugins/match';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { MatchTypes } from '@/helpers/enums/match-types.enum';
import { useStore } from 'vuex';
import { Actions } from '@/helpers/enums/actions.enum';
import { useQuasar } from 'quasar';
import MatchService from '@/services/match/match.service';
import { useSetStates } from '@/injectables/setStates';
import { useRoute, useRouter } from 'vue-router';


declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $match: MatchPlugin;
  }
}

export default defineComponent({
  name:"RoomCode",

  components: { Avatar, RoomCodeGenerator },

  setup() {
    const match = useMatch();
    const router = useRouter();
    const route = useRoute();
    const { matchType } = route.params;
    const render = ref(matchType === MatchTypes.PLAYER_VS_PLAYER);
    let timeout = 0;

    if(match.service) {
      match.service.state = MatchStates.building;
    }

    watchEffect(() => {
        if(match.opponent instanceof PlayerService) {
          const delay = match.service?.type === MatchTypes.PLAYER_VS_PLAYER ? 2000 : 0;
          // subscribe to the opponent state and sync the store
          match.opponent?.subscribe(({state}) => {
            if(state !== undefined) store.dispatch(Actions.OPPONENT_SET_STATE, state);
          });
          
          timeout = setTimeout(() => {
            router.push({
              name: "Lobby",
              params: {
                matchId: match.service?.id,
                matchType: match.service?.type
              }
          });
        }, delay);
        }
      });

    return {
      render,
      timeout
    }
  },

  computed: {
    opponent() {
      const user = store.getters[Getters.USER_DATA] as User;
      const opponent = this.$match.service?.players.filter(
        (player) => player.uid !== user.uid
      )[0];
      return opponent;
    }
  },
  
  mounted() {
    store.dispatch(Actions.LOADING_STOP);
  },

  unmounted() {
    clearTimeout(this.timeout);
  }
})
</script>


<style lang="scss" scoped>
.room-code-container {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;

  .opponent-connection-state-container {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .opponent-connected-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      p {
        margin: 0;
      }
    }
  }
}
</style>