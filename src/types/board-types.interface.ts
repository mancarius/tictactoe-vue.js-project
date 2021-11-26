import * as Player from "./player.interface";

export default interface Board {
  configurations: configurations;
  cells: cell[];
}

export interface configurations {
  rows: number;
  columns: number;
  winning_sequence_length: number;
}

export interface cell {
  coords: Coords;
  player: null | Player.userId;
}

export type WinningSequence =
  | false
  | {
      player: string;
      sequence: number[];
    };