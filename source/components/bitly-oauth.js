/*
 * Bitly OAuth Credentials
 * {
 *   access_token: 'TOKEN',
 *   login: 'USERNAME'
 * }
 */

import {bitlyOAuth} from '../api-keys';

const CLIENT_ID = bitlyOAuth.clientId;
const CLIENT_SECRET = bitlyOAuth.secret;
const REDIRECT_URI = safari.extension.baseURI.replace(/\/\w+\/$/, '/callback/');

const AUTH_ENDPOINT = 'https://bitly.com/oauth/authorize?client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECT_URI;
const TOKEN_ENDPOINT = 'https://api-ssl.bitly.com/oauth/access_token';

class BitlyOAuth {
  static getStoredCredentials() {
    var credentials = safari.extension.secureSettings.bitlyOAuthCredentials;

    if (credentials) return JSON.parse(credentials);
  }

  static saveCredentials(credentialObj, options={last_update: undefined}) {
    credentialObj.last_update = options.last_update || Date.now();
    safari.extension.secureSettings.bitlyOAuthCredentials = JSON.stringify(credentialObj);
    return credentialObj;
  }

  static clearStoredCredentials() {
    safari.extension.secureSettings.removeItem('bitlyOAuthCredentials');
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
        BitlyOAuth.saveCredentials(credentials, {last_update: timestamp});

        credentials.last_update = timestamp;
        return credentials;
      });
  }

  static getAuthorizationHeader() {
    var credentials = BitlyOAuth.getStoredCredentials();

    if (!credentials) {
      return Promise.reject('Google OAuth credentials missing. Please try to authorize Shortly again.');
    }

    return Promise.resolve()
      .then( () => {
        var accessTokenExpired = (Date.now() - credentials.last_update) >= (credentials.expires_in * 1000);

        if (accessTokenExpired) {
          return BitlyOAuth.refreshAccessToken(credentials.refresh_token);
        } else {
          return credentials;
        }
      })
      .then( credentials => {
        return `${credentials.token_type} ${credentials.access_token}`;
      });
  }

  authorize() {
    return this.requestAuthCode()
      .then( authCode => this.exchangeAuthCodeForToken(authCode) )
      .then( credentials => BitlyOAuth.saveCredentials(credentials, {last_update: Date.now()}) );
  }

  requestAuthCode() {
    var authWindow = safari.application.openBrowserWindow();

    return new Promise( (resolve, reject) => {
      authWindow.activeTab.url = AUTH_ENDPOINT;

      authWindow.addEventListener('navigate', event => {
        setTimeout( () => {
          var urlMatch = event.target.url.match(REDIRECT_URI),
              codeMatch = event.target.url.match(/\?code=([^&]+)/);

          if (urlMatch && codeMatch) {
            resolve(codeMatch[1]);
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: 'code=' + authCode + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&redirect_uri=' + REDIRECT_URI + '&grant_type=authorization_code'
    }).then( response => response.json() );
  }
}

export default BitlyOAuth
