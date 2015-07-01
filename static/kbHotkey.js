var kbHotkeySettings = null;

function responseToRequest(event) {
  if (window.innerHeight < 3 || window.innerWidth < 3 ) {
    return false;
  }

  if (event.name === 'hotkeySettings') {
    kbHotkeySettings = event.message;
    console.log('Shortly hotkey settings fetched', (new Date()).toLocaleString());

    if (typeof kbHotkeySettings === 'object') {
      document.addEventListener('keydown', hotkeyMonitor, false);
    }
  }
  
  if (event.name === 'updateHotkeySettings') {
    kbHotkeySettings[event.message.key] = event.message.value;
    console.log('Shortly hotkey settings updated', event.message.key, event.message.value, (new Date()).toLocaleString());
  }
}

function hotkeyMonitor(event) {
  var inputChar = String.fromCharCode(event.which).toUpperCase();
  kbHotkeySettings.char = kbHotkeySettings.char.toUpperCase();

  if (inputChar === kbHotkeySettings.char &&
      event.metaKey === kbHotkeySettings.metaKey &&
      event.altKey === kbHotkeySettings.altKey &&
      event.ctrlKey === kbHotkeySettings.ctrlKey &&
      event.shiftKey === kbHotkeySettings.shiftKey) {
    safari.self.tab.dispatchMessage('hotkeyCaptured');
  }
}

safari.self.tab.dispatchMessage('readHotkeySettings');
safari.self.addEventListener('message', responseToRequest, false);