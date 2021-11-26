import mutations from "./match.mutations";
import getters from "./match.getters";
import actions from "./match.actions";
import { StoreOptions } from "vuex";
import { MatchStates } from "@/helpers/enums/match-states.enum";
import { PlayerStates } from "@/helpers/enums/player-states.enum";

const matchStore: StoreOptions<any> = {
  state: {
    state: MatchStates.dormiant,
    player: {
      state: PlayerStates.none,
    },
    opponent: {
      state: PlayerStates.none,
    },
    exit: false,
  },

  getters,

  mutations,

  actions,
};

export default matchStore;