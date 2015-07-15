# Consider unclickable window and disable hotkey.
return false if window.innerHeight < 100 or window.innerWidth < 100

hotkeySettings = {}

respondToMessage = (event) ->
  if event.name is 'hotkeySettings'
    hotkeySettings = event.message

hotkeyListener = (event) ->
  inputChar = String.fromCharCode(event.which).toUpperCase()
  hotkeyMatch = inputChar is hotkeySettings.char and
                event.metaKey  is hotkeySettings.metaKey and
                event.altKey   is hotkeySettings.altKey and
                event.ctrlKey  is hotkeySettings.ctrlKey and
                event.shiftKey is hotkeySettings.shiftKey

  safari.self.tab.dispatchMessage('hotkeyCaptured') if hotkeyMatch

safari.self.tab.dispatchMessage('readHotkeySettings')

document.addEventListener('keydown', hotkeyListener, false)
safari.self.addEventListener('message', respondToMessage, false)
