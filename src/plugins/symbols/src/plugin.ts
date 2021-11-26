import { Plugin } from "@vue/runtime-core";
import { reactive } from "vue";
import { SymbolOptions } from "../types/symbols-plugin.interface";
import { symbols } from "./symbols";

const plugin: Plugin = {
  install: (app, customOptions?: SymbolOptions) => {
    if (customOptions !== undefined)
      symbols.options = { ...symbols.options, ...customOptions };

    app.config.globalProperties.$symbols = reactive(symbols);

    app.provide("symbols", reactive(symbols));
  },
};

export default plugin;
