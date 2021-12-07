import { Actions } from "@/helpers/enums/actions.enum";
import { Getters } from "@/helpers/enums/getters.enum";
import { Mutations } from "@/helpers/enums/mutations.enum";
import { ActionTree } from "vuex";
import { State } from "vuex/core";

const actions: ActionTree<State["match"], State> = {
  [Actions.MATCH_SAVE_PLAYER_INDEX]: (
    { rootGetters, commit, state },
    match
  ) => {
    if (state.player.index !== -1) return;
    const uid = rootGetters[Getters.USER_DATA].uid;
    const playerIndex = match.getPlayerIndex(uid);
    commit(Mutations.MATCH_SAVE_PLAYER_INDEX, playerIndex);
  },

  [Actions.MATCH_SAVE_OPPONENT_INDEX]: (
    { rootGetters, commit, state },
    match
  ) => {
    if (state.opponent.index !== -1) return;
    const uid = rootGetters[Getters.USER_DATA].uid;
    const opponentIndex = match.getOpponentIndex(uid);
    commit(Mutations.MATCH_SAVE_PLAYER_INDEX, opponentIndex);
  },

  [Actions.MATCH_SET_STATE]: ({ commit }, payload) => {
    if (payload !== undefined) {
      commit(Mutations.MATCH_SET_STATE, payload);
    }
  },

  [Actions.PLAYER_SET_STATE]: ({ commit }, payload) => {
    if (payload !== undefined) {
      commit(Mutations.PLAYER_SET_STATE, payload);
    }
  },

  [Actions.OPPONENT_SET_STATE]: ({ commit }, payload) => {
    if (payload !== undefined) {
      commit(Mutations.OPPONENT_SET_STATE, payload);
    }
  },
};

export default actions;
