import { Getters as Getter } from "@/helpers/enums/getters.enum";
import User from "@/types/user.interface";
import { GetterTree } from "vuex";
import { State } from "vuex/core";

const getters: GetterTree<State["user"], State> = {
  [Getter.USER_DATA](state): User["uid"] {
    return state.data || { uid: "player", displayName: "You", photoURL: "" };
  },

  [Getter.USER_IS_AUTHED](state): boolean {
    return state.data !== null;
  },
};

export default getters;
