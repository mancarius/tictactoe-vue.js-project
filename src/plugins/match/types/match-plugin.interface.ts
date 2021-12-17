import { MatchStates } from "@/helpers/enums/match-states.enum";
import { MatchTypes } from "@/helpers/enums/match-types.enum";
import { PlayerStates } from "@/helpers/enums/player-states.enum";
import BoardService from "@/services/board.service";
import MatchService from "@/services/match/match.service";
import PlayerService from "@/services/player.service";
import Player from "@/types/player.interface";
import {
  CollectionReference,
  DocumentReference,
  Unsubscribe,
} from "@firebase/firestore";
import { DocumentData } from "firestore-jest-mock/mocks/helpers/buildDocFromHash";
import { ReplaySubject } from "rxjs";
import * as Board from "../../../types/board-types.interface";
import * as Match from "../../../types/match.interface";
import * as User from "../../../types/user.interface";

export interface MatchPluginOptions {
  storage: "localStorage" | "sessionStorage";
}

export interface dbReferences {
  match: DocumentReference<DocumentData> | null;
  board: {
    collection: CollectionReference | null;
    docs: {
      [key: string]: DocumentReference<DocumentData>;
    };
  };
  players: {
    docs: ReplaySubject<{ [key: string]: DocumentReference<DocumentData> }>;
    collection: CollectionReference | null;
  };
}

export default interface MatchPlugin {
  options: MatchPluginOptions;

  uid: Player["uid"] | null;

  service: MatchService | null;

  subscriptions: Unsubscribe[];

  create(
    user: User.default,
    matchType: MatchTypes,
    boardConfigs?: Partial<Board.configurations>
  ): Promise<Match.id>;

  find(id: Match.id): Promise<any>;

  join(matchId: Match.id, user: User.default): Promise<void>;

  exit(uid: User.uid): void;

  player: PlayerService | null;

  getPlayerIndex(uid: User.uid): number;

  opponent: PlayerService | null;

  getOpponentIndex(uid: User.uid): number;

  _subscribeRemote(): void;

  _subscribeLocal(): {
    match(): void;
    board(): void;
    //cells(): void;
    player(uid: Player["uid"]): void;
  };

  setFirstMove(): void;

  reset(): void;
}
