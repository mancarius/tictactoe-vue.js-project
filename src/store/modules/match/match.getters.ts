import { Getters } from "@/helpers/enums/getters.enum";
import { GetterTree } from "vuex";
import { State } from "vuex/core";

const getters: GetterTree<State["match"], State> = {
  player: ({ player }: State["match"]) => player,

  opponent: ({ opponent }: State["match"]) => opponent,

  [Getters.MATCH_EXIT]: ({ exit }) => exit,

  [Getters.MATCH_STATE]: ({ state }) => state,

  [Getters.PLAYER_STATE]: ({ player }) => player.state,

  [Getters.OPPONENT_STATE]: ({ opponent }) => opponent.state,
};

export default getters;
