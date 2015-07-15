import GoogleOAuth from './google-oauth';
import AlertDisplay from '../displays/alert-display';

class SettingsResponder {
  constructor(shortly) {
    this._parent = shortly;
    this._display = new AlertDisplay;
  }

  respondToEvent(event) {
    switch (event.key) {
      case 'useGoogleOAuth':
        this._googleOAuthChanged(event);
        break;
      case 'clearGoogleAuth':
        this._clearGoogleAuth(event);
        break;
      case 'enableContextMenu':
        this._parent.toggleContextMenu(event.newValue);
        break;
      case 'enableKbHotkey':
        this._parent._hotkeyManager.toggle(event.newValue);
        break;
      case 'kbHotkeyChar':
        this._formatHotkeyChar(event.newValue)
        break;
      default:
        break;
    }

    if (event.key.match(/^kbHotkey/)) {
      this._parent._hotkeyManager.broadcastSettings();
    }
  }

  _googleOAuthChanged(event) {
    var storedCredentials = GoogleOAuth.getStoredCredentials();

    if (storedCredentials) return true;

    if (event.newValue) {
      var oauth = new GoogleOAuth;

      oauth.authorize().catch( () => {

        this._display.displayError(error);
        safari.extension.settings.useGoogleOAuth = false;
      });
    }
  }

  _clearGoogleAuth(event) {
    GoogleOAuth.clearStoredCredentials();
    safari.extension.settings.useGoogleOAuth = false;

    if (event.newValue) {
      safari.extension.settings.clearGoogleAuth = false;
      this._display.displayMessage('Your Google login info has been deleted from Shortly.');
    }
  }

  _formatHotkeyChar(hotkeyChar) {
    if (hotkeyChar) {
      safari.settings.kbHotkeyChar = hotkeyChar.charAt(0).toUpperCase()
    }
  }
}

export default SettingsResponder
