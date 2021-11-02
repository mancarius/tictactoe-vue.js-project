import { cell } from "@/types/board-types.interface";
import { Move } from "@/types/Move.interface";
import _ from "lodash";
import BestMoveFinder from "./best-move-finder.service";
import BoardService from "./board.service";
import { PlayerService } from "./player.service";

export default class BotService extends PlayerService {
  private _board: BoardService;
  private _opponent: PlayerService;

  constructor(opponent: PlayerService, board: BoardService) {
    super("bot", "Bot");
    this._board = board;
    this._opponent = opponent;
  }

  /**
   *
   *
   * @return {*}
   * @memberof BotService
   */
  public async getNextMove(
    bestOpponentMoves: Move[] | null
  ): Promise<number | null> {
    const opponentCells = this._board.getPlayerCells(this._opponent.uid);

    if (
      opponentCells.length <
      this._board.configurations.winning_sequence_length / 2
    ) {
      return this._randomCellIndex;
    }

    const botCells = this._board.getPlayerCells(this.uid);
    const bestBotMoves = new BestMoveFinder(this._board, this);
    const botMoves = botCells.length > 1 ? await bestBotMoves.find() : null;

    const bestNextMove = this._evaluateBestMove(botMoves, bestOpponentMoves);

    const existsBestNextMove = bestNextMove !== null;

    if (existsBestNextMove)
      return this._board.getCellIndex(bestNextMove?.path[0] as cell);
    else {
      return null;
    }
  }

  /**
   *
   *
   * @readonly
   * @private
   * @type {(number | null)}
   * @memberof BotService
   */
  private get _randomCellIndex(): number | null {
    return _.shuffle(this._board.emptyCells).shift() ?? null;
  }

  /**
   *
   *
   * @private
   * @param {(Move[] | null)} playerMoves
   * @param {(Move[] | null)} opponentMoves
   * @return {*}  {(Move | null)}
   * @memberof BotService
   */
  private _evaluateBestMove(
    playerMoves: Move[] | null,
    opponentMoves: Move[] | null
  ): Move | null {
    if ((playerMoves === opponentMoves) === null) return null;

    const playerBestMove = playerMoves?.[0] ?? null;
    const opponentBestMove = opponentMoves?.[0] ?? null;

    const playerMinMovesToWin = playerBestMove
      ? playerBestMove.path.length
      : null;
    const opponenetMinMovesToWin = opponentBestMove
      ? opponentBestMove.path.length
      : null;

    if (!playerMinMovesToWin) return opponentBestMove;
    if (!opponenetMinMovesToWin) return playerBestMove;

    return playerMinMovesToWin > opponenetMinMovesToWin
      ? opponentBestMove
      : playerBestMove;
  }
}
