import User from "@/types/user.interface";

export default class UserService {
  public readonly uid: User["uid"];
  public readonly displayName: User["displayName"];
  public readonly photoURL: User["photoURL"];

  constructor({ uid, displayName, photoURL }: User) {
    this.uid = uid;
    this.displayName = displayName;
    this.photoURL = photoURL;
  }
}
