import { PlayerStates } from "@/helpers/enums/player-states.enum";
import filterDifferentFields from "@/helpers/filterDifferentFields";
import removeObservables from "@/helpers/removeObservables";
import * as Player from "@/types/player.interface";
import User from "@/types/user.interface";
import _ from "lodash";
import {
  distinctUntilChanged,
  Observer,
  ReplaySubject,
  Subject,
  Subscription,
} from "rxjs";
import BoardService from "./board.service";
import UserService from "./user.service";

export default class PlayerService extends UserService {
  public options: Player.options = {
    sign: null,
    customName: this.settings?.customName,
    isOwner: false,
  };
  public state: PlayerStates = PlayerStates.none;
  public score: Player.score = 0;
  public shuffleBuffer = 0;
  public canShuffle = false;
  public lastMoveTimestamp = 0;
  private _changes$: Subject<Partial<PlayerService>> = new ReplaySubject(1);

  constructor(user: User, options?: Partial<Player.options>) {
    super(user);

    if (options && Object.keys(options).length > 0)
      this.options = { ...this.options, ...options } as Player.options;

    return new Proxy(this, {
      set: (target: any, prop: string | symbol, value: any) => {
        const isTargetArray = Array.isArray(target[prop]);
        const isValueArray = Array.isArray(value);
        const isTargetObject =
          typeof target[prop] === "object" && !isTargetArray;
        const isValueObject = typeof value === "object" && !isValueArray;

        if (prop === "state" && value === PlayerStates.last_to_move) {
          target.lastMoveTimestamp = Date.now();
        }

        if (isTargetObject && isValueObject)
          target[prop] = { ...target[prop], ...value };
        else target[prop] = value;
        this._changes$.next({ [prop]: value });
        return true;
      },
    });
  }

  /**
   *
   *
   * @memberof PlayerService
   */
  public reset(): void {
    this.state = PlayerStates.in_lobby;
    this.score = 0;
    this.shuffleBuffer = 0;
    this.canShuffle = false;
  }

  /**
   *
   *
   * @static
   * @param {Partial<PlayerService>} data
   * @return {*}
   * @memberof PlayerService
   */
  public static create(data: Partial<PlayerService>) {
    const { displayName, uid, photoURL } = data;
    if (displayName && uid && photoURL) {
      const player = new PlayerService({ displayName, uid, photoURL });
      player.sync(data);
      return player;
    } else {
      throw new TypeError(
        "One or more from displayName, uid or photoURL misses or are invalid"
      );
    }
  }

  /**
   * Returns an object instance without observables
   *
   * @return {*}  {string}
   * @memberof PlayerService
   */
  public toObject(): { [x: string]: any } {
    return removeObservables(this);
  }

  public get customName(): string {
    return this.options.customName ?? this.displayName;
  }

  /**
   *
   *
   * @param {*} data
   * @memberof PlayerService
   */
  public sync(data: { [x: string]: any }): void {
    if (!data) return;
    const filteredFields = filterDifferentFields(this, data);

    for (const [name, value] of Object.entries(filteredFields)) {
      const isPublic = !name.startsWith("_");

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
   *
   * @memberof PlayerService
   */
  public subscribe(
    callback: Partial<Observer<Partial<PlayerService>>> | ((data: any) => void)
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
   *
   *
   * @memberof PlayerService
   */
  public enableShuffling(): void {
    this.canShuffle = true;
  }

  /**
   *
   *
   * @memberof PlayerService
   */
  public disableShuffling(): void {
    this.canShuffle = false;
  }

  /**
   *
   *
   * @memberof PlayerService
   */
  public clearShuffleBuffer(): void {
    this.shuffleBuffer = 0;
  }

  /**
   *
   *
   * @readonly
   * @type {boolean}
   * @memberof PlayerService
   */
  public get isReady(): boolean {
    return PlayerService.isPlayerReady(this.state);
  }

  /**
   *
   *
   * @static
   * @param {PlayerStates} state
   * @return {*}  {boolean}
   * @memberof PlayerService
   */
  public static isPlayerReady(state: PlayerStates): boolean {
    const readyStates = [
      PlayerStates.ready,
      PlayerStates.in_game,
      PlayerStates.moving,
      PlayerStates.next_to_move,
      PlayerStates.score,
      PlayerStates.shuffling,
      PlayerStates.waiting_for_opponent_move,
      PlayerStates.waiting_for_opponent_join,
    ];
    return readyStates.some((test) => test === state);
  }

  /**
   *
   *
   * @readonly
   * @type {Player.isOwner}
   * @memberof PlayerService
   */
  public get isOwner(): Player.isOwner {
    return this.options.isOwner ?? false;
  }

  /**
   * Update selected cell if empty and update the player state
   * @param {Player.userId} uid
   * @param {number} cellIndex
   * @memberof MatchService
   */
  public moveOrShuffle(board: BoardService, action: number | "shuffle"): void {
    if (action === "shuffle") {
      this.state = PlayerStates.shuffling;
    } else {
      this._move(board, action);
    }
  }

  /**
   *
   *
   * @private
   * @param {BoardService} board
   * @param {number} cellIndex
   * @memberof PlayerService
   */
  private _move(board: BoardService, cellIndex: number): void {
    const canMove = board.emptyCells.some((cell) => cell === cellIndex);

    if (canMove) {
      try {
        board.updateCell(cellIndex, { player: this.uid });
        this.state = PlayerStates.last_to_move;
      } catch (err) {
        console.error(err);
        throw err;
      }
    } else {
      throw new Error("Bad position. Required cell is not empty");
    }
  }
}
