class TaskQueue {
  constructor(initArray=[]) {
    this._queueArray = initArray.slice();
  }

  push(task) {
    this._queueArray.push(task);
  }

  remove(task) {
    var queueIndex = this._queueArray.indexOf(task);
    if (queueIndex < 0) return false;

    this._queueArray.slice(queueIndex, 1);
  }

  toArray() {
    this._queueArray.slice();
  }
}

export default TaskQueue
