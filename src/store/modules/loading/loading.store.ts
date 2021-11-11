import * as Loading from "@/types/loading.interface";
import { ActionContext } from "vuex";
import { Actions } from "@/helpers/enums/actions.enum";
import { State } from "vuex/core";

export const loadingStore = {
  state: {
    active: false,
    message: "",
  },
  getters: {
    loading: (state: State["loading"]): Loading.default => {
      const message = state.message || "Please wait...";
      return { ...state, message };
    },
  },
  mutations: {
    loadingOpen(state: State["loading"], payload: Loading.message) {
      state.active = true;
      state.message = payload;
    },
    loadingClose(state: State["loading"], payload: Loading.message) {
      state.active = false;
    },
  },
  actions: {
    [Actions.LOADING_START](
      { commit }: ActionContext<any, any>,
      message: Loading.message
    ): void {
      commit("loadingOpen", message);
    },
    [Actions.LOADING_STOP]({ commit }: ActionContext<any, any>): void {
      commit("loadingClose", { active: false });
    },
  },
};
