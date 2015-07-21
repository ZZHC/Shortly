/*
 * Bitly OAuth Credentials
 * {
 *   access_token: 'TOKEN',
 *   login: 'USERNAME'
 * }
 */

import OAuth from './oauth'
import {bitlyOAuth} from '../api-keys';

const CLIENT_ID = bitlyOAuth.clientId;
const CLIENT_SECRET = bitlyOAuth.secret;
const REDIRECT_URI = safari.extension.baseURI.replace(/\/\w+\/$/, '/callback/');

const AUTH_ENDPOINT = 'https://bitly.com/oauth/authorize?client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECT_URI;
const TOKEN_ENDPOINT = 'https://api-ssl.bitly.com/oauth/access_token';

class BitlyOAuth extends OAuth {
  static init() {
    this.storageKey = 'bitlyOAuthCredentials';
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
BitlyOAuth.init();

export default BitlyOAuth
