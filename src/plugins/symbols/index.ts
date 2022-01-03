import { inject } from "@vue/runtime-core";
import plugin from "./src/plugin";
import SymbolsPlugin from "./types/symbols-plugin.interface";

export function useSymbols(): SymbolsPlugin {
  return inject("symbols") as SymbolsPlugin;
}

const symbols = plugin;

export default symbols;