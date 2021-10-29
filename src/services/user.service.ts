export default class UserService {
  private _uid: string | null = null;
  private _name: string | null = null;

  constructor(uid: string, name: string) {
    this._uid = uid;
    this._name = name;
  }

  public get uid() {
    return this._uid;
  }

  public get name() {
    return this._name;
  }
}
