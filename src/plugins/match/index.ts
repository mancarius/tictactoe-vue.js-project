import MatchPlugin from "@/plugins/match/types/match-plugin.interface";
import { inject } from "@vue/runtime-core";
import plugin from "./src/plugin";

export function useMatch(): MatchPlugin {
  return inject("match") as MatchPlugin;
}

const match = plugin;

export default match;