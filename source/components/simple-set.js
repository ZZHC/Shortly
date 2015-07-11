import {EventEmitter} from 'events'

class SimpleSet extends EventEmitter {
  constructor(initArray=[]) {
    super();
    this._setArray = initArray.slice();
  }

  push(item) {
    this._setArray.push(item);
    this.emit('change');
  }

  remove(item) {
    var setIndex = this._setArray.indexOf(item);
    if (setIndex < 0) return false;

    this._setArray.splice(setIndex, 1);
    this.emit('change');
  }

  findWithKey(key, options={value: undefined}) {
    var i = 0, item;

    if (!options.value) return false;

    for (i in this._setArray) {
      item = this._setArray[i];
      if (item[key] === options.value) return item;
    }
  }

  toArray() {
    return this._setArray.slice();
  }
}

export default SimpleSet
