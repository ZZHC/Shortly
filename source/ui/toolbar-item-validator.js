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
        ongoingTask = this._parent._taskQueue.findWithKey('browserWindow', {value: browserWindow});

    if (ongoingTask) {
      toolbarItem.disabled = true;
    } else {
      toolbarItem.disabled = false;
    }
  }
}

export default ToolbarItemValidator
