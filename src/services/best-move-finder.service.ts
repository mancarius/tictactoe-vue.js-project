import * as Board from "@/types/board-types.interface";
import _ from "lodash";
import BoardService from "./board.service";
import { Move } from "@/types/move.interface";
import PlayerService from "./player.service";
import Worker from "worker-loader!@/workers/crawler.worker";

export default class BestMoveFinder {
  private _board: BoardService;
  private _player: PlayerService;

  constructor(board: BoardService, player: PlayerService) {
    this._board = board;
    this._player = player;
  }

  /**
   * Return the best next move for passed player if exist, else return null
   *
   * @param {Player.userId} player
   * @param {Board.cell[]} cellCollection
   * @return {*}  {(Promise<number[] | null>)}
   * @memberof BestMoveFinder
   */
  public async find(): Promise<Move[] | null> {
    const moves = await this._bestPlayerMoves();
    return moves === null ? moves : moves.flat();
  }

  /**
   * Returns the group of unique moves with minimum path length
   *
   * @private
   * @return {*}  {(Promise<any[] | null>)}
   * @memberof BestMoveFinder
   */
  private async _bestPlayerMoves(): Promise<Move[] | null> {
    const goodMoves = (await this._goodPlayerMoves())?.flat() ?? null;

    if (goodMoves === null) return null;
    
    if (goodMoves.length > 1) {
      // sort moves by path length (asc) and sequence length (desc)
      const goodMovesSorted = _.sortBy(
        goodMoves,
        (o: Move) => o.path.length,
        (o: Move) => o.sequences.length * -1
      ) as Move[];

      // returns the group of unique moves with minimum path length
      return goodMovesSorted.reduce(
        (bests, move) => {
          return move.path.length === bests[0]?.path.length &&
            !_.isEqual(move, bests[0])
            ? [...bests, move]
            : bests;
        },
        [[...goodMovesSorted].shift()]
      ) as Move[];
    } else {
      return goodMoves as Move[];
    }
  }

  /**
   * Return a list of potentially good moves for passed player if exists,
   * else return an empty array
   *
   * @protected
   * @param {{
   *     player: Player.userId;
   *     virtualCellCollection: Board.cell[];
   *   }} {
   *     player,
   *     virtualCellCollection,
   *   }
   * @return {*}  {Promise<GoodNextMove[]>}
   * @memberof BestMoveFinder
   */
  protected async _goodPlayerMoves(): Promise<Move[] | null> {
    const crawlersResponse$ =
      "Worker" in window
        ? this._launchCrawlersInsideWorker()
        : this._launchCrawlersOutsideWorker();

    const sequences = await crawlersResponse$;

    const uniqueSequences =
      sequences && sequences.length > 1 ? _.uniq(sequences) : sequences;

    return uniqueSequences;
  }

  /**
   *
   *
   * @private
   * @return {*}  {Promise<Board.cell[]>}
   * @memberof BestMoveFinder
   */
  private async _launchCrawlersInsideWorker(): Promise<Move[]> {
    const maxThreads = navigator.hardwareConcurrency || 2;
    const maxThreadsPerPlayer = Math.floor(maxThreads / 1);
    const emptyCells = BoardService.getEmptyCells(this._board.cells);
    const cellsForThread = emptyCells.length / maxThreadsPerPlayer;
    const threadsToLaunch: number =
      cellsForThread > 1 ? maxThreadsPerPlayer : emptyCells.length;

    const workers: Promise<Move[]>[] = [];

    for (let i = 0; i < threadsToLaunch; i++) {
      const launchedWorker = this._launchWorker(
        new Worker(),
        emptyCells.splice(0, Math.floor(cellsForThread) || 1)
      );
      workers.push(launchedWorker);
    }

    const settleds$ = await Promise.allSettled(workers);

    const fullfilleds: Move[][] = [];

    for (const feed of settleds$) {
      if (feed.status === "fulfilled" && feed.value?.length) {
        fullfilleds.push(feed.value);
      }
    }

    return fullfilleds.flat();
  }

  /**
   *
   *
   * @private
   * @param {Worker} worker
   * @param {Board.cell[]} startingEmptyCells
   * @return {*}  {Promise<Move[]>}
   * @memberof BestMoveFinder
   */
  private async _launchWorker(
    worker: Worker,
    startingEmptyCells: Board.cell[]
  ): Promise<Move[]> {
    return new Promise((resolve, reject) => {
      worker.postMessage([
        this._board.configurations,
        this._player.uid,
        this._board.cells,
        startingEmptyCells,
      ]);

      worker.addEventListener(
        "message",
        ({ data }: { data: Move[] | null }) => {
          worker.terminate();
          data !== null ? resolve(data) : reject(data);
        }
      );
    });
  }

  /**
   *
   *
   * @private
   * @return {*}  {Promise<Board.cell[]>}
   * @memberof BestMoveFinder
   */
  private async _launchCrawlersOutsideWorker(): Promise<Move[] | null> {
    const CrawlerService = (await import("./crawler.service")).default;
    const crawler = new CrawlerService(
      this._board.configurations,
      this._player.uid
    );

    return crawler.launch(this._board.cells);
  }
}
