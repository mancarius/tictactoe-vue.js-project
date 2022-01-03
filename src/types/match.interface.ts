import { MatchStates } from "@/helpers/enums/match-states.enum";
import { MatchTypes } from "@/helpers/enums/match-types.enum";
import * as Board from "./board-types.interface";
import Player from "./player.interface";

export type players = [Player, Player | undefined];

export type id = string;

export type type = MatchTypes;

export type state = MatchStates;

export type host = string;

export type board = {
  configs: Board.configurations;
  cellCollection: Board.cell[];
};

export type scores = [number, number];

export default interface Match {
  player: {
    index: number;
  },
  opponent: {
    index: number;
  },
  exit: boolean
}
