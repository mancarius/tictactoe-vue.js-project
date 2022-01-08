<template>
    <q-dialog v-model="showModal" :position="'bottom'" @hide="wasHided">
        <card class="user-auth-container">
            <template #title><h6>Sign In</h6></template>
            <p>This is a ligth authentication, just to save your scores in anonimous form.</p>
            <my-button v-if="!waitingForExternalAuth" class="google full" fullWidth @click="login(providers.google)">Sign in with Google</my-button>
            <my-button v-if="!waitingForExternalAuth" class="facebook full" fullWidth @click="login(providers.facebook)">Sign in with Facebook</my-button>
            <div v-else>Waiting for authentication...</div>
        </card>
    </q-dialog>
</template>

<script lang="ts">
import { Provider } from '@/helpers/enums/provider.enum';
import { computed, defineComponent } from 'vue'
import { Store, useStore } from 'vuex'
import MyButton from './MyButton.vue'
import { Actions } from '@/helpers/enums/actions.enum'
import { State } from 'vuex/core';
import Card from './Card.vue';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, FacebookAuthProvider, GoogleAuthProvider, signInWithPopup, Auth } from '@firebase/auth';
import { Mutations } from '@/helpers/enums/mutations.enum';
import { useQuasar } from 'quasar';

export default defineComponent({
  name:"UserAuth",
  components: { MyButton, Card },
  setup() {
    const store: Store<State> = useStore();
    const providers = Provider;
    const { notify } = useQuasar();
    let waitingForExternalAuth = false;

    const showModal = computed({
        get: () => store.state.user.requiredAuth,
        set: (value) => {
            store.dispatch(Actions.USER_REQUIRE_AUTH, value);
          }
      });
    
    const login = async (providerType: Provider) => {
      waitingForExternalAuth = true;
      let auth: Auth | null = null;
      let provider;

      const storageType: "localStorage" | "sessionStorage" = process.env.VUE_APP_AUTH_STORAGE;
      
      try {
        auth = getAuth();
      }
      catch (error) {
        notify({type: 'warning', message: "This function is not available"});
        store.commit(Mutations.USER_REQUIRE_AUTH, false);
        return;
      }

      await setPersistence(
        auth,
        storageType === "localStorage"
          ? browserLocalPersistence
          : browserSessionPersistence
      );

      switch (providerType) {
        case Provider.facebook:
          provider = new FacebookAuthProvider();
          break;
        case Provider.google:
          provider = new GoogleAuthProvider();
          break;
        default:
      }

      if (provider !== undefined) {
        await signInWithPopup(auth, provider)
          .catch((error) => {
            alert(error.message);
            console.error(error);
            notify({type: 'negative', message: "An error occured. Unable to complete sign-in"});
          })
          .finally(() => {
            waitingForExternalAuth = false;
            store.commit(Mutations.USER_REQUIRE_AUTH, false)
          });
      } else {
        console.warn("No provider");
        notify({type: 'warning', message: "No provider"});
      }
    };

    const wasHided = (e: Event) => {
      if( e instanceof MouseEvent ){
        store.dispatch(Actions.USER_LOG_OUT).finally(() => {
          waitingForExternalAuth = false;
        });
      }
    }

    return {
      login,
      wasHided,
      showModal,
      providers,
      waitingForExternalAuth
    }
  },
})
</script>

<style lang="scss" scoped>
.user-auth-container{
  p {
    margin-bottom: 2rem;
  }

  button:not(:last-child) {
    margin-bottom: 1rem;
  }
}

.facebook {
  &.bg-color {
    background-color: #3b5998;
  }

  &.text-color {
    color: #ffffff;
  }

  &.full {
    @extend .bg-color, .text-color;
  }
}

.google {
  &.bg-color {
    background-color: #ffffff;
  }

  &.text-color {
    color: #444444;
  }

  &.full {
    @extend .bg-color, .text-color;
  }
}
</style>