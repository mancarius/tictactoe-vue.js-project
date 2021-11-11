import { convertClassToObject } from "@/helpers/convertClassToObject";
import { MatchStates } from "@/helpers/enums/match-states.enum";
import { MatchTypes } from "@/helpers/enums/match-types.enum";
import * as Board from "@/types/board-types.interface";
import * as Match from "@/types/match.interface";
import * as Player from "@/types/player.interface";
import User from "@/types/user.interface";
import _ from "lodash";
import { Subject } from "rxjs";
import BoardService from "./board.service";
import BotService from "./bot.service";
import PlayerService from "./player.service";
import SequenceFinderService from "./sequence-finder.service";

const changes$: Subject<Partial<MatchService>> = new Subject();

export default class MatchService {
  public readonly id: Match.id;
  public readonly players: (PlayerService | BotService)[];
  public readonly board: BoardService;
  public readonly type: MatchTypes = MatchTypes.PLAYER_VS_COMPUTER;
  private _state: Match.state = MatchStates.dormiant;
  private _createdAt: any;
  private _lastUpdate: any;

  constructor(
    players: [User, User?],
    type: MatchTypes,
    boardConfigs?: Partial<Board.configurations>
  ) {
    this.board = boardConfigs
      ? new BoardService(boardConfigs)
      : new BoardService();

    this.players = players
      .filter((user) => user !== undefined && user.uid !== "bot")
      .map<PlayerService>((user) => new PlayerService(user as User));

    if (type === MatchTypes.PLAYER_VS_COMPUTER) {
      const botSrv = players
        .filter((user) => user !== undefined && user.uid === "bot")
        .map<BotService>(() => new BotService(this.players[0], this.board));

      this.players = [...this.players, ...botSrv];

      this.id = "vsbot";
    } else {
      this.id = MatchService.generateCode(this.players[0].displayName);
    }

    this.type = type;
  }

  /**
   *
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
   *
   * @param match
   * @returns
   */
  public static create(match: any) {
    match.players = match.players.map((_player: any) => {
      const player = Object.setPrototypeOf(_player, PlayerService.prototype);
      if (!(player instanceof PlayerService))
        throw new Error("Invalid instance for Player");
      return player;
    });

    match.board = Object.setPrototypeOf(match.board, BoardService.prototype);
    if (!(match.board instanceof BoardService))
      throw new Error("Invalid instance for Board");

    const newMatch = Object.setPrototypeOf(match, MatchService.prototype);
    if (!(newMatch instanceof MatchService))
      throw new Error("Invalid instance for Match");

    return newMatch;
  }

  public sync(data: any): void {
    data && Object.assign(this, data);
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
   *
   * @memberof MatchService
   */
  public join(user: User): PlayerService {
    if (!(this.getPlayer(user.uid) instanceof PlayerService)) {
      if (this.players.length > 1)
        throw new Error("Reached the maximum number of players");
      else {
        const { uid, displayName, photoURL } = user;
        const player = Object.setPrototypeOf(
          { uid, displayName, photoURL },
          PlayerService.prototype
        );
        this.players.push(player);
      }
    }

    return this.getPlayer(user.uid);
  }

  /**
   *
   * @param id
   * @returns
   */
  public async checkSequence(id: number): Promise<any> {
    const sequenceFinder = new SequenceFinderService(
      this.board.configurations,
      this.board.cells,
      this.board.cells[id].player
    );

    const sequences = await sequenceFinder.allPassingSequences(
      this.board.cells[id]
    );

    if (sequences.length) {
      return { player: this.board.cells[id].player, sequences };
    } else {
      return false;
    }
  }

  /**
   *
   *
   * @readonly
   * @private
   * @type {Subject<Partial<MatchService>>}
   * @memberof MatchService
   */
  private get _changes$(): Subject<Partial<MatchService>> {
    return changes$;
  }

  /**
   *
   * @param callback
   */
  public subscribe(callback: (data: Partial<MatchService>) => void) {
    this._changes$.subscribe((data) => callback(data));
  }

  // getters & setters

  public set state(value: MatchStates) {
    this._state = value;
    this._changes$.next({ ["_state" as MatchService["state"]]: this._state });
  }

  public get state(): MatchStates {
    return this._state;
  }

  public getPlayer(userId: Player.userId): PlayerService {
    return this.players.filter((player) => player.uid === userId)[0];
  }

  public getOpponent(userId: Player.userId): PlayerService | BotService {
    return this.players.filter((player) => player.uid !== userId)[0];
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
