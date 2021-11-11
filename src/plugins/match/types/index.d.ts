/* eslint-disable */
import { ComponentCustomProperties } from "@vue/runtime-core";

declare module "@vue/runtime-core" {
  import MatchPlugin from "match-plugin.interface";

  export interface ComponentCustomProperties {
    $match: MatchPlugin;
  }
}