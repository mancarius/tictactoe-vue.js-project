import { ActionTree } from "vuex";
import {
  getAuth,
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
};

export default actions;
