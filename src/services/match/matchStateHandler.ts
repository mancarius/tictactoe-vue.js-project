import { MatchStates } from "@/helpers/enums/match-states.enum";
import { PlayerStates } from "@/helpers/enums/player-states.enum";
import PlayerService from "../player.service";

export function stateHandler(
  matchState: MatchStates,
  p1State: PlayerStates,
  p2State: PlayerStates
): MatchStates | undefined {
  if (
    p1State === PlayerStates.disconnected ||
    p2State === PlayerStates.disconnected
  ) {
    return MatchStates.player_left_the_room;
  }

  console.log("before", {
    matchState: matchState,
    p1State,
    p2State,
  });

  if (
    /*
     * Waiting player ready
     */
    p1State === PlayerStates.in_lobby ||
    p2State === PlayerStates.in_lobby
  ) {
    return MatchStates.waiting_players_ready;
  } else if (
    /*
     * Ready
     */
    matchState === MatchStates.waiting_players_ready &&
    PlayerService.isPlayerReady(p1State) &&
    PlayerService.isPlayerReady(p2State)
  ) {
    return MatchStates.ready;
  } else if (
    /*
     * Starting
     */
    matchState === MatchStates.ready &&
    (p1State === PlayerStates.ready || p1State === PlayerStates.in_game) &&
    (p2State === PlayerStates.ready || p2State === PlayerStates.in_game)
  ) {
    return MatchStates.starting;
  } else if (
    /*
     * Started
     */
    p1State === PlayerStates.in_game &&
    p2State === PlayerStates.in_game
  ) {
    return MatchStates.started;
  } else if (
    /*
     * Waiting for player move
     */
    matchState === MatchStates.started &&
    (p1State === PlayerStates.in_game ||
      p1State === PlayerStates.waiting_for_opponent_move ||
      p1State === PlayerStates.moving ||
      p1State === PlayerStates.next_to_move) &&
    (p2State === PlayerStates.in_game ||
      p2State === PlayerStates.waiting_for_opponent_move ||
      p2State === PlayerStates.moving ||
      p2State === PlayerStates.next_to_move)
  ) {
    return MatchStates.waiting_for_player_move;
  } else if (
    /*
     * Shaking board
     */
    matchState === MatchStates.waiting_for_player_move &&
    (p1State === PlayerStates.shuffling || p2State === PlayerStates.shuffling)
  ) {
    return MatchStates.shaking_board;
  } else if (
    /*
     * Checking sequence
     */
    (matchState === MatchStates.waiting_for_player_move ||
      matchState === MatchStates.shaking_board) &&
    ((p1State === PlayerStates.last_to_move &&
      p2State === PlayerStates.waiting_for_opponent_move) ||
      (p1State === PlayerStates.waiting_for_opponent_move &&
        p2State === PlayerStates.last_to_move))
  ) {
    return MatchStates.checking_sequence;
  } else if (
    /*
     * Sequence found
     */
    matchState === MatchStates.checking_sequence &&
    (p1State === PlayerStates.score || p2State === PlayerStates.score)
  ) {
    return MatchStates.sequence_found;
  } else if (
    /*
     * Terminated
     */
    matchState === MatchStates.checking_game_status &&
    (p1State === PlayerStates.winner ||
      p1State === PlayerStates.loser ||
      p1State === PlayerStates.draw) &&
    (p2State === PlayerStates.winner ||
      p2State === PlayerStates.loser ||
      p2State === PlayerStates.draw)
  ) {
    return MatchStates.terminated;
  } else if (
    /*
     * Waiting for player ready
     */
    (matchState === MatchStates.terminated ||
      matchState === MatchStates.resetting) &&
    (p1State === PlayerStates.ready || p2State === PlayerStates.ready)
  ) {
    return MatchStates.waiting_players_ready;
  }
}
