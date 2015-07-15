import SimpleSet from '../components/simple-set'

const SPIN_SPEED = 85;
const BASE_URI = safari.extension.baseURI;
const [PLAYING, STOPPED] = ['playing', 'stopped'];

var _activeAnimators = new SimpleSet;

class ToolbarItemAnimator {
  static findWithToolbarItem(toolbarItem) {
    return this._activeAnimators.findWithKey('_toolbarItem', {value: toolbarItem});
  }

  static startAnimationFor(toolbarItem) {
    var currentAnimator = this.findWithToolbarItem(toolbarItem),
        newAnimator;

    if (currentAnimator) {
      return false
    } else {
      newAnimator = new this(toolbarItem);
      this._activeAnimators.push(newAnimator);
      newAnimator.start();
      return true
    }
  }

  static stopAnimationFor(toolbarItem) {
    var targetAnimator = this.findWithToolbarItem(toolbarItem);

    if (targetAnimator) {
      targetAnimator.stop();
      this._activeAnimators.remove(targetAnimator);
      return true
    } else {
      return false
    }
  }

  constructor(toolbarItem) {
    this._toolbarItem = toolbarItem;
    this._status = STOPPED;
  }

  start() {
    this._status = PLAYING;
    this._getNextFrame(1);
  }

  stop() {
    this._status = STOPPED;
  }

  _getNextFrame(frame) {
    var nextFrame = (frame % 12) + 1; // [1...12]
    this._toolbarItem.image = `${BASE_URI}spin/${frame}.png`;

    if (this._status === PLAYING) {
      setTimeout( () => { this._getNextFrame(nextFrame) }, SPIN_SPEED);
    } else {
      this._restoreDefaultFrame();
    }
  }

  _restoreDefaultFrame() {
    this._toolbarItem.image = BASE_URI + 'toolbarShorten.png';
  }

}

ToolbarItemAnimator._activeAnimators = _activeAnimators;

export default ToolbarItemAnimator
