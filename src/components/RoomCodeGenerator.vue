<template>
    <card class="room-code-generator full-width">
      <template #title>
          <h6>Room code</h6>
      </template>
      <template #default>
          <div class="fake-input room-code-field">
              <span id="room-code" ref="roomCode">{{roomCode}}</span>
              <my-button primary @click="copyCodeToClipboard">Copy</my-button>
          </div>
          <p>Share this room code with the friend you want to invite to play.</p>
      </template>
    </card>
</template>

<script lang="ts">
import Card from '@/components/Card.vue';
import MyButton from '@/components/MyButton.vue';
import { Actions } from '@/helpers/enums/actions.enum';
import { MatchTypes } from '@/helpers/enums/match-types.enum';
import store from '@/store';
import MatchPlugin from '@/plugins/match/types/match-plugin.interface';
import { defineComponent, inject } from 'vue';
import { useStore } from 'vuex';
import { useMatch } from '@/plugins/match';
import { Getters } from '@/helpers/enums/getters.enum';


declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $match: MatchPlugin;
  }
}

export default defineComponent({
  name:"RoomCodeGenerator",

  components: { Card, MyButton },

  async setup() {
    const store = useStore();
    store.dispatch(Actions.LOADING_START, "Building the room...");
    const $match = useMatch();
    try {
      await $match.create(store.getters[Getters.USER_DATA], MatchTypes.PLAYER_VS_PLAYER);
    } catch (error) {
      console.error(error);
    }

    return {
      roomCode: $match.service?.id
    }
  },

  data() {
    return {
      //
    }
  },

  mounted() {
    store.dispatch(Actions.LOADING_STOP);
  },

  methods: {
    copyCodeToClipboard() {
      navigator.clipboard.writeText(this.$match.service?.id as string);
      this.$q.notify({message: 'Code copied on te clipboard'});
    }
  },
})
</script>

<style lang="scss" scoped>
.room-code-generator {
  .room-code-field {
    padding: 0;
    display: flex;
    margin-bottom: 2rem;

    #room-code{
      flex:1;
      display: flex;
      align-items: center;
      font-size: 2rem;
      padding: 0 1rem;
    }

    p {
      margin: 0;
    }
  }
}
</style>