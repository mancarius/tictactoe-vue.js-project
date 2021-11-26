import * as User from "./user.interface";

export type sign = string | null;

export type userId = User.uid;

export type isOwner = boolean;

export type score = number;

export interface options {
  sign: sign;
  customName: string;
  isOwner: isOwner;
}

export default interface Player extends User.default {
  options?: options;
  score?: score
}
