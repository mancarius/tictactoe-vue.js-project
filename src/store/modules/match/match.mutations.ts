import { Mutations } from "@/helpers/enums/mutations.enum";
import { MutationTree } from "vuex";
import { State } from "vuex/core";

const mutations: MutationTree<State['match']> = {
    [Mutations.MATCH_INIT](state, payload) {
        state = { ...state, ...payload };
  },
};

export default mutations;
