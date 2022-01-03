import db from "@/helpers/db";
import User from "@/types/user.interface";
import { collection, doc, getDoc, setDoc } from "@firebase/firestore";

export default class UserService {
  public readonly uid: User["uid"];
  public readonly displayName: User["displayName"];
  public readonly photoURL: User["photoURL"];
  protected settings: User["settings"];

  constructor({ uid, displayName, photoURL, settings }: User) {
    this.uid = uid;
    this.displayName = displayName;
    this.photoURL = photoURL;
    this.settings = settings || {};
  }
}
