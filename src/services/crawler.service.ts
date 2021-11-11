import * as Board from "@/types/board-types.interface";
import _ from "lodash";
import BoardService from "./board.service";
import { Move } from "@/types/move.interface";
import SequenceFinderService from "./sequence-finder.service";

interface Crawler {
  sequenceFinder: SequenceFinderService;
  path: Board.cell[];
}

export default class CrawlerService {
  private _boardConfigs: Board.configurations;
  private _player: Board.cell["player"];
  private _terminate = false;

  constructor(
    boardConfigs: Board.configurations,
    player: Board.cell["player"]
  ) {
    this._boardConfigs = boardConfigs;
    this._player = player;
  }

  /**
   *
   *
   * @param {Board.cell[]} virtualCellCollection
   * @param {Crawler["path"]} [path=[]]
   * @return {*}
   * @memberof CrawlerService
   */
  public async launch(
    virtualCellCollection: Board.cell[],
    startingCells?: Board.cell[]
  ): Promise<Move[] | null> {
    const crawlers = this._createCrawlerList(
      virtualCellCollection,
      [],
      startingCells
    );

    this._terminate = false;

    const promises = this._sendCrawlers(crawlers);

    const goodMoves = await this._resolveCrawlers(promises);

    return goodMoves.length ? [...goodMoves] : null;
  }

  /**
   *
   *
   * @private
   * @param {Promise<Promise<Move[]>[]>[]} promises
   * @return {*}  {Promise<Move[]>}
   * @memberof CrawlerService
   */
  private async _resolveCrawlers(
    promises: any[]
  ): Promise<any[]> {
    const settledPromises = await Promise.allSettled(promises.flat());
    const fulfilleds = [];
    let anyPromise = false;

    for (const obj of settledPromises) {
      if (obj.status === "fulfilled") {
        const { value } = obj;
        if (!anyPromise) {
          if (Array.isArray(value)) {
            anyPromise = value.some((o) => o instanceof Promise);
          } else {
            anyPromise = (value as any) instanceof Promise;
          }
        }
        fulfilleds.push(value);
      }
    }

    return anyPromise ? this._resolveCrawlers(fulfilleds) : fulfilleds;
  }

  /**
   *
   *
   * @param {Board.cell[]} virtualCellCollection
   * @param {Crawler["path"]} [path=[]]
   * @return {*}  {Crawler[]}
   * @memberof CrawlerService
   */
  private _createCrawlerList(
    virtualCellCollection: Board.cell[],
    path: Crawler["path"],
    startingCells?: Board.cell[]
  ): Crawler[] {
    const emptyCells = startingCells?.length
      ? [...startingCells]
      : BoardService.getEmptyCells(virtualCellCollection);

    const generatedCrawlers: Crawler[] = [];

    for (let i = 0; i < emptyCells.length; i++) {
      const virtualCell = {
        ...emptyCells[i],
        player: this._player,
      };

      const newCrawler = this._createCrawler(
        virtualCell,
        [...virtualCellCollection],
        [...path]
      );

      generatedCrawlers.push(newCrawler);
    }

    return generatedCrawlers;
  }

  /**
   *
   *
   * @protected
   * @param {Crawler[]} crawlers
   * @memberof CrawlerService
   */
  protected _sendCrawlers(crawlers: Crawler[]): Promise<Promise<Move[]>[]>[] {
    if (crawlers.length === 0 || this._terminate) return [];

    const sendedCrawlers: Promise<Promise<Move[]>[]>[] = [];

    for (const crawler of crawlers) {
      sendedCrawlers.push(this._sendCrawler(crawler));
    }

    return sendedCrawlers;
  }

  /**
   *
   *
   * @protected
   * @param {Board.cell} virtualCell
   * @param {Board.cell[]} [path=[]]
   * @return {*}  {Crawler}
   * @memberof CrawlerService
   */
  protected _createCrawler(
    virtualCell: Board.cell,
    virtualCellCollection: Board.cell[],
    path: Board.cell[] = []
  ): Crawler {
    path.push(virtualCell);

    const sequenceFinder = new SequenceFinderService(
      this._boardConfigs,
      virtualCellCollection,
      this._player
    );
    return {
      sequenceFinder,
      path,
    };
  }

  /**
   *
   *
   * @protected
   * @param {{
   *     virtualCell: Board.cell;
   *     sequenceFinder: Crawler["sequenceFinder"];
   *     path?: Crawler["path"];
   *   }} {
   *     virtualCell,
   *     sequenceFinder,
   *     path = [],
   *   }
   * @return {*}  {Promise<any>}
   * @memberof CrawlerService
   */
  protected async _sendCrawler({
    sequenceFinder,
    path,
  }: {
    sequenceFinder: Crawler["sequenceFinder"];
    path: Move["path"];
  }): Promise<Promise<Move[]>[]> {
    let sequences: number[][] = [];
    const virtualCell = [...path].pop() as Board.cell;
    const cellIndex = BoardService.getCellIndex(
      virtualCell,
      sequenceFinder.cells
    );

    try {
      sequenceFinder.updateCell(cellIndex, virtualCell);

      sequences = await sequenceFinder.allPassingSequences(virtualCell);

      if (sequences?.length > 0) {
        // sequence found
        if (path.length <= 1) {
          this._terminate = true;
        }

        return [
          Promise.resolve([
            {
              path: [...path],
              sequences,
            },
          ]),
        ];
      } else {
        throw new Error("No sequence found");
      }
    } catch (error) {
      // sequence not found
      const crawlers = this._createCrawlerList(sequenceFinder.cells, [...path]);
      return await Promise.any<Promise<Move[]>[]>(this._sendCrawlers(crawlers));
    }
  }
}
