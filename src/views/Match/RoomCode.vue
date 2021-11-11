<template>
  <section class="room-code-container">
    <suspense>
      <room-code-generator/>
    </suspense>
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
import { defineComponent } from '@vue/runtime-core';
import _ from 'lodash';


declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $match: MatchPlugin;
  }
}

export default defineComponent({
  name:"RoomCode",

  components: { Avatar, RoomCodeGenerator },

  data() {
    return {
      timeout: 0,
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
          this.timeout = setTimeout(() => {
          this.$router.push({
            name: "Lobby",
            params: {
              matchId: this.$match.service?.id,
              matchType: this.$match.service?.type
            }
          });
        }, 3000);
        }
      }
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