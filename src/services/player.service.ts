import { PlayerStates } from "@/helpers/enums/player-states.enum";
import * as Player from "@/types/player.interface";
import User from "@/types/user.interface";
import { Subject } from "rxjs";
import BoardService from "./board.service";
import UserService from "./user.service";

const changes$: Subject<Partial<PlayerService>> = new Subject();
export default class PlayerService extends UserService {
  private _lastUpdate: any;
  protected _options: Player.options = {};
  protected _state: PlayerStates = PlayerStates.in_lobby;
  protected _score: Player.score = 0;
  private get _changes$(): Subject<Partial<PlayerService>> {
    return changes$;
  }

  constructor(user: User, options?: Player.options) {
    super(user);
    this._options = { ...this._options, ...options };
  }

  public move(position: number, board: BoardService) {
    const canMove = board.emptyCells.some((cell) => cell === position);
    if (canMove) {
      try {
        board.updateCell(position, { player: this.uid });
      } catch (err) {
        console.error(err);
        throw err;
      }
    } else {
      throw new Error("Invalid position");
    }
  }

  public get state(): PlayerStates {
    return this._state;
  }

  public set state(value: PlayerStates) {
    this._state = value;
    this._changes$.next({ ["_state" as string]: this._state });
  }

  public set options(value: Partial<Player.options>) {
    this._options = { ...this.options, ...value };
    this._changes$.next({ ["_options" as string]: this._options });
  }

  public get options(): Player.options {
    return this._options;
  }

  public set score(value: Player.score) {
    this._score = value;
    this._changes$.next({ ["_score" as string]: this._score });
  }

  public get score(): Player.score {
    return this._score;
  }

  public get nickName(): string {
    return this._options.customName ?? this.displayName;
  }

  public sync(data: any): void {
    data && Object.assign(this, data);
  }

  public subscribe(callback: (data: Partial<PlayerService>) => void) {
    this._changes$.subscribe((data) => callback(data));
  }
}
