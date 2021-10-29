import * as Board from "@/types/board-types.interface";

export interface Move {
  path: Board.cell[];
  sequences: number[][];
}
