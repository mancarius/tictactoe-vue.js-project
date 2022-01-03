import { Plugin } from "@vue/runtime-core";
import { MatchPluginOptions } from "@/plugins/match/types/match-plugin.interface";
import { reactive } from "vue";
import { defaultOptions } from "./match";
import { match } from "./match";

const plugin: Plugin = {
  install: (app, customOptions?: Partial<MatchPluginOptions>) => {
    match.options = customOptions
      ? { ...defaultOptions, ...customOptions }
      : defaultOptions;

    app.config.globalProperties.$match = reactive(match);

    app.provide("match", reactive(match));
  },
};

export default plugin;
