<template>
    <header v-if="visible">
        <div></div>
        <div class="title-container">
            <base-app-title/>
        </div>
        <div>
          <q-btn v-if="isUserAuthed" class="browser-default" round>
            <base-avatar :src="user.photoURL" class="dontApplyDark" />
            <q-menu :offset="[0, 10]">
              <q-list separator>
                <q-item clickable v-ripple v-close-popup to="/account/settings" exact>
                  <q-item-section>Settings</q-item-section>
                  <q-item-section avatar>
                    <q-icon name="fas fa-cog" size="xs" />
                  </q-item-section>
                  
                </q-item>
                <q-item clickable v-ripple v-close-popup @click="logout">
                  <q-item-section>Disconnect</q-item-section>
                  <q-item-section avatar>
                    <q-icon name="fas fa-sign-out-alt" size="xs" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
    </header>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import BaseAppTitle from '@/components/BaseAppTitle.vue';
import store from '@/store';
import { Getters } from '@/helpers/enums/getters.enum';
import User from '@/types/user.interface';
import { useRoute } from 'vue-router';
import { Routes } from '@/helpers/enums/routes.enum';
import { getAuth, signOut } from '@firebase/auth';
import BaseAvatar from './BaseAvatar.vue';


export default defineComponent({
  name: "PageHeader",

  components: {BaseAppTitle, BaseAvatar},

  setup() {
    const route = useRoute();
    const visible = ref(true);

    watch(() => route.name, (nextRoute) => {
      visible.value = nextRoute !== Routes.game;
    });

    return {
      visible
    }
  },

  data() {
    return {}
  },

  methods: {
    async logout() {
      const auth = getAuth();

    await signOut(auth)
      .catch((error) => {
        throw error;
      });
    }
  },

  computed: {
    isUserAuthed: (): boolean => store.getters[Getters.USER_IS_AUTHED],

    user: (): User => store.getters[Getters.USER_DATA]
  }
})
</script>

<style lang="scss" scoped>
    header {
        display: grid;
        grid-template-columns: 1fr 4fr 1fr;
        align-items: center;
        gap: 1rem;
        position:sticky;
        top:0;
        z-index: 100;
        background-color: #ffffff;

        & > div {
            display: flex;

            &:first-child {
                justify-content: start;
            }

            &.title-container {
                justify-content: center;
            }

            &:last-child {
                justify-content: end;
            }
        }

    }
</style>