<template>
  <section class="settings-container">
    <div class="actions">
      <button class="back-btn" @click="router.back()">
        <q-icon name="fas fa-chevron-left" />
        back
      </button>
    </div>
    <h2>Settings</h2>
    <div>
      <q-list padding bordered>
        <q-item-label header>User Preferences</q-item-label>
        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>Nickname</q-item-label>
            <q-item-label caption>{{nickname || 'Customize the name to show in game'}}</q-item-label>
            <q-popup-edit 
              v-model="nickname" 
              buttons 
              persistent 
              title="Edit the Nickname" 
              v-slot="scope">
              <q-input v-model="scope.value" class="browser-default" autofocus counter @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </section>
</template>




<script lang="ts">
import { Getters } from '@/helpers/enums/getters.enum';
import UserService from '@/services/user.service';
import { useQuasar } from 'quasar';
import { defineComponent, onMounted, Ref, ref, watch } from 'vue'
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  name: "Settings",

  setup() {
    const store = useStore();
    const router = useRouter();
    const { notify } = useQuasar();
    const userId = store.getters[Getters.USER_DATA].uid;
    let nickname: Ref<string | null> = ref(null);

    watch(nickname, (next, prev) => {
      console.log('nickname changed:', next);
      if( next ) {
        UserService.saveSettings(userId, {'nickname': next}).catch(error => {
          console.error(error);
          notify("Failed to save the nickname.")
          nickname.value = prev;
        });
      }
    });

    onMounted( () => {
      UserService.getSettings(userId).then(settings => {
        if(settings?.nickname){
          nickname.value = settings.nickname as string;
        }
      });
    });

    return {
      nickname,
      router,

    }
  },
})
</script>





<style lang="scss" scoped>
.actions {
  display: flex;

  .back-btn {
    width: 100%;
    text-align: left;
    box-shadow: none;
    text-transform: uppercase;
  }
}
button, input {
  box-shadow: none !important;
}
</style>