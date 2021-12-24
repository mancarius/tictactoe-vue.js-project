import db from "@/helpers/db";
import User from "@/types/user.interface";
import { collection, doc, getDoc, setDoc } from "@firebase/firestore";

export default class UserService {
  public readonly uid: User["uid"];
  public readonly displayName: User["displayName"];
  public readonly photoURL: User["photoURL"];
  public settings: User["settings"] | undefined;

  constructor({ uid, displayName, photoURL }: User) {
    this.uid = uid;
    this.displayName = displayName;
    this.photoURL = photoURL;
    UserService.getSettings(uid)
      .then((settings) => {
        this.settings = settings;
      })
      .catch((error) => {
        console.error(error);
      });
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
