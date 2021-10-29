import * as Board from "@/types/board-types.interface";
import { Direction } from "@/types/direction.interface";
import _ from "lodash";
import BoardService from "./board.service";

type findSequenceParams = [Board.cell, Direction[], number?];

export default class SequenceFinderService extends BoardService {
  protected readonly _directions: { [key: string]: Direction } = {
    left: {
      x: -1,
      y: 0,
    },
    right: {
      x: 1,
      y: 0,
    },
    top: {
      x: 0,
      y: -1,
    },
    bottom: {
      x: 0,
      y: 1,
    },
  };
  protected _player: Board.cell["player"];

  constructor(
    boardConfigs: Partial<Board.configurations>,
    cellCollection: Board.cell[],
    player: Board.cell["player"]
  ) {
    super(boardConfigs);
    super._cellCollection = cellCollection;
    this._player = player ?? null;
  }

  /**
   * Returns the first matched sequence
   *
   * @param {Board.cell} cell
   * @param {number} [id]
   * @return {*}  {Promise<number[]>}
   * @memberof SequenceFinderService
   */
  public async anyPassingSequence(
    cell: Board.cell,
    id?: number
  ): Promise<number[]> {
    return Promise.any(this._sequencesPassingThrougCell(cell, id));
  }

  /**
   * Returns all matched sequences
   *
   * @param {Board.cell} cell
   * @param {number} [id]
   * @return {*}  {Promise<number[][]>}
   * @memberof SequenceFinderService
   */
  public async allPassingSequences(
    cell: Board.cell,
    id?: number
  ): Promise<number[][]> {
    const settledPromises = await Promise.allSettled(
      this._sequencesPassingThrougCell(cell, id)
    );
    const sequences: number[][] = [];

    for (const obj of settledPromises) {
      if (obj.status === "fulfilled") {
        sequences.push(obj.value);
      }
    }

    return [...sequences];
  }

  /**
   * Looks for a cells sequence passing through the cell's point.
   * Return a promise containing the first valid sequence found.
   * If no sequence found, reject the promise.
   * *A sequence is valid where its length is greater than the minimum required length.
   * @param cell Real or virtual cell
   * @param id
   * @returns {Promise<number[]>}
   */
  private _sequencesPassingThrougCell(
    cell: Board.cell,
    id?: number
  ): Promise<number[]>[] {
    const { top, bottom, left, right } = this._directions;

    const checkHorizontal = (() => {
      const params: findSequenceParams = [cell, [left, right]];

      typeof id === "number" && params.push(id);

      return this._findSequence(...params);
    })();

    const checkVertical = (() => {
      const params: findSequenceParams = [cell, [top, bottom]];

      typeof id === "number" && params.push(id);

      return this._findSequence(...params);
    })();

    const checkDiagonalR2L = (() => {
      const topRight = {
        x: right.x,
        y: top.y,
      };
      const bottomLeft = {
        x: left.x,
        y: bottom.y,
      };

      const params: findSequenceParams = [cell, [topRight, bottomLeft]];

      typeof id === "number" && params.push(id);

      return this._findSequence(...params);
    })();

    const checkDiagonalL2R = (() => {
      const topLeft = {
        x: left.x,
        y: top.y,
      };
      const bottomRigth = {
        x: right.x,
        y: bottom.y,
      };

      const params: findSequenceParams = [cell, [topLeft, bottomRigth]];

      typeof id === "number" && params.push(id);

      return this._findSequence(...params);
    })();

    const crewlers = [
      checkHorizontal,
      checkVertical,
      checkDiagonalR2L,
      checkDiagonalL2R,
    ];

    return crewlers;
  }

  /**
   * Looks for a cells sequence in the given direction,
   * starting from the starting cell's point.
   * If the length of the sequence is greater than the minimum required length,
   * then resolves the promise with the found sequence. Else rejects it.
   *
   * @protected
   * @param cell Real or virtual cell
   * @param directions
   * @param [index] (optional) Necessary in case of virtual cell
   * @returns {Promise<number[]>}
   */
  protected async _findSequence(
    cell: Board.cell,
    directions: Direction[],
    index?: number
  ): Promise<number[]> {
    const [before, after] = directions;
    const startCellIndex = index
      ? index
      : this.cells.findIndex(
          ({ coords }) =>
            cell.coords.x === coords.x && cell.coords.y === coords.y
      );

    return new Promise((resolve, reject) => {
      const sequence = [
        ...this._checkNextCell(cell, before),
        startCellIndex,
        ...this._checkNextCell(cell, after),
      ].sort((a, b) => a - b);

      sequence.length >= this._config.winning_sequence_length
        ? resolve([...sequence])
        : reject([...sequence]);
    });
  }

  /**
   * Looks for a cell that match passed parameter in the given direction starting from
   * the "baseCell". If found, adds it in the sequence array and call itself recursively with
   * the new cell.
   *
   * @protected
   * @param baseCell
   * @param direction
   * @param cells
   * @param sequence
   * @returns {number[]}
   */
  protected _checkNextCell(
    baseCell: Board.cell,
    direction: Direction,
    sequence: number[] = []
  ): number[] {
    const { player, coords } = baseCell;

    if (player === undefined) return sequence;

    const nextCoords = {
      x: coords.x + direction.x,
      y: coords.y + direction.y,
    };

    let cellIndex = -1;
    let nextCell: Board.cell | undefined;

    for (let i = 0; i < this.cells.length; i++) {
      const { coords } = this.cells[i];
      if (coords.x === nextCoords.x && coords.y === nextCoords.y) {
        cellIndex = i;
        nextCell = this.cells[i];
        break;
      }
    }

    if (nextCell !== undefined && nextCell.player === player) {
      return this._checkNextCell(nextCell, direction, [...sequence, cellIndex]);
    } else {
      return sequence;
    }
  }
}
