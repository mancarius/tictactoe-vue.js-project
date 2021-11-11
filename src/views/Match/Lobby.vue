<template>
    <status-bar/>
</template>


<script lang="ts">
import StatusBar from '@/components/match/StatusBar.vue';
import { Actions } from '@/helpers/enums/actions.enum';
import { Getters } from '@/helpers/enums/getters.enum';
import { useMatch } from '@/plugins/match';
import store from '@/store';
import { defineComponent, onMounted } from 'vue'
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
    name: "Lobby",

    components: {StatusBar},

    beforeRouteEnter(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
      next(async vm => {
        const matchId = vm.$route.params.matchId as string;
        const user = store.getters[Getters.USER_DATA];
        
        switch (from.name) {
          case 'Home':
            try {
              await vm.$match.join(matchId, user);
              return;
            } catch(error: any) {
              console.error(error);
              vm.$q.notify({message: "Oh God! Something horrible has appened!"});
              return false;
            }
          case 'RoomCode':
            return;
          default:
            return false;
        }
      });
    },

    setup() {
      const match = useMatch();
      console.log(match.service?.id);

      onMounted(() => {
        store.dispatch(Actions.LOADING_STOP);
      })
       
    },
})
</script>


<style lang="scss" scoped>

</style>