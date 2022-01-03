import syncStateToStorage from "@/plugins/vuex/syncStoreInLocalStorage";
import { createStore } from "vuex";
import { loadingStore } from "./modules/loading/loading.store";
import { userStore } from "./modules/user/user.store";
import actions from "./index.actions";
import mutations from "./index.mutations";
import matchStore from "./modules/match/match.store";

export default createStore({

  mutations,

  actions,

  modules: {
    loading: loadingStore,
    user: userStore,
    match: matchStore
  },
  plugins: [syncStateToStorage]
});