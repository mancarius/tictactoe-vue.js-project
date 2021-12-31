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
    this.settings = settings;
  }

  /**
   *
   *
   * @static
   * @param {User["uid"]} uid
   * @return {*}  {(Promise<User["settings"] | Record<string, unknown>>)}
   * @memberof UserService
   */
  public static async getSettings(
    uid: User["uid"]
  ): Promise<User["settings"] | Record<string, unknown>> {
    const collectionRef = collection(db, "users_settings");
    const docRef = doc(collectionRef, uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as User["settings"]) : {};
  }

  /**
   *
   *
   * @static
   * @param {User["uid"]} uid
   * @param {User["settings"]} settings
   * @return {*}  {Promise<void>}
   * @memberof UserService
   */
  public static async saveSettings(
    uid: User["uid"],
    settings: User["settings"]
  ): Promise<void> {
    const collectionRef = collection(db, "users_settings");
    const docRef = doc(collectionRef, uid);
    return await setDoc(docRef, settings);
  }
}
