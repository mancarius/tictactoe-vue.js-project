import db from "@/helpers/db";
import { MatchTypes } from "@/helpers/enums/match-types.enum";
import { PlayerStates } from "@/helpers/enums/player-states.enum";
import MatchService from "@/services/match.service";
import PlayerService from "@/services/player.service";
import MatchPlugin, { MatchPluginOptions } from "@/plugins/match/types/match-plugin.interface";
import User from "@/types/user.interface";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "@firebase/firestore";
import { dbRef, setDbReferences } from "./dbReferences";

export const defaultOptions: MatchPluginOptions = {
  storage: "localStorage",
};

export const match: MatchPlugin = {
  options: defaultOptions,

  service: null,

  subscriptions: [],

  /**
   *
   * @param matchType
   * @param boardConfigs
   * @returns
   */
  async create(user, matchType, boardConfigs = {}) {
    const storage = window[this.options.storage] as Storage;
    const storedMatch = storage.getItem("MATCH_KEY");

    if (storedMatch !== null) {
      if (!(this.service instanceof MatchService)) {
        this.service = new MatchService([user], matchType, boardConfigs);
        const subs = setDbReferences(this.service.id);
        this.subscriptions.push(subs);
      }
      return storedMatch;
    }

    if (this.service === null) {
      this.service = new MatchService([user], matchType, boardConfigs);

      if (!(this.service instanceof MatchService))
        throw new Error("Invalid instance created");

      if (this.service.type === MatchTypes.PLAYER_VS_PLAYER) {
        const subs = setDbReferences(this.service.id);
        this.subscriptions.push(subs);

        if (!dbRef.match || !dbRef.board || !dbRef.players.collection)
          throw new Error("Some Document Reference missing");

        let { players, board, ...match } = this.service;

        match = {
          _createdAt: Timestamp.now(),
          _lastUpdate: serverTimestamp(),
          ...(match as any),
        };

        board = { ...(board as any), _lastUpdate: serverTimestamp() };

        players = players.map((player) => ({
          ...(player as any),
          _lastUpdate: serverTimestamp(),
        }));

        const batch = writeBatch(db);

        batch.set(dbRef.match, { ...match });

        players.forEach((player) => {
          const docRef = doc(dbRef.players.collection!, "player_" + player.uid);
          batch.set(docRef, { ...player });
        });

        batch.set(dbRef.board, { ...board });

        try {
          await batch.commit();
          storage.setItem("MATCH_ID", this.service.id);
        } catch (err) {
          console.log(err);
        }

        this._subscribeRemote();
        this._subscribeLocal();

        return this.service.id;
      } else return "bot";
    } else {
      if (!(this.service instanceof MatchService))
        throw new Error("Invalid instance found");
      return this.service.id;
    }
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
   *
   * @param matchId
   * @param user
   * @returns
   */
  async join(matchId, user) {
    if (!user) throw new Error("Invalid user");

    if (!this.service || this.service.id !== matchId)
      throw new Error("Invalid room code");

    try {
      const player = { ...this.service.join(user) };
      const data = {
        ...player,
        _lastUpdate: serverTimestamp(),
      };
      const path = "matches/" + matchId + "/players";
      const name = "player_" + user.uid;

      const docRef = doc(db, path, name);

      await setDoc(docRef, data);

      const subs = setDbReferences(this.service.id);
      this.subscriptions.push(subs);

      this._subscribeRemote();
      this._subscribeLocal();

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
  async exit(userId) {
    if (!(this.service instanceof MatchService)) return;
    const player = this.service?.getPlayer(userId);
    player.state = PlayerStates.disconnected;
  },

  /**
   *
   * @param id Match id
   */
  _subscribeRemote() {
    if (!this.service) throw new Error("Found invalid service");

    if (!dbRef.match || !dbRef.board || !dbRef.players.collection)
      throw new Error("Some Document Reference missing");

    const playersQuery = query(dbRef.players.collection);
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
    const playersUnsubs = onSnapshot(
      playersQuery,
      (snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          const player = this.service?.getPlayer(data.uid);
          if (player instanceof PlayerService) player.sync(data);
          else {
            const opponent = this.service?.join(data as User);
            console.log(opponent)
            if (opponent instanceof PlayerService) {
              this._subscribeLocal();
            }
          }
        });
      },
      (error) => {
        console.error(error.message);
      }
    );

    this.subscriptions = [matchUnsubs, boardUnsubs, playersUnsubs];
  },

  /**
   *
   */
  _subscribeLocal() {
    if (!dbRef.match || !dbRef.board || !dbRef.players)
      throw new Error("Some Document Reference missing");
    // match subscription
    this.service?.subscribe((data) => {
      updateDoc(dbRef.match!, data);
    });

    // board subscription
    this.service?.board.subscribe((data) => {
      updateDoc(dbRef.board!, data);
    });

    // player subscription
    this.service?.players.forEach((player) => {
      player.subscribe((data) => {
        updateDoc(dbRef.players.docs[player.uid], data);
      });
    });
  },
};


