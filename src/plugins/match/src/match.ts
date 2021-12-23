import db from "@/helpers/db";
import { MatchTypes } from "@/helpers/enums/match-types.enum";
import { PlayerStates } from "@/helpers/enums/player-states.enum";
import MatchService from "@/services/match/match.service";
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
import PlayerService from "@/services/player.service";
import BoardService from "@/services/board.service";

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

      if (!dbRef.match || !dbRef.board.collection || !dbRef.players.collection)
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

      for (const [name, value] of Object.entries(removeObservables(board))) {
        batch.set(doc(dbRef.board.collection, name), { name, value });
      }

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
  async find(id): Promise<Partial<MatchService> | null> {
    if (typeof id !== "string") {
      throw new TypeError("Expected a 'string' but received " + typeof id);
    } else if (id.trim().length === 0) {
      throw new Error("Received an empty string");
    }

    const matchRef = doc(db, "matches", id);
    const matchSnap = await getDoc(matchRef);
    const match = matchSnap.data() as Partial<MatchService>;

    if (
      !match ||
      match.state === MatchStates.terminated ||
      match.state === MatchStates.closed_by_owner
    ) {
      return null;
    }

    const path = "matches/" + id;

    const boardRef = collection(db, path, "board");
    const boardQuery = query(boardRef);
    const boardSnap = await getDocs(boardQuery);
    const board: BoardService = Object.create(null);
    boardSnap.docs.forEach((doc) => {
      const { name, value }: { [key: string]: any } = doc.data();
      Reflect.set(board, name, value);
    });

    const playersRef = collection(db, path + "/players");
    const playersQuery = query(playersRef);
    const playersSnap = await getDocs(playersQuery);
    const players = playersSnap.docs.map((doc) => doc.data() as PlayerService);

    if (board !== undefined) {
      return { ...match, board, players };
    } else throw new TypeError("Invalid board type received");
  },

  /**
   * Add player to existing match and register it on remote db.
   * @param matchId
   * @param user
   * @returns
   */
  async join(matchId, user): Promise<void> {
    if (!user) throw new Error("Bad user");

    const match = await this.find(matchId);

    if (!match) throw new Error("Room not avilable");

    this.service = MatchService.create(match);

    if (!this.service || this.service.id !== matchId)
      throw new Error("Bad room code");

    try {
      const player = {
        ...this.service.join(user).toObject(),
      };

      this.uid = player.uid;

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
  async exit(uid): Promise<void> {
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
  get player(): PlayerService | null {
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
  getPlayerIndex(uid): number {
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
  get opponent(): PlayerService | null {
    if (this.service instanceof MatchService && this.uid)
      return this.service.getOpponent(this.uid);
    else return null;
  },

  /**
   *
   *
   * @param {*} uid
   * @return {*}
   */
  getOpponentIndex(uid): number {
    if (this.service instanceof MatchService)
      return this.service.players.findIndex((player) => player.uid !== uid);
    else throw new Error("Match not valid");
  },

  /**
   *
   */
  _subscribeRemote(): void {
    if (!this.service) throw new Error("Found invalid service");

    if (!dbRef.match || !dbRef.board.collection || !dbRef.players.collection)
      throw new Error("Some Document Reference missing");

    // board subscription
    const boardUnsubs = onSnapshot(
      query(
        dbRef.board.collection,
        where("name", "in", ["_cellCollection", "lastUpdatedCells"])
      ),
      { includeMetadataChanges: true },
      (docs) => {
        docs.docChanges().forEach(({ doc }) => {
          const { name, value } = doc.data();
          this.service?.board.sync({ [name]: value });
        });
      },
      (error) => {
        console.error(error.message);
      }
    );
    // opponent subscription
    const opponentQuery = query(
      dbRef.players.collection,
      where("uid", "!=", this.uid)
    );

    const opponentUnsubs = onSnapshot(
      opponentQuery,
      (snapshot) => {
        snapshot.forEach((doc) => {
          const {score, shuffleBuffer, canShuffle, lastMoveTimestamp, ...data} = doc.data();
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

    this.subscriptions = [boardUnsubs, opponentUnsubs];
  },

  /**
   *
   */
  _subscribeLocal() {
    if (!dbRef.match || !dbRef.board.collection || !dbRef.players.docs)
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
        this.service?.board.subscribe(
          (data: Partial<BoardService> | undefined) => {
            if (data === undefined) return;

            if (dbRef.board.collection) {
              const batch = writeBatch(db);
              for (const [name, value] of Object.entries(data)) {
                console.log("[send]", name, value);
                batch.update(doc(dbRef.board.collection, name), { value });
              }
              batch.commit();
            } else {
              console.warn("Invalid board collection");
            }
          }
        );
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

  /**
   *
   *
   */
  reset() {
    this.service?.reset();
  },
};
