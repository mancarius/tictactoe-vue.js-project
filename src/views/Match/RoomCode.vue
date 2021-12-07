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
import { defineComponent, ref } from '@vue/runtime-core';
import _ from 'lodash';
import { useMatch } from '@/plugins/match';
import { MatchStates } from '@/helpers/enums/match-states.enum';
import { MatchTypes } from '@/helpers/enums/match-types.enum';
import { useStore } from 'vuex';
import { Actions } from '@/helpers/enums/actions.enum';
import { useQuasar } from 'quasar';
import MatchService from '@/services/match.service';


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
    const store = useStore();
    const render = ref(false);

    store.dispatch(Actions.LOADING_START, "Building the room...");

    if(match.service) {
      match.service.state = MatchStates.building;
    }

    return {
      timeout: 0,
      render
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

  watch: {
      opponent(player) {
        if(player instanceof PlayerService) {
          const delay = this.$match.service?.type === MatchTypes.PLAYER_VS_PLAYER ? 2000 : 0;
          // subscribe to the opponent state and sync the store
          this.$match.opponent?.subscribe(({state}) => {
            if(state !== undefined) store.dispatch(Actions.OPPONENT_SET_STATE, state);
          });
          
          this.timeout = setTimeout(() => {
            this.$router.push({
              name: "Lobby",
              params: {
                matchId: this.$match.service?.id,
                matchType: this.$match.service?.type
              }
          });
        }, delay);
        }
      }
  },
  
  mounted() {
    const { matchType } = this.$route.params;
    
    this.$match.create(store.getters[Getters.USER_DATA], matchType as MatchTypes)
      .then(() => {
        if(!(this.$match.service instanceof MatchService))
          throw new Error("Bad match service");
        else {
          // sync match and layer state in store
          this.$match.service?.subscribe(({state}) => {
            if(state !== undefined) store.dispatch(Actions.MATCH_SET_STATE, state);
          });
          this.$match.player?.subscribe(({state}) => {
            if(state !== undefined) store.dispatch(Actions.PLAYER_SET_STATE, state);
          });

          store.dispatch(Actions.LOADING_STOP);

          if(matchType === MatchTypes.PLAYER_VS_PLAYER)
            this.render = true;
        }
      })
      .catch (error => {
        console.error(error);
        const { notify } = useQuasar();
        notify({message: "I can't build the room now."});
        this.$router.push({name: "Home"});
      });
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