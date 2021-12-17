<template>
<div class="status-bar-container">
    <div class="player-container left" :class="{ alpha: !isOpponentReady }">
        <avatar-vue class="pic dontApplyDark" :src="opponent?.photoURL" />
        <span class="name" :class="{active: isOpponentTurn}">{{opponentName}}</span>
    </div>
    <span class="divider">vs</span>
    <div class="player-container right">
        <avatar-vue class="pic dontApplyDark" :src="player?.photoURL" />
        <span class="name" :class="{active: isPlayerTurn}">You</span>
    </div>
</div>
</template>

<script lang="ts">
import { Getters } from '@/helpers/enums/getters.enum';
import { useMatch } from '@/plugins/match';
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex';
import AvatarVue from '@/components/Avatar.vue';
import PlayerService from '@/services/player.service';
import { PlayerStates } from '@/helpers/enums/player-states.enum';

export default defineComponent({
  name: "StatusBar",

  components: { AvatarVue },

  setup() {
    const store = useStore();
    const match = useMatch();
    const uid = store.getters[Getters.USER_DATA].uid;
    const player = computed(() => {
      return match.player;
    });
    
    const opponent = computed(() => {
      return match.opponent;
    });

    const opponentName = computed(() => {
      if (opponent.value instanceof PlayerService) {
        return opponent.value.options.customName.split(" ")[0];
      } else {
        return "";
      }
    });

    const isOpponentReady = computed(() => {
      return store.getters[Getters.PLAYER_STATE] === PlayerStates.ready
    });

    const isOpponentTurn = computed(() => {
      return store.getters[Getters.OPPONENT_STATE] === PlayerStates.moving;
    });

    const isPlayerTurn = computed(() => {
      return store.getters[Getters.PLAYER_STATE] === PlayerStates.moving;
    });

    return {
      uid,
      player,
      opponent,
      opponentName,
      isOpponentReady,
      isOpponentTurn,
      isPlayerTurn
    }
  },
})
</script>

<style lang="scss" scoped>
.status-bar-container {
    background-color: #FFD177;
    border-radius: 10rem;
    display: flex;
    align-items: center;

    .player-container {
        display: flex;
        align-items: center;
        flex: 1;

        &.left {
            flex-flow: row;

            .name {
                padding-left: 1.5rem;
                margin-left: -1rem;
            }
        }

        &.right {
            flex-flow: row-reverse;

            .name {
                padding-right: 1.5rem;
                margin-right: -1rem;
                text-align: right;
            }
        }

        .pic {
            z-index: 2;
        }

        .name {
            background-color: #FFE5B2;
            padding: 0.25rem 1.25rem;
            border-radius: 2rem;
            font-weight: bold;
            font-size: .9em;
            width: 100%;

            &.active {
              box-shadow: 0 0 2px 2px rgb(255, 0, 212);
            }
        }
    }

    .divider {
        text-transform: uppercase;
        font-weight: bold;
        letter-spacing: .1rem;
        padding: .5rem;
        font-style: italic;
    }
}
</style>
