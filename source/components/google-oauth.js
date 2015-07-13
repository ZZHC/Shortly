import {googleOAuth} from '../api-keys';
import AlertDisplay from '../displays/alert-display';

const CLIENT_ID = googleOAuth.clientId;
const CLIENT_SECRET = googleOAuth.secret;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob:auto';

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECT_URI + '&scope=https://www.googleapis.com/auth/urlshortener';
const TOKEN_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/token';

class GoogleOAuth {
  static getStoredCredentials() {
    return JSON.parse(safari.extension.secureSettings.googleOAuthCredentials);
  }

  static saveCredentials(credentialObj, options={last_update: undefined}) {
    credentialObj.last_update = options.last_update || Date.now();
    safari.extension.secureSettings.googleOAuthCredentials = JSON.stringify(credentialObj);
  }

  static refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      return Promise.reject('You must provide refreshToken to exchange for new access token.');
    }

    return fetch(TOKEN_ENDPOINT, {
      method: 'post',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: 'refresh_token=' + refreshToken + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&grant_type=refresh_token'
    }).then( response => response.json() )
      .then( credentials => {
        var timestamp = Date.now();

        credentials.refresh_token = refreshToken;
        GoogleOAuth.saveCredentials(credentials, {last_update: timestamp});

        credentials.last_update = timestamp;
        return credentials;
      });
  }

  static getAuthenticateHeader() {
    var credentials = GoogleOAuth.getStoredCredentials();

    if (!credentials) {
      return Promise.reject('Google OAuth credentials missing. Please try to authorize Shortly again.');
    }

    return Promise.resolve()
      .then( () => {
        var accessTokenExpired = (Date.now() - credentials.last_update) >= (credentials.expires_in * 1000);

        if (accessTokenExpired) {
          return GoogleOAuth.refreshAccessToken(credentials.refresh_token);
        } else {
          return credentials;
        }
      })
      .then( credentials => {
        return `${credentials.token_type} ${credentials.access_token}`;
      });
  }

  authenticate() {
    this.requestAuthCode()
      .then( authCode => this.exchangeAuthCodeForToken(authCode) )
      .then( credentials => GoogleOAuth.saveCredentials(credentials, {last_update: Date.now()}) )
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
    if (!authCode) {
      return Promise.reject('You must provide authCode to exchange for tokens.');
    }

    return fetch(TOKEN_ENDPOINT, {
      method: 'post',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: 'code=' + authCode + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&redirect_uri=' + REDIRECT_URI + '&grant_type=authorization_code'
    }).then( response => response.json() );
  }
}

export default GoogleOAuth
