import Player from "@/types/player.interface";
import { GetterTree } from "vuex";
import { State } from "vuex/core";

const getters: GetterTree<State["match"], State> = {
  player: ({players}: State["match"]) => players[0],

  opponent: ({players}: State["match"]) => players[1],

  host: (match: State["match"]) => match.players.map((player: Player) => player.uid === match.host)
};

export default getters;
