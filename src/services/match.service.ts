import { convertClassToObject } from "@/helpers/convertClassToObject";
import { MatchStates } from "@/helpers/enums/match-states.enum";
import { MatchTypes } from "@/helpers/enums/match-types.enum";
import removeObservables from "@/helpers/removeObservables";
import filterDifferentFields from "@/helpers/filterDifferentFields";
import * as Board from "@/types/board-types.interface";
import * as Match from "@/types/match.interface";
import * as Player from "@/types/player.interface";
import User from "@/types/user.interface";
import _ from "lodash";
import {
  combineLatest,
  distinctUntilChanged,
  Observer,
  ReplaySubject,
  Subject,
  Subscription,
} from "rxjs";
import BoardService from "./board.service";
import BotService from "./bot.service";
import PlayerService from "./player.service";
import SequenceFinderService from "./sequence-finder.service";
import { reactive } from "@vue/reactivity";
import { PlayerStates } from "@/helpers/enums/player-states.enum";

export default class MatchService {
  public readonly id: Match.id;
  public players: (PlayerService | BotService)[];
  public board: BoardService;
  public readonly type: MatchTypes = MatchTypes.PLAYER_VS_COMPUTER;
  public state: Match.state = MatchStates.building;
  private _createdAt: any;
  public nextPlayerToMove: Player.userId | false = false;
  public useShuffling = true;
  public shuffleActivationTarget = 3;
  public nextMatchId: number | null = null;
  private _playersStates$ = [
    new Subject<PlayerStates>(),
    new Subject<PlayerStates>(),
  ];
  private _changes$: ReplaySubject<Partial<MatchService>> = new ReplaySubject();
  private _lastUpdatedCells: number[] = [];

  constructor(
    players: [User, User?],
    type: MatchTypes,
    boardConfigs?: Partial<Board.configurations>
  ) {
    this.board = reactive(
      boardConfigs ? new BoardService(boardConfigs) : new BoardService()
    ) as BoardService;

    this.players = players
      .filter((user) => user !== undefined && user.uid !== "bot")
      .map<PlayerService>(
        (user) => reactive(new PlayerService(user as User)) as PlayerService
      );

    if (type === MatchTypes.PLAYER_VS_COMPUTER) {
      const botSrv = reactive(new BotService(this.players[0], this.board));

      this.players = [this.players[0] as PlayerService, botSrv as BotService];

      this.id = "vsbot";
    } else {
      this.id = MatchService.generateCode(this.players[0].displayName);
    }

    this.type = type;

    const proxy: MatchService = new Proxy(this, {
      set: (target: any, prop: string | symbol, value: any) => {
        const isArray = Array.isArray(target[prop]);
        const isObject = typeof target[prop] === "object" && !isArray;

        target[prop] = isObject ? { ...target[prop], ...value } : value;
        this._changes$.next({ [prop]: value });

        return true;
      },
    });

    proxy.board.subscribe((data) => {
      data && proxy.boardSubscription.call(proxy, data);
    });

    combineLatest(proxy._playersStates$).subscribe((states) => {
      proxy._stateHandler.call(proxy, states);
    });

    proxy.players.forEach((player, index) => {
      player.subscribe((data) => {
        const { state } = data;
        state !== undefined && proxy._playersStates$[index].next(state);
      });
    });

    return proxy;
  }

