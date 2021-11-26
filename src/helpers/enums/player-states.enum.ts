export enum PlayerStates {
  none,
  in_lobby,
  ready,
  in_game,
  waiting_for_opponent_move,
  waiting_for_opponent_join,
  next_to_move,
  calculating_next_move,
  moving,
  shuffling,
  last_to_move,
  no_available_moves,
  score,
  winner,
  loser,
  draw,
  disconnected,
}