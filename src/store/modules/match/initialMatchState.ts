import { MatchStates } from "@/helpers/enums/match-states.enum";
import { PlayerStates } from "@/helpers/enums/player-states.enum";

export const initialMatchState = {
  state: MatchStates.dormiant,
  player: {
    state: PlayerStates.none,
  },
  opponent: {
    state: PlayerStates.none,
  },
};
