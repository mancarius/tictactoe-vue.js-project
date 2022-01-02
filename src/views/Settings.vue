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
            <q-item-label>Custom name</q-item-label>
            <q-item-label caption>{{customName || 'Customize the name to show in game'}}</q-item-label>
            <q-popup-edit 
              v-model="customName" 
              buttons 
              persistent 
              title="Customize your name" 
              v-slot="scope">
              <q-input v-model="scope.value" autofocus counter @keyup.enter="scope.set" />
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
    let customName: Ref<string | null> = ref(null);

    watch(customName, (next, prev) => {
      if( next ) {
        UserService.saveSettings(userId, {'customName': next}).catch(error => {
          console.error(error);
          notify("Failed to save the custom name.")
          customName.value = prev;
        });
      }
    });

    onMounted( () => {
      UserService.getSettings(userId).then(settings => {
        if(settings?.customName){
          customName.value = settings.customName as string;
        }
      });
    });

    return {
      customName,
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