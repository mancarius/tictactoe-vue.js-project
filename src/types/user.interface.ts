export type displayName = string;

export type uid = string;

export type photoURL = string;

export interface userSettings {
  nickname?: string
}


export default interface User {
  displayName: displayName;
  uid: uid;
  photoURL: photoURL;
  settings?: userSettings;
}