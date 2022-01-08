<template>
  <page-header></page-header>
  <main class="main-container">
    <router-view v-slot="{Component}">
      <component :is="Component"></component>
    </router-view>
  </main>
  <page-footer></page-footer>
  <!-- Loader spinner -->
  <page-loading />
  <!-- User Auth -->
  <user-auth />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageHeader from './components/PageHeader.vue'
import PageLoading from './components/PageLoading.vue'
import UserAuth from './components/UserAuth.vue'
import { Actions } from './helpers/enums/actions.enum'
import store from './store'
import { Auth, getAuth } from "firebase/auth";
import { useStore } from 'vuex'
import { Mutations } from './helpers/enums/mutations.enum'
import User from './types/user.interface'
import db from './helpers/db'
import { collection, doc, getDoc } from '@firebase/firestore'
import { useRouter } from 'vue-router'
import PageFooter from './components/PageFooter.vue'

export default defineComponent({
  components: { PageHeader, PageLoading, UserAuth, PageFooter },
  name: 'App',

  setup() {
    const store = useStore();
    const router = useRouter();
    let auth: Auth;

    try {
      auth = getAuth();

      auth?.onAuthStateChanged(async user => {
        if(user) {
          const settings = await getUserSettings(user.uid);
          store.commit(Mutations.USER_SET, { ...user, settings });
        } else {
          store.commit(Mutations.USER_SET, null);
          router.push({name: "Home",  params:{isRedirect: 1}})
        }
      }, (error) => {
        console.warn(error)
      });
    } catch (error) {
      console.log(error);
    }

    async function getUserSettings(uid: User['uid']) {
      if(!db) {
        return {};
      }
      const collectionRef = collection(db, "users_settings");
      const docRef = doc(collectionRef, uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as User["settings"]) : {};
    }
  },

  beforeCreate() {
    store.dispatch(Actions.STATE_INIT);
  },
})
</script>

<style lang="scss" scope>
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 400px;
    width: 100%;
    margin: 0 auto;
  }
  
  footer {
    display: flex;
    justify-content: center;
  }
</style>