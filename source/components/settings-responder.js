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
        this._clearGoogleAuth();
        break;
      case 'enableContextMenu':
        this._parent.toggleContextMenu(event.newValue);
      default:
        break;
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

  _clearGoogleAuth() {
    GoogleOAuth.clearStoredCredentials();
    safari.extension.settings.useGoogleOAuth = false;
    safari.extension.settings.clearGoogleAuth = false;

    this._display.displayMessage('Your Google login info has been deleted from Shortly.');
  }
}

export default SettingsResponder