  /**
   *
   *
   * @private
   * @param {PlayerStates[]} [playerState, opponentState]
   * @return {*}  {void}
   * @memberof MatchService
   */
  private _stateHandler([p1State, p2State]: PlayerStates[]): void {
    if (
      p1State === PlayerStates.disconnected ||
      p2State === PlayerStates.disconnected
    ) {
      this.state = MatchStates.waiting_players_ready;
      return;
    }

    // console.group("stateHandler");
    // console.log("before", {
    //   matchState: this.state,
    //   p1State,
    //   p2State,
    // });

    if (
      /*
       * Waiting player ready
       */
      p1State === PlayerStates.in_lobby ||
      p2State === PlayerStates.in_lobby
    ) {
      this.state = MatchStates.waiting_players_ready;
    } else if (
      /*
       * Ready
       */
      this.state === MatchStates.waiting_players_ready &&
      PlayerService.isPlayerReady(p1State) &&
      PlayerService.isPlayerReady(p2State)
    ) {
      this.state = MatchStates.ready;
    } else if (
      /*
       * Starting
       */
      this.state === MatchStates.ready &&
      (p1State === PlayerStates.ready || p1State === PlayerStates.in_game) &&
      (p2State === PlayerStates.ready || p2State === PlayerStates.in_game)
    ) {
      this.state = MatchStates.starting;
    } else if (
      /*
       * Started
       */
      p1State === PlayerStates.in_game &&
      p2State === PlayerStates.in_game
    ) {
      this.state = MatchStates.started;
    } else if (
      /*
       * Waiting for player move
       */
      this.state === MatchStates.started &&
      (p1State === PlayerStates.in_game ||
        p1State === PlayerStates.waiting_for_opponent_move ||
        p1State === PlayerStates.moving ||
        p1State === PlayerStates.next_to_move ||
        p2State === PlayerStates.in_game ||
        p2State === PlayerStates.waiting_for_opponent_move ||
        p2State === PlayerStates.moving ||
        p2State === PlayerStates.next_to_move)
    ) {
      this.state = MatchStates.waiting_for_player_move;
    } else if (
      /*
       * Shaking board
       */
      this.state === MatchStates.waiting_for_player_move &&
      (p1State === PlayerStates.shuffling || p2State === PlayerStates.shuffling)
    ) {
      this.state = MatchStates.shaking_board;
    } else if (
      /*
       * Call checkLastUpdatedCells()
       */
      (this.state === MatchStates.waiting_for_player_move ||
        this.state === MatchStates.shaking_board) &&
      ((p1State === PlayerStates.last_to_move &&
        p2State === PlayerStates.waiting_for_opponent_move) ||
        (p1State === PlayerStates.waiting_for_opponent_move &&
          p2State === PlayerStates.last_to_move))
    ) {
      this._lastUpdatedCells = this.board.lastUpdatedCells;
      this.checkLastUpdatedCells();
    } else if (
      /*
       * Sequence found
       */
      this.state === MatchStates.checking_sequence &&
      (p1State === PlayerStates.score || p2State === PlayerStates.score)
    ) {
      this.state = MatchStates.sequence_found;
    } else if (
      /*
       * Terminated
       */
      this.state === MatchStates.checking_game_status &&
      (p1State === PlayerStates.winner ||
        p1State === PlayerStates.loser ||
        p1State === PlayerStates.draw) &&
      (p2State === PlayerStates.winner ||
        p2State === PlayerStates.loser ||
        p2State === PlayerStates.draw)
    ) {
      this.state = MatchStates.terminated;
    }

    // console.log("after", {
    //   matchState: this.state,
    //   p1State,
    //   p2State,
    // });
    // console.groupEnd();
  }

  /**
   * Returns an object instance without observables
   *
   * @return {*}  {string}
   * @memberof MatchService
   */
  public toObject(): {
    [x: string]: any;
  } {
    return removeObservables(this);
  }

  /**
   *
   *
   * @memberof MatchService
   */
  public reset(): void {
    this.state = MatchStates.resetting;
    this.board.reset();
    this.players.forEach((player) => {
      player.reset();
    });
  }

  /**
   * Handler of the board events
   * @private
   * @param {*} data
   * @memberof MatchService
   */
  private async boardSubscription(data: { [key: string]: any }): Promise<void> {
    if (this.state === MatchStates.resetting) return;

    const key = Object.keys(data)[0];
    const value: any = Object.values(data)[0];

    switch (key) {
      case "lastUpdatedCells":
        // this._lastUpdatedCells = value;
        // await this.checkLastUpdatedCells();
        break;
      default:
        return;
    }
  }

  /**
   *
   *
   * @memberof MatchService
   */
  public async checkLastUpdatedCells(): Promise<void> {
    const notEmptyStack = this._lastUpdatedCells.length > 0;

    if (notEmptyStack) {
      try {
        const result = await this._checkSequence(
          this._lastUpdatedCells.shift()!
        );
        result
          ? this._onSequenceFound(result)
          : await this._onSequenceNotFound();
      } catch (error: any) {
        console.log(error);
        throw new Error(error);
      }
    } else {
      await this._onSequenceNotFound();
    }

    return;
  }

