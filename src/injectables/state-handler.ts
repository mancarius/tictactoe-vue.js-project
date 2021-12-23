import { MatchStates } from "@/helpers/enums/match-states.enum";
import { PlayerStates } from "@/helpers/enums/player-states.enum";
import { match } from "@/plugins/match/src/match";

export function useStateHandler() {
  const setPlayerState = (state: PlayerStates) => {
    console.log("setPlayerState", state);
    if (match.player)
      match.player.state !== state && (match.player.state = state);
    else throw new Error("Player is not initialized");
  };

  const setOpponentState = (state: PlayerStates) => {
    if (match.opponent)
      match.opponent.state !== state && (match.opponent.state = state);
    else throw new Error("Opponent is not initialized");
  };

  const setMatchState = (state: MatchStates) => {
    if (match.service)
      match.service.state !== state && (match.service.state = state);
    else throw new Error("Match is not initialized");
  };

  return { setPlayerState, setOpponentState, setMatchState };
}
