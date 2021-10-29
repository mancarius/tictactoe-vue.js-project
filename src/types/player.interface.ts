export type displayname = string;

export type userId = string;

export type sign = string;


export default interface Player {
  displayname: displayname;
  userId?: userId;
  sign: sign;
}