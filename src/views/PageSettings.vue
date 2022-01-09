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
              color="accent"
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
import db from '@/helpers/db';
import { Getters } from '@/helpers/enums/getters.enum';
import { Mutations } from '@/helpers/enums/mutations.enum';
import User from '@/types/user.interface';
import { collection, doc, setDoc } from '@firebase/firestore';
import { useQuasar } from 'quasar';
import { Ref, ref, watch } from 'vue'
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: "PageSettings",

  setup() {
    const store = useStore();
    const router = useRouter();
    const { notify } = useQuasar();
    const user = store.getters[Getters.USER_DATA];
    const { settings } = user;
    const customName: Ref<string | null> = ref(null);

    if(settings?.customName){
      customName.value = settings.customName as string;
    }

    watch(customName, (next, prev) => {
      if( next ) {
        saveUserSettings(user.uid, {'customName': next})
          .then(() => {
            store.commit(Mutations.USER_SET, { ...user, settings: { customName: next } })
          })
          .catch(error => {
            console.error(error);
            notify("Failed to save the custom name.")
            customName.value = prev;
          });
      }
    });

    async function saveUserSettings(uid: User['uid'], settings: User['settings']) {
      if(db) {
        const collectionRef = collection(db, "users_settings");
        const docRef = doc(collectionRef, uid);
        return await setDoc(docRef, settings);
      } else {
        throw new Error("Remote server is not configured");
      }
    }

    return {
      customName,
      router,

    }
  },
}
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