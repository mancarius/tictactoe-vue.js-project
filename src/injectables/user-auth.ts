import { Actions } from "@/helpers/enums/actions.enum";
import { Getters } from "@/helpers/enums/getters.enum";
import { Mutations } from "@/helpers/enums/mutations.enum";
import { MutationPayload, useStore } from "vuex";

export default function useUserAuth() {
  const store = useStore();

  async function requireAuth() {
    store.dispatch(Actions.USER_REQUIRE_AUTH);

    const authed = await new Promise<boolean>((resolve, reject) => {
      store.subscribe((mutation: MutationPayload) => {
        if (mutation.type === Mutations.USER_SET) {
          store.getters[Getters.USER_IS_AUTHED] ? resolve(true) : reject(false);
        }
      });
    });

    store.dispatch(Actions.USER_REQUIRE_AUTH, false);

    return authed;
  }

  return { requireAuth };
}
