import ToolbarItemAnimator from './toolbar-item-animator'
import I18n from '../components/i18n'

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

    // Set disabled and Animation state
    if (ongoingTask) {
      toolbarItem.disabled = true;
      ToolbarItemAnimator.startAnimationFor(toolbarItem)
    } else {
      ToolbarItemAnimator.stopAnimationFor(toolbarItem)
      toolbarItem.disabled = !activeTab.url || activeTab.url.match(/^safari-extension:/);
    }

    // Set locale
    toolbarItem.label = I18n.t('toolbarBtn.label');
    toolbarItem.toolTip = I18n.t('toolbarBtn.tooltip');
    toolbarItem.paletteLabel = I18n.t('toolbarBtn.paletteLabel');
  }
}

export default ToolbarItemValidator
