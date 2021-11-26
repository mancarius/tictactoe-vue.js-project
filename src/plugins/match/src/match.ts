import db from "@/helpers/db";
import { MatchTypes } from "@/helpers/enums/match-types.enum";
import { PlayerStates } from "@/helpers/enums/player-states.enum";
import MatchService from "@/services/match.service";
import MatchPlugin, {
  MatchPluginOptions,
} from "@/plugins/match/types/match-plugin.interface";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "@firebase/firestore";
import { dbRef, setDbReferences } from "./dbReferences";
import _ from "lodash";
import removeObservables from "@/helpers/removeObservables";
import { MatchStates } from "@/helpers/enums/match-states.enum";

export const defaultOptions: MatchPluginOptions = {
  storage: "localStorage",
};

export const match: MatchPlugin = {
  options: defaultOptions,

  uid: null,

  service: null,

  subscriptions: [],

  /**
   * Create local match service. If match type is PvP, register the match on remote db
   * @param matchType
   * @param boardConfigs
   * @returns {Promise<Match["id"]>}
   */
  async create(user, matchType, boardConfigs = {}) {
    if (!user || !matchType) throw new TypeError("Invalid props received");
    const storage = window[this.options.storage] as Storage;
    const storedMatch = storage.getItem("MATCH_KEY");
    // loads stored match or creates new
    if (storedMatch !== null && matchType === MatchTypes.PLAYER_VS_PLAYER) {
      if (!(this.service instanceof MatchService)) {
        this.service = new MatchService([user], matchType, boardConfigs);
        const subs = setDbReferences(this.service.id);
        this.subscriptions.push(subs);
      }
      return storedMatch;
    }

    this.service = new MatchService([user], matchType, boardConfigs);

    if (!(this.service instanceof MatchService)) {
      throw new Error("Invalid instance created");
    }

    this.service.getPlayer(user.uid).options.isOwner = true;

    if (this.service.type === MatchTypes.PLAYER_VS_PLAYER) {
      const afs_subscriptions = setDbReferences(this.service.id);
      this.subscriptions.push(afs_subscriptions);

      if (!dbRef.match || !dbRef.board || !dbRef.players.collection)
        throw new Error("Some Document Reference missing");

      let { players, board, ...match } = this.service;

      match = {
        ...(match as any),
        _createdAt: Timestamp.now(),
      };

      board = { ...(board as any) };

      players = players.map((player) => ({
        ...(player as any),
      }));

      const batch = writeBatch(db);

      batch.set(dbRef.match, removeObservables(match));

      players.forEach((player) => {
        const docRef = doc(dbRef.players.collection!, "player_" + player.uid);
        batch.set(docRef, removeObservables(player));
      });

      batch.set(dbRef.board, removeObservables(board));

      try {
        await batch.commit();
        storage.setItem("MATCH_ID", this.service.id);
      } catch (err) {
        console.error(err);
      }

      this._subscribeRemote();
      this._subscribeLocal().match();
      this._subscribeLocal().board();
      this._subscribeLocal().player(user.uid);
    }

    return this.service.id;
  },

  /**
   *
   * @param id
   * @returns
   */
  async find(id) {
    const matchRef = doc(db, "matches", id);
    const matchSnap = await getDoc(matchRef);
    const match = matchSnap.data();

    const path = "matches/" + id;

    const boardRef = doc(db, path + "/board", "_");
    const boardSnap = await getDoc(boardRef);
    const board = boardSnap.data();

    const playersRef = collection(db, path + "/players");
    const q = query(playersRef);
    const playersSnap = await getDocs(q);
    const players = playersSnap.docs.map((doc) => doc.data());

    return { ...match, board, players };
  },

  /**
   * Add player to existing match and register it on remote db.
   * @param matchId
   * @param user
   * @returns
   */
  async join(matchId, user) {
    if (!user) throw new Error("Bad user");

    if (!this.service || this.service.id !== matchId)
      throw new Error("Bad room code");

    try {
      const player = {
        ...this.service.join(user).toObject(),
      };

      const path = "matches/" + matchId + "/players";
      const name = "player_" + user.uid;

      const docRef = doc(db, path, name);

      await setDoc(docRef, player);

      const subs = setDbReferences(this.service.id);
      this.subscriptions.push(subs);

      this._subscribeRemote();
      this._subscribeLocal().match();
      this._subscribeLocal().board();
      this._subscribeLocal().player(user.uid);

      return;
    } catch (error: any) {
      console.warn(error.message);
      throw error;
    }
  },

  /**
   *
   * @param userId
   * @returns
   */
  async exit(uid) {
    if (!(this.service instanceof MatchService)) return;
    const player = this.service?.getPlayer(uid);
    player.state = PlayerStates.disconnected;
  },

  /**
   *
   *
   * @param {*} uid
   * @return {*}
   */
  get player() {
    if (this.service instanceof MatchService && this.uid)
      return this.service.getPlayer(this.uid);
    else return null;
  },

  /**
   *
   *
   * @param {*} uid
   * @return {*}
   */
  getPlayerIndex(uid) {
    if (this.service instanceof MatchService)
      return this.service.players.findIndex((player) => player.uid === uid);
    else throw new Error("Match not valid");
  },

  /**
   *
   *
   * @param {*} uid
   * @return {*}
   */
  get opponent() {
    if (this.service instanceof MatchService && this.uid)
      return this.service.players.filter(
        (player) => player.uid !== this.uid
      )[0];
    else return null;
  },

  /**
   *
   *
   * @param {*} uid
   * @return {*}
   */
  getOpponentIndex(uid) {
    if (this.service instanceof MatchService)
      return this.service.players.findIndex((player) => player.uid !== uid);
    else throw new Error("Match not valid");
  },

  /**
   *
   */
  _subscribeRemote() {
    if (!this.service) throw new Error("Found invalid service");

    if (!dbRef.match || !dbRef.board || !dbRef.players.collection)
      throw new Error("Some Document Reference missing");

    const opponentQuery = query(
      dbRef.players.collection,
      where("uid", "!=", this.uid)
    );
    // match subscribtion
    const matchUnsubs = onSnapshot(
      dbRef.match,
      (doc) => {
        this.service?.sync(doc.data());
      },
      (error) => {
        console.error(error.message);
      }
    );
    // board subscription
    const boardUnsubs = onSnapshot(
      dbRef.board,
      (doc) => {
        this.service?.board.sync(doc.data());
      },
      (error) => {
        console.error(error.message);
      }
    );
    // players subscription
    const opponentUnsubs = onSnapshot(
      opponentQuery,
      (snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          const playerIndex = this.getPlayerIndex(data.uid);
          if (playerIndex !== -1) {
            this.service?.players[playerIndex].sync(data);
          } else {
            const { uid, displayName, photoURL, options } = data;
            this.service?.join({ uid, displayName, photoURL }, options ?? {});
          }
        });
      },
      (error) => {
        console.error(error.message);
      }
    );

    this.subscriptions = [matchUnsubs, boardUnsubs, opponentUnsubs];
  },

  /**
   *
   */
  _subscribeLocal() {
    if (!dbRef.match || !dbRef.board || !dbRef.players.docs)
      throw new Error("Some Document Reference missing");

    return {
      // match subscription
      match: () => {
        if (this.service) {
          this.service.subscribe((data) => {
            dbRef.match && updateDoc(dbRef.match, data);
          });
        }
      },

      // board subscription
      board: () => {
        this.service?.board.subscribe((data) => {
          updateDoc(dbRef.board!, data);
        });
      },

      // player subscription
      player: (uid) => {
        if (this.service) {
          dbRef.players.docs.subscribe((doc) => {
            const docRef = doc[uid];
            if (docRef) {
              const playerIndex = this.getPlayerIndex(uid);
              this.service?.players[playerIndex].subscribe((data: any) => {
                updateDoc(docRef, data);
              });
            }
          });
        }
      },
    };
  },

  /**
   *
   *
   */
  setFirstMove() {
    if (this.service instanceof MatchService) {
      const index = _.shuffle([0, 1])[0];
      this.service.players[index].state =
        PlayerStates.waiting_for_opponent_move;
    } else {
      throw new Error("Bad match service");
    }
  },
};
