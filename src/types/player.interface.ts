import * as User from "./user.interface";

export type sign = string;

export type userId = User.uid;

export type isHost = boolean;

export type score = number;

export interface options {
  sign?: sign;
  isHost?: isHost;
  customName?: string;
}

export default interface Player extends User.default {
  options?: options;
  score?: score
}
