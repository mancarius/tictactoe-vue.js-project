import db from "@/helpers/db";
import MatchService from "@/services/match.service";
import { collection, doc, onSnapshot, query, Unsubscribe } from "@firebase/firestore";
import { ReplaySubject } from "rxjs";
import { dbReferences } from "../types/match-plugin.interface";

export const dbRef: dbReferences = {
  match: null,
  board: null,
  players: {
    docs: new ReplaySubject(),
    collection: null,
  },
};

/**
 *
 *
 * @param {MatchPlugin['id']} target
 * @param {*} p
 * @param {string} value
 * @param {*} receiver
 * @return {*}
 */
export const setDbReferences = (value: MatchService["id"]): Unsubscribe => {
  dbRef.match = doc(db, "matches", value);
  dbRef.board = doc(db, "matches/" + value + "/board", "_");
  dbRef.players.collection = collection(db, "matches/" + value + "/players");

  const q = query(dbRef.players.collection);
  const playerDocs: any = {};

  const unsubs = onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      playerDocs[doc.data().uid] = doc.ref;
      dbRef.players.docs.next(playerDocs);
    });

    if (querySnapshot.size === 2) {
      unsubs();
    }
  });

  return unsubs;
};
