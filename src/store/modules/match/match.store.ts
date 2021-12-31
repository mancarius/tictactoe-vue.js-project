import mutations from "./match.mutations";
import getters from "./match.getters";
import actions from "./match.actions";
import { StoreOptions } from "vuex";
import { initialMatchState } from "./initialMatchState";

const matchStore: StoreOptions<any> = {
  state: {...initialMatchState},

  getters,

  mutations,

  actions,
};

export default matchStore;