import { MatchTypes } from "@/helpers/enums/match-types.enum";
import MatchService from "@/services/match.service";
import {
  CollectionReference,
  DocumentReference,
  Unsubscribe,
} from "@firebase/firestore";
import { DocumentData } from "firestore-jest-mock/mocks/helpers/buildDocFromHash";
import * as Board from "../../../types/board-types.interface";
import * as Match from "../../../types/match.interface";
import * as User from "../../../types/user.interface";

export interface MatchPluginOptions {
  storage: "localStorage" | "sessionStorage";
}

export interface dbReferences {
  match: DocumentReference<DocumentData> | null;
  board: DocumentReference<DocumentData> | null;
  players: {
    docs: { [key: string]: DocumentReference<DocumentData> };
    collection: CollectionReference | null;
  };
};

export default interface MatchPlugin {
  options: MatchPluginOptions;

  service: MatchService | null;

  subscriptions: Unsubscribe[];

  create(
    user: User.default,
    matchType: MatchTypes,
    boardConfigs?: Partial<Board.configurations>
  ): Promise<Match.id>;

  find(id: Match.id): Promise<any>;

  join(matchId: Match.id, user: User.default): Promise<void>;

  exit(userId: User.uid): void;

  _subscribeRemote(): void;

  _subscribeLocal(): void;
}
