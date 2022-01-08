import db from "@/helpers/db";
import MatchService from "@/services/match/match.service";
import {
  collection,
  doc,
  DocumentReference,
  onSnapshot,
  query,
  Unsubscribe,
} from "@firebase/firestore";
import { ReplaySubject } from "rxjs";
import { dbReferences } from "../types/match-plugin.interface";

let BASE_PATH = "";

export const dbRef: dbReferences = {
  match: null,
  board: {
    docs: {},
    collection: null,
  },
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
export const setDbReferences = (matchId: MatchService["id"]): Unsubscribe => {
  BASE_PATH = "matches/" + matchId;

  if (!db) {
    throw new Error("Remote server is not configured");
  }

  dbRef.match = doc(db, "matches", matchId);
  dbRef.board.collection = collection(db, BASE_PATH, "board");
  dbRef.players.collection = collection(db, BASE_PATH, "players");

  const playersQuery = query(dbRef.players.collection);
  const playerDocs: any = {};

  const unsubs = onSnapshot(playersQuery, (querySnapshot) => {
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

export const createDocumentRef = (
  collectionName: string,
  docName: string
): DocumentReference => {
  if (BASE_PATH.match(/\S+\/\S+/g)?.length === 1) {
    throw new TypeError("Invalid collection path");
  }

  if (
    typeof collectionName !== "string" ||
    collectionName.trim().length === 0
  ) {
    throw new TypeError("Invalid collection name");
  }

  if (typeof docName !== "string" || docName.trim().length === 0) {
    throw new TypeError("Invalid document name");
  }

  if (!db) {
    throw new Error("Remote server is not configured");
  }

  return doc(db, BASE_PATH, collectionName, docName);
};
