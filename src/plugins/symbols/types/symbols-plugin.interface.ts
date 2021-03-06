import { CollectionReference } from "@firebase/firestore";
import { DocumentData } from "firestore-jest-mock/mocks/helpers/buildDocFromHash";

export type SymbolFilename = string;

export type SymbolCode = string;

export type SymbolLabel = string;

export interface SymbolOptions {
  localPath: string;
}

export interface Symbol_ {
  code: SymbolCode;
  filename: SymbolFilename;
  label: SymbolLabel;
}

export default interface SymbolsPlugin {
  options: SymbolOptions;

  _collectionRef: CollectionReference<DocumentData> | null;

  _collection: Symbol_[];

  all(): Promise<Symbol_[]>;

  getFilename(code: SymbolCode): Promise<SymbolFilename | null>;

  getFullPath(code: SymbolCode): Promise<string | null>;
}
