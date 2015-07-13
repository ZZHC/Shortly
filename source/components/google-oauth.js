import {googleOAuth} from '../api-keys';
import AlertDisplay from '../displays/alert-display';

const CLIENT_ID = googleOAuth.clientId;
const CLIENT_SECRET = googleOAuth.secret;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob:auto';

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECT_URI + '&scope=https://www.googleapis.com/auth/urlshortener';
const TOKEN_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/token';

class GoogleOAuth {
  static getStoredCredentials() {
    return safari.extension.secureSettings.googleOAuthCredentials;
  }

  static saveCredentials(credentialObj) {
    safari.extension.secureSettings.googleOAuthCredentials = JSON.stringify(credentialObj);
  }

  authenticate() {
    this.requestAuthCode()
      .then( authCode => this.exchangeAuthCodeForToken(authCode) )
      .then( credentials => GoogleOAuth.saveCredentials(credentials) )
      .catch( error => {
        var display = new AlertDisplay;
        display.displayError(error);
        console.warn(error);
      })
  }

  requestAuthCode() {
    var authWindow = safari.application.openBrowserWindow();

    return new Promise( (resolve, reject) => {
      authWindow.activeTab.url = AUTH_ENDPOINT;

      authWindow.addEventListener('navigate', event => {
        setTimeout( () => {
          var titleMatch = event.target.title.match(/code=(.+)$/);

          if (titleMatch) {
            resolve(titleMatch[1]);
            event.target.browserWindow.close();
          }
        }, 100);
      });
      authWindow.addEventListener('close', event => {
        reject('OAuth cancelled because window is closed.')
      });
    });
  }

  exchangeAuthCodeForToken(authCode) {
    var data = new FormData();

    if (!authCode) return Promise.reject('You must provide authCode to exchange for tokens.');

    return fetch(TOKEN_ENDPOINT, {
      method: 'post',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: 'code=' + authCode + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&redirect_uri=' + REDIRECT_URI + '&grant_type=authorization_code'
    }).then( response => response.json() );
  }
}

export default GoogleOAuth
