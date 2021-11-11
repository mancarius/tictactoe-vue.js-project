import { Actions } from "@/helpers/enums/actions.enum";
import { Mutations } from "@/helpers/enums/mutations.enum";
import { ActionContext } from "vuex";

const actions = {
  [Actions.STATE_INIT]: ({ commit, state }: ActionContext<any, any>) => {
    const storageType: "localStorage" | "sessionStorage" =
      process.env.VUE_APP_STATE_STORAGE;
    const storage = window[storageType] as Storage;
    const storedState = storage.getItem("APP_STATE");

    if (storedState !== null) {
      const { user } = JSON.parse(storedState);

      user.requiredAuth = false;

      commit(Mutations.STATE_UPDATE, { ...state, user });
    }
  },
};

export default actions;
