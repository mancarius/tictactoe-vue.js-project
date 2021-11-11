import { Actions } from "@/helpers/enums/actions.enum";
import { Getters } from "@/helpers/enums/getters.enum";
import { Mutations } from "@/helpers/enums/mutations.enum";
import store from "@/store";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { MutationPayload } from "vuex";
import Home from "../views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/match/:matchType",
    component: () =>
      import(/* webpackChunkName: "match" */ "../views/Match/index.vue"),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "room-code",
        name: "RoomCode",
        component: () =>
          import(/* webpackChunkName: "match" */ "../views/Match/RoomCode.vue"),
      },
      {
        path: ":matchId/lobby",
        name: "Lobby",
        component: () =>
          import(/* webpackChunkName: "match" */ "../views/Match/Lobby.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (store.getters[Getters.USER_IS_AUTHED]) {
      next();
    } else {
      store.dispatch(Actions.USER_REQUIRE_AUTH);

      await new Promise((resolve, reject) => {
        store.subscribe((mutation: MutationPayload) => {
          if (mutation.type === Mutations.USER_SET) {
            store.getters[Getters.USER_IS_AUTHED] ? resolve(true) : reject();
          }
        });
      })
        .then(() => next())
        .catch(() => {
          if (from.meta.requiresAuth !== undefined) next(false);
          else next("/");
        })
        .finally(() => store.dispatch(Actions.USER_REQUIRE_AUTH, false));
    }
  } else next();
});

export default router;
