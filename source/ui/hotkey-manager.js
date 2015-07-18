import AlertDisplay from '../displays/alert-display'
import I18n from '../components/i18n'

const SCRIPT_PATH = safari.extension.baseURI + 'js/injected/hotkey.js';

class HotkeyManager {
  constructor(shortly) {
    this._parent = shortly
    this.enabled = false
    this._messageListener = this._messageListener.bind(this);
  }

  run() {
    var display = new AlertDisplay;

    safari.extension.addContentScriptFromURL(SCRIPT_PATH);
    safari.application.addEventListener('message', this._messageListener, false);
    this.enabled = true;

    display.displayMessage(I18n.t('notice.hotkey'));
  }

  stop() {
    safari.extension.removeContentScript(SCRIPT_PATH);
    safari.application.removeEventListener('message', this._messageListener);
    this.enabled = false;
  }

  toggle(enabled) {
    enabled ? this.run() : this.stop();
  }

  broadcastSettings() {
    var hotkeySettings = this._buildSettings(),
        _browserWindows = safari.application.browserWindows,
        i = 0, j = 0;

    for (i in _browserWindows) for (j in _browserWindows[i].tabs) {
      _browserWindows[i].tabs[j].page.dispatchMessage('hotkeySettings', hotkeySettings);
    }
  }

  _buildSettings() {
    return {
      char:     safari.extension.settings.kbHotkeyChar,
      metaKey:  safari.extension.settings.kbHotkeyMetaKey,
      altKey:   safari.extension.settings.kbHotkeyAltKey,
      ctrlKey:  safari.extension.settings.kbHotkeyCtrlKey,
      shiftKey: safari.extension.settings.kbHotkeyShiftKey
    }
  }

  _messageListener(event) {
    switch (event.name) {
      case 'readHotkeySettings':
        this.broadcastSettings();
        break;
      case 'hotkeyCaptured':
        this._parent.getShortlinkToCurrentPageAndDisplay();
        break;
    }
  }
}

export default HotkeyManager
