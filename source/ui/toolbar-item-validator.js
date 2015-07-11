import ToolbarItemAnimator from './toolbar-item-animator'

class ToolbarItemValidator {
  static validateAll() {
    var i = 0, _ref = safari.extension.toolbarItems;
    for (i in _ref) _ref[i].validate();
  }

  constructor(shortly) {
    this._parent = shortly
  }

  validate(toolbarItem) {
    var browserWindow = toolbarItem.browserWindow,
        activeTab = browserWindow.activeTab,
        ongoingTask = this._parent._taskQueue.findWithKey('browserWindow', {value: browserWindow});

    if (ongoingTask) {
      toolbarItem.disabled = true;
      ToolbarItemAnimator.startAnimationFor(toolbarItem)
    } else {
      ToolbarItemAnimator.stopAnimationFor(toolbarItem)
      toolbarItem.disabled = !activeTab.url || activeTab.url.match(/^safari-extension:/);
    }
  }
}

export default ToolbarItemValidator
