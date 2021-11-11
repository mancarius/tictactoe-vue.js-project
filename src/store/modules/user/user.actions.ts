import { Provider } from "@/helpers/enums/provider.enum";
import { ActionContext, ActionTree } from "vuex";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "@firebase/auth";
import { Mutations } from "@/helpers/enums/mutations.enum";
import { Actions } from "@/helpers/enums/actions.enum";
import { State } from "vuex/core";

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
      const auth = getAuth();
      await signInWithPopup(auth, provider)
        .then(({ user }) => {
          commit(Mutations.USER_SET, user);
          commit(Mutations.USER_REQUIRE_AUTH, false);
        })
        .catch((error) => {
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
