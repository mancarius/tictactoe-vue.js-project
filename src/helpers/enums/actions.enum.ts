export enum Actions {
  USER_LOG_IN = "login",
  USER_LOG_OUT = "logout",
  USER_REQUIRE_AUTH = "requireAuth",
  STATE_INIT = "initializeState",
  MATCH_SAVE_PLAYER_INDEX = "storePlayerIndex",
  MATCH_SAVE_OPPONENT_INDEX = "storeOpponentIndex",
  MATCH_SET_STATE = "setMatchState",
  MATCH_EXIT = "leaveRoom",
  PLAYER_SET_STATE = "setPlayerState",
  OPPONENT_SET_STATE = "setOpponentState",
  LOADING_START = "openLoading",
  LOADING_STOP = "closeLoading",
}