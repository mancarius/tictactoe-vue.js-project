<template>
  <section class="home-container">
    <base-card centerTitle primary>
      <template #title>
        <h6>Start a match vs.</h6>
      </template>
      <template #default>
        <game-mode-select-box/>
      </template>
    </base-card>
    <div class="divider">OR</div>
    <base-card centerTitle secondary>
      <template #title>
        <h6>Join a room</h6>
      </template>
      <template #default>
        <join-room-box/>
      </template>
    </base-card>
  </section>
</template>

<script lang="ts">
import BaseCard from '@/components/BaseCard.vue';
import GameModeSelectBox from '@/components/GameModeSelectBox.vue';
import JoinRoomBox from '@/components/JoinRoomBox.vue';
import { Actions } from '@/helpers/enums/actions.enum';
import store from '@/store';

export default {
  name: 'PageHome',

  components: {BaseCard, GameModeSelectBox, JoinRoomBox},

  mounted() {
    store.dispatch(Actions.LOADING_STOP);
  }
};
</script>

<style lang="scss" scoped>
.home-container{
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0 auto;
  max-width: 21rem;
  width: 100%;

  .divider{
    text-align: center;
  }
}
</style>