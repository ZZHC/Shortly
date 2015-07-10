import {EventEmitter} from 'events'

class TaskQueue extends EventEmitter {
  constructor(initArray=[]) {
    super();
    this._queueArray = initArray.slice();
  }

  push(task) {
    this._queueArray.push(task);
    this.emit('change');
  }

  remove(task) {
    var queueIndex = this._queueArray.indexOf(task);
    if (queueIndex < 0) return false;

    this._queueArray.slice(queueIndex, 1);
    this.emit('change');
  }

  findWithBrowserWindow(browserWindow) {
    var i, task;

    for (i = 0; i < this._queueArray.length; i++) {
      task = this._queueArray[i];
      if (task.browserWindow === browserWindow) return task;
    }
  }

  toArray() {
    this._queueArray.slice();
  }
}

export default TaskQueue
