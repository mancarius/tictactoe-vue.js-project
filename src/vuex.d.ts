declare module "vuex/core" {
  import { Store } from "vuex";
  import Match from "./types/match.interface";
  import Loading from "@/types/loading.interface";
  import User from "./types/user.interface";
  import MatchPlugin from "./types/match-plugin.interface";
  import AuthenticationService from "./services/authentication.service";
  // declare your own store states
  export interface State {
    loading: Loading.default;
    user: {
      data: User | null;
      requiredAuth: boolean;
    };
    match: Match;
  }
}
