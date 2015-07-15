const SCRIPT_PATH = safari.extension.baseURI + 'js/injected/hotkey.js';

class HotkeyManager {
  constructor(shortly) {
    this._parent = shortly
    this.enabled = false
  }

  run() {
    safari.extension.addContentScriptFromURL(SCRIPT_PATH);
    this.enabled = true;
  }

  stop() {
    safari.extension.removeContentScript(SCRIPT_PATH);
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
}

export default HotkeyManager
