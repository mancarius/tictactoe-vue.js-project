import mutations from "./user.mutations";
import actions from "./user.actions";
import getters from "./user.getters";

export const userStore = {
  state: {
    data: null,
    requiredAuth: false,
  },

  getters,

  mutations,

  actions
  
};