import * as Board from "@/types/board-types.interface";
import _ from "lodash";
import { Subject } from "rxjs";

const changes$: Subject<Partial<BoardService>> = new Subject();

export default class BoardService {
  private _lastUpdate: any;

  private get _changes$(): Subject<Partial<BoardService>> {
    return changes$;
  }

  public readonly configurations: Board.configurations = {
    rows: 3,
    columns: 3,
    winning_sequence_length: 3,
  };

  protected _cellCollection: Board.cell[] = [];

  constructor(config: Partial<Board.configurations> = {}) {
    this.configurations = { ...this.configurations, ...config };
    this._init();
  }

  /**
   * Initialize cells
   *
   * @private
   * @memberof BoardService
   */
  private _init() {
    const { rows, columns } = this.configurations;
    const cellsLength = rows * columns;

    for (let i = 1; i <= cellsLength; i++) {
      const y = this._getRow(i);
      const x = this._getColumn(i, y);
      this._cellCollection.push({
        player: null,
        coords: {
          y,
          x,
        },
      });
    }
  }

  /**
   * Returns the row number
   *
   * @param position
   * @returns
   */
  private _getRow(position: number): number {
    return Math.ceil(position / this.configurations.columns);
  }

  /**
   * Returns the column number
   *
   * @param position
   * @param row
   * @returns
   */
  private _getColumn(position: number, row: number): number {
    return position - (row - 1) * this.configurations.columns;
  }

  /**
   *
   *
   * @readonly
   * @type {Board.cell[]}
   * @memberof BoardService
   */
  public get cells(): Board.cell[] {
    return [...this._cellCollection];
  }

  /**
   * Update an existing cell with passed props.
   *
   * @param index Cell's index
   * @param props {Partial<Board.cell>} A cell object partial
   */
  public updateCell(index: number, props: Partial<Board.cell>): void {
    this._cellCollection = BoardService.updateCellAndReturnNewCells(
      index,
      props,
      this._cellCollection
    );

    this._changes$.next({
      ["_cellCollection" as string]: this._cellCollection,
    });
  }

  /**
   * Update an existing cell with passed props and return the new cell collection.
   *
   * @static
   * @param {number} index
   * @param {Partial<Board.cell>} props
   * @param {Board.cell[]} cells
   * @return {*}  {Board.cell[]}
   * @memberof BoardService
   */
  public static updateCellAndReturnNewCells(
    index: number,
    props: Partial<Board.cell>,
    cells: Board.cell[]
  ): Board.cell[] {
    const selectedCell = cells[index];

    if (_.isObject(selectedCell)) {
      cells[index] = { ...selectedCell, ...props };
      return cells;
    } else {
      const isInvalidIndex =
        typeof index !== "number" || 0 > index || index >= cells.length;
      if (isInvalidIndex) {
        throw new Error("The required cell (" + index + ") not exist");
      } else {
        throw new TypeError(
          "Invalid index. Index must be a number between 0 and " + cells.length
        );
      }
    }
  }

  /**
   *
   *
   * @static
   * @param {{ coords: Coords }} { coords }
   * @param {Board.cell[]} cellCollection
   * @return {*}  {number}
   * @memberof BoardService
   */
  public static getCellIndex(
    { coords }: { coords: Coords },
    cellCollection: Board.cell[]
  ): number {
    if (!coords) return -1;
    return cellCollection.findIndex((cell) => _.isEqual(cell.coords, coords));
  }

  /**
   *
   *
   * @param {Board.cell} cell
   * @return {*}  {number}
   * @memberof BoardService
   */
  public getCellIndex(cell: Board.cell): number {
    return BoardService.getCellIndex(cell, this.cells);
  }

  /**
   * Returns a list with the empty cells indexes
   *
   * @readonly
   * @type {number[]}
   * @memberof BoardService
   */
  public get emptyCells(): number[] {
    return BoardService.getEmptyCellIndexes(this.cells);
  }

  /**
   * Returns a list with the empty cells indexes
   *
   * @param {Board.cell[]} cells
   * @return {*}  {number[]}
   * @memberof BoardService
   */
  public static getEmptyCellIndexes(cells: Board.cell[]): number[] {
    return cells.reduce(
      (availables: number[], { player }, currentIndex) =>
        player === null ? [...availables, currentIndex] : availables,
      []
    );
  }

  /**
   * Returns a list with the empty cells
   *
   * @static
   * @param {Board.cell[]} cells
   * @return {*}  {Board.cell[]}
   * @memberof BoardService
   */
  public static getEmptyCells(cells: Board.cell[]): Board.cell[] {
    const emptyCells: Board.cell[] = [];
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].player === null) emptyCells.push(cells[i]);
    }

    return emptyCells;
  }

  /**
   *
   *
   * @param {Board.cell['player']} player
   * @return {*}  {Board.cell[]}
   * @memberof BoardService
   */
  public getPlayerCells(player: Board.cell["player"]): Board.cell[] {
    const playerCells: Board.cell[] = [];
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].player === player) playerCells.push(this.cells[i]);
    }

    return playerCells;
  }

  /**
   *
   * @param data
   */
  public sync(data: any) {
    data && Object.assign(this, data);
  }

  /**
   *
   * @param callback
   */
  public subscribe(callback: (data: Partial<BoardService>) => void) {
    this._changes$.subscribe((data) => callback(data));
  }
}
