import { MatchStates } from "@/helpers/enums/match-states.enum";
import * as Match from "@/types/match.interface";
import Player from "@/types/player.interface";
import SequenceFinderService from "./sequence-finder.service";

export default class MatchService {
  private _id: Match.id | undefined;
  private _players: Match.players;
  private _board: Match.board;
  private _state: Match.state = MatchStates.dormiant;

  constructor(players: Match.players, board: Match.board) {
    this._players = players;
    this._board = board;
    this._createNewMatch();
  }

  /**
   * Creates new match and returns generated id
   *
   * @private
   * @return {*}  {string}
   * @memberof MatchService
   */
  private async _createNewMatch(): Promise<string> {
    return "match_id";
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
  public static async findMatchByPlayer(
    player1: Player["userId"],
    player2?: Player["userId"]
  ): Promise<Match.default[]> {
    return [];
  }

  /**
   * Saves the match state
   *
   * @return {*}  {Promise<void>}
   * @memberof MatchService
   */
  public async save(): Promise<void> {
    return undefined
  }

  public async checkSequence(id: number): Promise<any> {
    const sequenceFinder = new SequenceFinderService(
      this.board.configurations,
      this.board.cells,
      this.board.cells[id].player
    );

    const sequences = await sequenceFinder.allPassingSequences(this.board.cells[id]);
    if (sequences.length) {
      return { player: this.board.cells[id].player , sequences};
    } else {
      return false;
    }
  }

  // getters & setters

  public set board(value: Match.board) {
    this._board = value;
  }

  public get board(): Match.board {
    return this._board;
  }

  public set state(value: Match.state) {
    this._state = value;
  }

  public get state(): Match.state {
    return this._state;
  }

  public get players(): Match.players {
    return this._players;
  }

  public get id(): Match.id {
    return this._id as Match.id;
  }
}
