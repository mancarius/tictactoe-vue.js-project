import BoardService from "./board.service";
import UserService from "./user.service";

interface PlayerOptions {
  color?: string;
}

export class PlayerService extends UserService {
  private _options: PlayerOptions = {};

  constructor(uid: string, name: string, options?: PlayerOptions) {
    super(uid, name);
    this._options = { ...this._options, ...options };
  }

  public move(position: number, board: BoardService) {
    const canMove = board.emptyCells.some((cell) => cell === position);
    if (canMove) {
      try {
        board.updateCell(position, { player: this.uid });
      } catch (err) {
        console.error(err);
        throw err;
      }
    } else {
      throw new Error("Invalid position");
    }
  }
}
