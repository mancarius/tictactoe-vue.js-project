/* eslint-disable */
import { ComponentCustomProperties } from "@vue/runtime-core";

declare module "@vue/runtime-core" {
  import SymbolsPlugin from "symbols-plugin.interface";

  export interface ComponentCustomProperties {
    $symbols: SymbolsPlugin;
  }
}