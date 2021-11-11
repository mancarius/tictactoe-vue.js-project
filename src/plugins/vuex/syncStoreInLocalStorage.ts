import { Mutations } from "@/helpers/enums/mutations.enum";
import _ from "lodash";
import { Store } from "vuex"
import { State } from "vuex/core"

const syncStateToStorage = (store: Store<State>) => {
    const storageType: "localStorage" | "sessionStorage" =
      process.env.VUE_APP_STATE_STORAGE;
    const storage = window[storageType] as Storage;

    store.subscribe((mutation, state) => {
        if (mutation.type !== Mutations.STATE_UPDATE) {
            const nextState = _.cloneDeep(state);
            storage.setItem("APP_STATE", JSON.stringify(nextState));
        }
    });
}

export default syncStateToStorage;