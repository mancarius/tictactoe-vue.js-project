import { PlayerStates } from "@/helpers/enums/player-states.enum";
import { cell } from "@/types/board-types.interface";
import { Move } from "@/types/move.interface";
import * as Player from "@/types/player.interface";
import User from "@/types/user.interface";
import _ from "lodash";
import BestMoveFinder from "./best-move-finder.service";
import BoardService from "./board.service";
import PlayerService from "./player.service";

export default class BotService extends PlayerService {
  private _board: BoardService;
  private _opponent: PlayerService;
  private _bestOpponentMoves: BestMoveFinder;

  constructor(opponent: PlayerService, board: BoardService) {
    const bot: User = {
      displayName: "Bot",
      uid: "bot",
      photoURL: "",
    };

    const options: Player.options = {
      isOwner: false,
      sign: "YbvNI6OTqmtXmvQLmgsI",
      customName: "Bot",
    };

    super(bot, options);
    this.state = PlayerStates.ready;
    this._board = board;
    this._opponent = opponent;
    this._bestOpponentMoves = new BestMoveFinder(this._board, this._opponent);
    this._opponent.subscribe({
      next: (data) => {
        const name = Object.keys(data)[0];
        const value = Object.values(data)[0];

        switch (name) {
          case "state":
            if (value == PlayerStates.in_game) {
              this.state = value;
            } else if (value == PlayerStates.ready) {
              this.state = value;
            } else if (value == PlayerStates.disconnected) {
              this.state = value;
            }
            break;
          default:
            break;
        }
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.subscribe({
      next: (data) => {
        const name = Object.keys(data)[0];
        const value = Object.values(data)[0];

        switch (name) {
          case "state":
            if (value == PlayerStates.moving) {
              this._moveOrShuffle();
            }
            break;
          default:
            break;
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  /**
   *
   * @private
   * @memberof BotService
   */
  private async _moveOrShuffle() {
    this.state = PlayerStates.calculating_next_move;
    const opponentMoves = await this._getBestOpponentMoves();
    const nextMove = await this.getNextMove(opponentMoves, 1500);

    if (nextMove) {
      this.moveOrShuffle(this._board, nextMove);
    } else {
      const emptyCells = this._board.emptyCells;
      if (emptyCells.length) {
        const randomMove = _.shuffle(emptyCells)[0];
        this.moveOrShuffle(this._board, randomMove);
      } else {
        this.state = PlayerStates.no_available_moves;
      }
    }
  }

  /**
   *
   *
   * @private
   * @return {*}  {(Promise<Move[] | null>)}
   * @memberof BotService
   */
  private async _getBestOpponentMoves(): Promise<Move[] | null> {
    const opponentCells = this._board.getPlayerCells(this._opponent.uid) || [];
    return opponentCells.length > 1
      ? await this._bestOpponentMoves.find()
      : null;
  }

  /**
   *
   *
   * @return {*}
   * @memberof BotService
   */
  public async getNextMove(
    bestOpponentMoves: Move[] | null,
    delay = 0
  ): Promise<number | "shuffle" | null> {
    const startTime = performance.now();

    const botCells = this._board.getPlayerCells(this.uid);
    const bestBotMoves = new BestMoveFinder(this._board, { ...this });
    const botMoves = botCells.length > 1 ? await bestBotMoves.find() : null;

    const bestNextMove = this._evaluateBestMove(botMoves, bestOpponentMoves);

    const existsBestNextMove = bestNextMove !== null;

    const endTime = performance.now();

    const elapsedTime = endTime - startTime;

    const waitingTime = elapsedTime < delay ? delay - elapsedTime : 0;

    return await new Promise((resolve) => {
      setTimeout(() => {
        if (existsBestNextMove)
          resolve(
            typeof bestNextMove === "string"
              ? bestNextMove
              : this._board.getCellIndex(bestNextMove?.path[0] as cell)
          );
        else {
          resolve(null);
        }
      }, waitingTime);
    });
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
  ): Move | "shuffle" | null {
    if ((playerMoves === opponentMoves) === null) return null;

    const playerBestMove = playerMoves?.[0] ?? null;
    const opponentBestMove = opponentMoves?.[0] ?? null;

    const playerMinMovesToWin = playerBestMove
      ? playerBestMove.path.length
      : null;
    const opponenetMinMovesToWin = opponentBestMove
      ? opponentBestMove.path.length
      : null;

    if (!playerMinMovesToWin) {
      if (opponentMoves && opponentMoves?.length > 1 && this.canShuffle) {
        return "shuffle";
      }
      return opponentBestMove;
    }
    if (!opponenetMinMovesToWin) return playerBestMove;

    return playerMinMovesToWin > opponenetMinMovesToWin
      ? opponentBestMove
      : playerBestMove;
  }
}
