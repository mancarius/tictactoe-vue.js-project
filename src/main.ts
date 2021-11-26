import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/assets/global.scss";
import { Quasar } from "quasar";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import quasarUserOptions from "./quasar-user-options";
import match from "./plugins/match";
import symbols from "./plugins/symbols";

createApp(App)
  .use(match)
  .use(symbols)
  .use(Quasar, quasarUserOptions)
  .use(router)
  .use(store)
  .mount("#app");
