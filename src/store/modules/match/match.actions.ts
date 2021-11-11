import db from "@/helpers/db";
import { Actions } from "@/helpers/enums/actions.enum";
import { MatchTypes } from "@/helpers/enums/match-types.enum";
import { Mutations } from "@/helpers/enums/mutations.enum";
import { addDoc, Timestamp, doc, collection} from "@firebase/firestore";
import { ActionTree } from "vuex";
import { State } from "vuex/core";

const actions: ActionTree<State["match"], State> = {
  async [Actions.MATCH_CREATE]({ commit, state }, match: any): Promise<void> {
    if (match.type === MatchTypes.PLAYER_VS_PLAYER) {
      match = { ...match, createdAt: Timestamp.now() };
      const collectionRef = collection(db, "matches");
      await addDoc(collectionRef, match)
        .then(() => {
          commit(Mutations.MATCH_INIT, match);
        })
        .catch((error) => {
          throw error;
        });
    } else {
      commit(Mutations.MATCH_INIT, match);
    }
  },
};

export default actions;