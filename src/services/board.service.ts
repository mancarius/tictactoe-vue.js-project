import filterDifferentFields from "@/helpers/filterDifferentFields";
import removeObservables from "@/helpers/removeObservables";
import * as Board from "@/types/board-types.interface";
import Player from "@/types/player.interface";
import _ from "lodash";
import { Observer, ReplaySubject, Subscription } from "rxjs";

export default class BoardService {
  private _changes$: ReplaySubject<Partial<BoardService>> = new ReplaySubject(
    1
  );

  public readonly configurations: Board.configurations = {
    rows: 3,
    columns: 3,
    winning_sequence_length: 3,
  };

  protected _cellCollection: Board.cell[] = [];

  public _lastUpdatedCells: number[] = [];

  public winningSequence: Board.WinningSequence = false;

  constructor(config: Partial<Board.configurations> = {}) {
    this.configurations = { ...this.configurations, ...config };
    this._initCells();

    return new Proxy(this, {
      get: (target: BoardService, prop: string | symbol, receiver: any) => {
        //remove empty cells from lastUpdatedCells
        if (prop === "_lastUpdatedCells") {
          target[prop] = target[prop].filter(
            (cellIndex: number) =>
              target["_cellCollection"][cellIndex].player !== null
          );
        }

        return Reflect.get(target, prop, receiver);
      },
      set: (target: BoardService, prop: string | symbol, value: any) => {
        const isArray = Array.isArray(Reflect.get(target, prop));
        const isObject =
          typeof Reflect.get(target, prop) === "object" && !isArray;

        Reflect.set(
          target,
          prop,
          isObject ? { ...Reflect.get(target, prop), ...value } : value
        );

        if (prop === "_cellCollection")
          this._changes$.next({ [prop as string]: value as Board.cell[] });

        return true;
      },
    });
  }

  /**
   *
   *
   * @static
   * @param {Partial<BoardService>} data
   * @return {*}
   * @memberof BoardService
   */
  public static create(data: Partial<BoardService>) {
    const { configurations } = data;
    if (typeof configurations === "object") {
      const board = new BoardService(configurations);
      board.sync(data);
      return board;
    } else {
      throw new TypeError("configurations misses or are invalid");
    }
  }

  /**
   * Returns an object instance without observables
   *
   * @return {*}  {string}
   * @memberof BoardService
   */
  public toObject(): {
    [x: string]: any;
  } {
    return removeObservables(this);
  }

  /**
   * Initialize cells
   *
   * @private
   * @memberof BoardService
   */
  private _initCells() {
    const { rows, columns } = this.configurations;
    const cellsLength = rows * columns;
    const collection = [];

    for (let i = 1; i <= cellsLength; i++) {
      const y = this._getRow(i);
      const x = this._getColumn(i, y);
      collection.push({
        player: null,
        coords: {
          y,
          x,
        },
      });
    }

    this._cellCollection = collection;
  }

  /**
   *
   *
   * @memberof BoardService
   */
  public reset(): void {
    this._initCells();
    this._lastUpdatedCells = [];
    this.winningSequence = false;
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

    this._lastUpdatedCells = [index];
  }

  /**
   *
   *
   * @memberof BoardService
   */
  public get lastUpdatedCells() {
    return this._lastUpdatedCells;
  }

  /**
   *
   *
   * @memberof BoardService
   */
  public static getUpdatedCells(
    base: Board.cell[],
    source: Board.cell[]
  ): number[] {
    const temp: number[] = [];

    base.forEach((cell, index) => {
      if (cell.player !== source[index].player) temp.push(index);
    });

    return temp;
  }

  /**
   *
   *
   * @memberof BoardService
   */
  public shuffleCells(): void {
    const tempCells = _.shuffle(this.cells);

    this._cellCollection = this._cellCollection.map((cell, index) => {
      return { ...cell, player: tempCells[index].player };
    });

    const notEmptyCells: number[] = [];

    this.cells.forEach(({ player }, index) => {
      if (typeof player === "string") {
        notEmptyCells.push(index);
      }
    });

    this._lastUpdatedCells = notEmptyCells;
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
    return BoardService.getPlayerCells(null, cells);
  }

  /**
   *
   *
   * @param {Board.cell['player']} player
   * @return {*}  {Board.cell[]}
   * @memberof BoardService
   */
  public getPlayerCells(uid: Player["uid"]): Board.cell[] {
    return BoardService.getPlayerCells(uid, this.cells);
  }

  /**
   *
   *
   * @static
   * @param {Player["uid"]} uid
   * @param {Board.cell[]} cells
   * @return {*}  {Board.cell[]}
   * @memberof BoardService
   */
  public static getPlayerCells(
    uid: Player["uid"] | null,
    cells: Board.cell[]
  ): Board.cell[] {
    const playerCells: Board.cell[] = [];
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].player === uid) playerCells.push(cells[i]);
    }

    return playerCells;
  }

  /**
   *
   *
   * @memberof BoardService
   */
  public clearWinningCells(): void {
    if (this.winningSequence) {
      const sequence = this.winningSequence.sequence;
      // clear cells
      sequence.map((cellIndex) => {
        const cell = this._cellCollection[cellIndex];
        this._cellCollection[cellIndex] = { ...cell, player: null };
      });

      this.winningSequence = false;
    }
  }

  /**
   *
   * @param data
   */
  public sync(data: { [x: string]: any }): void {
    if (!data) return;
    const filteredFields = filterDifferentFields(this, data);

    for (const [name, value] of Object.entries(filteredFields)) {
      const isPublic = !name.startsWith("_");

      if (name === "_cellCollection") {
        this._lastUpdatedCells = BoardService.getUpdatedCells(
          this.cells,
          value
        );
      }

      if (isPublic) {
        this[name as keyof this] = value;
        continue;
      } else {
        const setterName = name.substr(1);
        const proto = Object.getPrototypeOf(this);
        const propertyDescriptors = Object.getOwnPropertyDescriptors(proto);
        const hasSetter =
          typeof propertyDescriptors[setterName]?.set === "function";
        if (hasSetter) {
          this[setterName as keyof this] = value;
        } else {
          this[name as keyof this] = value;
        }
      }
    }
  }

  /**
   *
   */
  public subscribe(
    callback:
      | Partial<Observer<Partial<BoardService> | undefined>>
      | ((data: Partial<BoardService> | undefined) => void)
  ): Subscription {
    const props =
      typeof callback === "function"
        ? {
            next: (data: Partial<BoardService> | undefined) =>
              data && callback(data),
            error: (error: any) => {
              throw error;
            },
          }
        : Reflect.has(callback, "next")
        ? callback
        : undefined;

    return this._changes$.subscribe(props);
  }
}
