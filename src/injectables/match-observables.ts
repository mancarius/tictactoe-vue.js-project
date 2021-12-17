import { match } from "@/plugins/match/src/match";
import MatchService from "@/services/match/match.service";
import PlayerService from "@/services/player.service";

export default function useMatchObservables() {
  const subscribeMatch = (callback: (match: MatchService) => void) => {
    if (match.service instanceof MatchService) {
      match.service.subscribe((...args) => callback(...args));
    } else throw new Error("Match is not initialized");
  };

  const subscribePlayer = (callback: (player: PlayerService) => void) => {
    if (match.player instanceof PlayerService) {
      match.player.subscribe((...args) => callback(...args));
    } else throw new Error("Player is not initialized");
  };

  const subscribeOpponent = (callback: (player: PlayerService) => void) => {
    if (match.opponent instanceof PlayerService) {
      match.opponent.subscribe((...args) => callback(...args));
    } else throw new Error("Opponent is not initialized");
  };

  return { subscribeMatch, subscribePlayer, subscribeOpponent };
}