  /**
   * Verify if the given cell is part of a sequence
   * @param cellIndex
   * @returns
   */
  private async _checkSequence(
    cellIndex: number
  ): Promise<Board.WinningSequence | false> {
    if (typeof cellIndex !== "number" || cellIndex < 0) return false;

    this.state = MatchStates.checking_sequence;

    const sequenceFinder = new SequenceFinderService(
      this.board.configurations,
      this.board.cells,
      this.board.cells[cellIndex].player
    );

    const sequences = await sequenceFinder.allPassingSequences(
      this.board.cells[cellIndex]
    );

    if (sequences.length && this.board.cells[cellIndex].player !== null) {
      return {
        player: this.board.cells[cellIndex].player as string,
        sequence: sequences.flat(),
      };
    } else {
      return false;
    }
  }

  /**
   *
   *
   * @private
   * @param {Board.WinningSequence} winningSequences
   * @memberof MatchService
   */
  private _onSequenceFound(winningSequences: Board.WinningSequence): void {
    if (winningSequences) {
      const { player, sequence } = winningSequences;
      const filteredSequence = _.uniq(sequence);
      const score = filteredSequence.length;
      this.board.winningSequence = { player, sequence: filteredSequence };
      this.getPlayer(player).state = PlayerStates.score;
      this.getPlayer(player).score += score;
      this.useShuffling &&
        this._fillPlayerShuffleBuffer(player, filteredSequence.length);
    } else {
      throw new TypeError("Invalid sequence received");
    }
  }

  /**
   *
   *
   * @private
   * @param {Player.userId} uid
   * @param {number} score
   * @memberof MatchService
   */
  private _fillPlayerShuffleBuffer(uid: Player.userId, score: number): void {
    this.getPlayer(uid).shuffleBuffer += score;
    if (this.getPlayer(uid).shuffleBuffer >= this.shuffleActivationTarget) {
      this.getPlayer(uid).enableShuffling();
    }
  }

  /**
   *
   *
   * @private
   * @return {*}
   * @memberof MatchService
   */
  private async _onSequenceNotFound(): Promise<void> {
    const emptyStack = this._lastUpdatedCells.length === 0;

    if (emptyStack) this._checkGameStatus();
    else
      await this.checkLastUpdatedCells().catch((error) => {
        console.error(error);
        this.state = MatchStates.error;
      });

    return;
  }

  /**
   *
   *
   * @private
   * @memberof MatchService
   */
  private _checkGameStatus() {
    this.state = MatchStates.checking_game_status;

    const existsEmptyCells = this.board.emptyCells.length > 0;
    const nextPlayer = this.players.filter(
      (player) => player.state === PlayerStates.next_to_move
    )[0];

    if (existsEmptyCells) {
      //nextPlayer.state = PlayerStates.waiting_for_opponent_move;
      this.state = MatchStates.waiting_for_player_move;
    } else {
      const canNextPlayerShuffle = nextPlayer.canShuffle;
      if (canNextPlayerShuffle) {
        this.state = MatchStates.waiting_for_player_move;
      } else {
        const [scorePlayer1, scorePlayer2] = this.players.map(
          (player) => player.score
        );

        if (scorePlayer1 > scorePlayer2) {
          this.players[0].state = PlayerStates.winner;
          this.players[1].state = PlayerStates.loser;
        } else if (scorePlayer1 < scorePlayer2) {
          this.players[1].state = PlayerStates.winner;
          this.players[0].state = PlayerStates.loser;
        } else {
          this.players[1].state = PlayerStates.draw;
          this.players[0].state = PlayerStates.draw;
        }
      }
    }
  }

  /**
   * Generate default configurations for new instances
   * @private
   * @return {*}  {string}
   * @memberof MatchService
   */
  public static generateConfigs(type: MatchTypes, host: PlayerService) {
    let initialConfigs: any = {
      type: type,
      _state: MatchStates.building,
    };

    if (type === MatchTypes.PLAYER_VS_PLAYER) {
      const roomCode = MatchService.generateCode(host.displayName);
      initialConfigs = {
        ...initialConfigs,
        id: roomCode,
      };
    } else {
      const opponent = convertClassToObject(BotService);

      initialConfigs = {
        ...initialConfigs,
        opponent,
      };
    }

    return initialConfigs;
  }

