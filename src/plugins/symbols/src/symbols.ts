import db from "@/helpers/db";
import { collection, doc, getDoc, getDocs, query } from "@firebase/firestore";
import SymbolsPlugin, {
  Symbol_,
} from "../types/symbols-plugin.interface";

export const symbols: SymbolsPlugin = {
  _collectionRef: collection(db, "symbols"),

  options: {
    localPath: "assets/symbols/",
  },

  _collection: [],

  async all() {
    const q = query(this._collectionRef);

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      return { code: doc.id, ...doc.data() } as Symbol_;
    });
  },

  async getFilename(code: string) {
    if (this._collection.length) {
      const symbol = this._collection.filter(
        (symbol: Symbol_) => symbol.code === code
      )[0] as Symbol_ | undefined;

      return symbol?.filename ?? null;
    } else {
      const docRef = doc(db, "symbols", code);
      const docSnap = await getDoc(docRef);

      return docSnap.exists() ? docSnap.data().filename : null;
    }
  },

  async getFullPath(code: string) {
    const filename = await this.getFilename(code);

    if (filename) {
      return require("@/" + this.options.localPath + filename);
    } else {
      return null;
    }
  },
};

symbols.all().then((data: Symbol_[]) => {
  symbols._collection = data;
});
