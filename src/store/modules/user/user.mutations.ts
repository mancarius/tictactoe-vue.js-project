import { Mutations } from "@/helpers/enums/mutations.enum";
import User from "@/types/user.interface";
import { MutationTree } from "vuex";
import { State } from "vuex/core";

const mutations: MutationTree<State['user']> = {
  [Mutations.USER_SET](state, payload: User) {
    state.data = payload;
  },

  [Mutations.USER_REQUIRE_AUTH](state, payload: boolean) {
    state.requiredAuth = payload;
  },
};

export default mutations;