  /**
   * Creates a new instance
   * @param match
   * @returns
   */
  public static create(data: Partial<MatchService>) {
    const { players, board, ...match } = data;

    if (!players || !board || !match) throw new TypeError("Bad data received");

    const users = players.map<User>((player: Partial<PlayerService>) => {
      const { uid, displayName, photoURL } = player;
      if (uid && displayName && photoURL) return { uid, displayName, photoURL };
      else throw new TypeError("Bad players data received");
    });

    if (users.length < 1 || users.length > 2)
      throw new TypeError("Need at least a player and maximum 2");

    if (match.type === undefined) throw new TypeError("Invalid match type");

    const newMatch = new MatchService(users as [User, User?], match.type);

    if (!(newMatch instanceof MatchService))
      throw new TypeError("Bad instance of MatchService");

    newMatch.sync(match);

    newMatch.players.forEach((player: PlayerService | undefined, index) => {
      if (!(player instanceof PlayerService))
        throw new TypeError("Bad instance of PlayerService");
      else {
        newMatch.players[index].sync(players[index]);
      }
    });

    if (!(newMatch.board instanceof BoardService))
      throw new TypeError("Bad instance of BoardService");

    newMatch.board.sync(board);

    return newMatch;
  }

  /**
   * syncronize own props with passed data
   * @param {*} data
   * @memberof MatchService
   */
  public sync(data: { [x: string]: any }): void {
    if (!data) return;

    const filteredFields = filterDifferentFields(this, data);

    for (const [name, value] of Object.entries(filteredFields)) {
      const isPublic = !name.startsWith("_");

      if (isPublic) {
        this[name as keyof this] = value;
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
   * Search for a match with the passed id and return match properties
   *
   * @static
   * @param {string} matchId
   * @return {*}  {(Match | null)}
   * @memberof MatchService
   */
  public static async findMatchById(
    matchId: string
  ): Promise<Match.default | null> {
    return null;
  }

  /**
   * If the second argument is specified,
   * the method returns all matches between the two players
   *
   * @static
   * @param {Player["userId"]} player1
   * @param {Player["userId"]} [player2] (optional)
   * @return {*}  {Match[]}
   * @memberof MatchService
   */
  public static async findMatchByPlayers(
    player1: Player.userId,
    player2?: Player.userId
  ): Promise<Match.default[]> {
    return [];
  }

  /**
   * Join user to match creating a new player
   * @memberof MatchService
   */
  public join(
    user: User,
    options: Partial<Player.options> = {}
  ): PlayerService {
    const exists = this.getPlayer(user.uid) instanceof PlayerService;
    if (!exists) {
      if (this.players.length > 1)
        throw new Error("Reached the maximum number of players");
      else {
        this.players.push(new PlayerService(user, options));
        this.players[1].subscribe((data) => {
          const { state } = data;
          state && this._playersStates$[1].next(state);
        });
      }
    }

    const index = this.getPlayerIndex(user.uid);
    return this.players[index];
  }

  /**
   * Emits internal events to subscribers
   */
  public subscribe(
    callback: Partial<Observer<Partial<MatchService>>> | ((data: any) => void)
  ): Subscription {
    const props =
      typeof callback === "function"
        ? {
            next: callback,
            error: (error: any) => {
              throw error;
            },
          }
        : Reflect.has(callback, "next")
        ? callback
        : undefined;
    return this._changes$
      .pipe(distinctUntilChanged((prev, curr) => _.isEqual(prev, curr)))
      .subscribe(props);
  }

  /**
   * Returns the player instance
   * @param {Player.userId} userId
   * @return {*}  {PlayerService}
   * @memberof MatchService
   */
  public getPlayer(userId: Player.userId): PlayerService {
    return this.players.filter((player) => player.uid === userId)[0];
  }

  /**
   * Returns the opponent instance
   * @param {Player.userId} userId
   * @return {*}  {(PlayerService | BotService)}
   * @memberof MatchService
   */
  public getOpponent(userId: Player.userId): PlayerService | BotService {
    return this.players.filter((player) => player.uid !== userId)[0];
  }

  /**
   *
   *
   * @param {Player.userId} userId
   * @return {*}  {number}
   * @memberof MatchService
   */
  public getPlayerIndex(userId: Player.userId): number {
    return this.players.findIndex((player) => player.uid === userId);
  }

  /**
   * Generate a 8 character length alphanumeric string
   * @param {String} displayName
   * @returns
   */
  public static generateCode(displayName: string): string {
    const consonants = displayName
      .replace(/[aeiou\s+]/gi, "")
      .substr(0, 4)
      .toLocaleUpperCase();

    const randomNumber = _.random(1000, 9999).toString();

    const composedCode = consonants + randomNumber;

    const shuffleCode = _.shuffle(composedCode.split(""));

    return shuffleCode.join("");
  }
}
