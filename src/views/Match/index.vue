<template>
    <section class="match-container">
        <router-view></router-view>
    </section>
</template>

<script lang="ts">
import MatchPlugin from '@/plugins/match/types/match-plugin.interface';
import { defineComponent, inject, onUnmounted } from 'vue';

export default defineComponent({
  components: { },
    name:"MatchHome",
    setup(props, context) {
      const $match = inject("match") as MatchPlugin;

      onUnmounted(() => {
        // unsubscribe plugin subscriptions
        $match.subscriptions.forEach((subs) => {
          subs();
        })
      })
    }
})
</script>

<style lang="scss" scoped>
.match-container {
    flex: 1;
    display: flex;
    flex-direction: column;
}
</style>