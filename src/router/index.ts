import { Actions } from "@/helpers/enums/actions.enum";
import { Getters } from "@/helpers/enums/getters.enum";
import { MatchTypes } from "@/helpers/enums/match-types.enum";
import { Mutations } from "@/helpers/enums/mutations.enum";
import { Routes } from "@/helpers/enums/routes.enum";
import store from "@/store";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { MutationPayload } from "vuex";
import PageHome from "../views/PageHome.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: Routes.home,
    component: PageHome,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/account/settings",
    name: Routes.accountSettings,
    component: () =>
      import(/* webpackChunkName: "match" */ "../views/PageSettings.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/:matchType",
    component: () =>
      import(/* webpackChunkName: "match" */ "../views/Match/PageMatch.vue"),
    props: true,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "builder",
        name: Routes.builder,
        component: () =>
          import(/* webpackChunkName: "match" */ "../views/Match/PageBuilder.vue"),
      },
      {
        path: "room-code",
        name: Routes.roomCode,
        component: () =>
          import(/* webpackChunkName: "match" */ "../views/Match/PageRoomCode.vue"),
      },
      {
        path: ":matchId/lobby",
        name: Routes.lobby,
        component: () =>
          import(/* webpackChunkName: "match" */ "../views/Match/PageLobby.vue"),
      },
      {
        path: ":matchId/game",
        name: Routes.game,
        component: () =>
          import(/* webpackChunkName: "match" */ "../views/Match/PageGame.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.VUE_APP_BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // check for user authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const isPvP = to.params.matchType === MatchTypes.PLAYER_VS_PLAYER;

    if (!isPvP || store.getters[Getters.USER_IS_AUTHED]) {
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
