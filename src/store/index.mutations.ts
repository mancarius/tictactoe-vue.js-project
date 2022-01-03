import { Mutations } from "@/helpers/enums/mutations.enum";
import { MutationTree } from "vuex";
import { State } from "vuex/core";
import store from ".";

const mutations: MutationTree<State> = {
  [Mutations.STATE_UPDATE]: (state, payload: State) => {
    store.replaceState(
      Object.assign(state, payload)
    );
  },
};

export default mutations;
