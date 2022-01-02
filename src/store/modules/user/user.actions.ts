import { Provider } from "@/helpers/enums/provider.enum";
import { ActionTree } from "vuex";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  getAuth,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  signOut,
} from "@firebase/auth";
import { Mutations } from "@/helpers/enums/mutations.enum";
import { Actions } from "@/helpers/enums/actions.enum";
import { State } from "vuex/core";
import UserService from "@/services/user.service";

const actions: ActionTree<State["user"], State> = {
  [Actions.USER_REQUIRE_AUTH](
    { commit, state },
    payload = true
  ) {
    if (payload !== state.requiredAuth) {
      commit(Mutations.USER_REQUIRE_AUTH, payload);
    }
  },

  async [Actions.USER_LOG_IN](
    { commit },
    providerType: Provider
  ): Promise<void> {
    let provider;
    const auth = getAuth();

    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch(error: any) {
      throw error;
    }

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
        .then(async ({ user }) => {
          const settings = await UserService.getSettings(user.uid);
          commit(Mutations.USER_SET, { ...user, settings });
          commit(Mutations.USER_REQUIRE_AUTH, false);
        })
        .catch((error) => {
          alert(error.message);
          throw error;
        });
    } else {
      throw new Error("No provider");
    }
  },

  async [Actions.USER_LOG_OUT]({
    commit,
  }): Promise<void> {
    const auth = getAuth();

    await signOut(auth)
      .then(() => commit(Mutations.USER_SET, null))
      .catch((error) => {
        throw error;
      });
  },
};

export default actions;
