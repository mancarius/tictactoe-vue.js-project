import mutations from "./match.mutations";
import getters from "./match.getters";
import actions from "./match.actions";
import { StoreOptions } from "vuex";

const matchStore: StoreOptions<any> = {
  state: {
    state: null,
    type: null,
    host: null,
    id: null,
    players: [
      {
        displayName: null,
        uid: null,
        imageURL: null,
        score: 0,
        options: {
          sign: null,
          isHost: false,
          customName: "",
        },
      },
      {
        displayName: null,
        uid: null,
        imageURL: null,
        score: 0,
        options: {  
          sign: null,
          isHost: false,
          customName: "",
        },
      },
    ],
    board: {
      configs: {
        rows: 0,
        columns: 0,
        winning_sequence_length: 0
      },
      cellCollection: [],
    },
  },

  getters,

  mutations,

  actions,
};

export default matchStore;