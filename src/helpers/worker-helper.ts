// WorkerHelper.js
export default class WorkerHelper {
  private worker;
  private events: any;

  /**
   * The constructor expects as first argument the URL of the Worker file.
   *
   * @param {String} scriptPath
   */
  constructor(scriptPath: string) {
    const _this = this;
    this.worker = new Worker(scriptPath);
    this.events = {};

    this.worker.addEventListener(
      "message",
      function (e) {
        if (Object.prototype.hasOwnProperty.call(_this.events, e.data.event)) {
          _this.events[e.data.event].call(null, e.data.data);
        }
      },
      false
    );

    this.worker.addEventListener(
      "error",
      function (e) {
        if (Object.prototype.hasOwnProperty.call(_this.events, "error")) {
          _this.events["error"].call(null, e);
        }
      },
      false
    );
  }

  /**
   * Returns the original WebWorker instance.
   *
   * @returns {Worker}
   */
  getWorker() {
    return this.worker;
  }

  /**
   * Triggers an event in the WebWorker.
   *
   * @param {*} eventName
   * @param {*} data
   */
  trigger(eventName: string, data: any) {
    this.worker.postMessage({
      eventName: eventName,
      data: data,
    });
  }

  /**
   * Responds to an event from the web worker.
   *
   * @param {*} eventName
   * @param {*} callback
   */
  on(eventName: any, callback: Function) {
    this.events[eventName] = callback;
  }
}
