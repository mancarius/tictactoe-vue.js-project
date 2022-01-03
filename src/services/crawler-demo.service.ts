import * as Board from "@/types/board-types.interface";
import Worker from "worker-loader!@/workers/crawler.worker";

export default class CrawlerDemoService {
  private _boardConfigs: Board.configurations;
  private _player: Board.cell["player"];
  public promise: undefined | Promise<any>;

  constructor(
    boardConfigs: Board.configurations,
    player: Board.cell["player"] = null
  ) {
    this._boardConfigs = boardConfigs;
    this._player = player;
  }

  public async launch(virtualCellCollection: Board.cell[]) {
    if ("Worker" in window) {
      const crawler = new Worker();

      return new Promise((resolve, reject) => {
        crawler.postMessage([this._boardConfigs, this._player, virtualCellCollection]);

        crawler.addEventListener("message", (e: any) => {
          resolve(e.data);
        });
      });
    } else return Promise.reject();
  }
}
