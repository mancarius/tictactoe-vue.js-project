import { Mutations } from "@/helpers/enums/mutations.enum";
import { MutationTree } from "vuex";
import { State } from "vuex/core";
import { initialMatchState } from "./initialMatchState";

const mutations: MutationTree<State["match"]> = {
  [Mutations.MATCH_SAVE_PLAYER_INDEX](state, payload) {
    state.player.index = payload;
  },

  [Mutations.MATCH_SAVE_OPPONENT_INDEX](state, payload) {
    state.opponent.index = payload;
  },

  [Mutations.MATCH_SET_STATE](state, payload) {
    if (state.state !== payload) state.state = payload;
  },

  [Mutations.PLAYER_SET_STATE](state, payload) {
    if (state.player.state !== payload) state.player.state = payload;
  },

  [Mutations.OPPONENT_SET_STATE](state, payload) {
    if (state.opponent.state !== payload) state.opponent.state = payload;
  },

  [Mutations.MATCH_EXIT](state) {
    for (const [key, value] of Object.entries(initialMatchState)) {
      state[key] = value;
    }
  },
};

export default mutations;
