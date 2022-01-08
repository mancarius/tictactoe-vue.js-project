import db from "@/helpers/db";
import { collection, doc, getDoc, getDocs, query } from "@firebase/firestore";
import SymbolsPlugin, { Symbol_ } from "../types/symbols-plugin.interface";
import { symbolsDB } from "./symbolsDB";

export const symbols: SymbolsPlugin = {
  _collectionRef: db?.type ? collection(db, "symbols") : null,

  options: {
    localPath: "assets/symbols/",
  },

  _collection: [],

  async all() {
    console.log("symbols - all:", db);
    if (this._collectionRef) {
      const q = query(this._collectionRef);

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        return { code: doc.id, ...doc.data() } as Symbol_;
      });
    } else {
      return symbolsDB;
    }
  },

  async getFilename(code: string) {
    if (this._collection.length) {
      const symbol = this._collection.filter(
        (symbol: Symbol_) => symbol.code === code
      )[0] as Symbol_ | undefined;

      return symbol?.filename ?? null;
    } else {
      if (db) {
        const docRef = doc(db, "symbols", code);
        const docSnap = await getDoc(docRef);

        return docSnap.exists() ? docSnap.data().filename : null;
      } else {
        return symbolsDB.filter((symbol) => symbol.code === code);
      }
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
