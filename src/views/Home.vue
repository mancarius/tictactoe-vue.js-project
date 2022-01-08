<template>
  <section class="home-container">
    <card centerTitle primary>
      <template #title>
        <h6>Start a match vs.</h6>
      </template>
      <template #default>
        <game-mode-select-box/>
      </template>
    </card>
    <div class="divider">OR</div>
    <card centerTitle secondary>
      <template #title>
        <h6>Join a room</h6>
      </template>
      <template #default>
        <join-room-box/>
      </template>
    </card>
  </section>
</template>

<script lang="ts">
import Card from '@/components/Card.vue';
import GameModeSelectBox from '@/components/GameModeSelectBox.vue';
import JoinRoomBox from '@/components/JoinRoomBox.vue';
import { Actions } from '@/helpers/enums/actions.enum';
import store from '@/store';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Home',

  components: {Card, GameModeSelectBox, JoinRoomBox},

  mounted() {
    store.dispatch(Actions.LOADING_STOP);
  }
});
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