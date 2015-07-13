import apiKeys from '../api-keys'
import GoogleOAuth from '../components/google-oauth'

const API_ENDPOINT = 'https://www.googleapis.com/urlshortener/v1/url'
const API_KEY = apiKeys.google

export default class GoogleShortener {
  getShortlink(longUrl) {
    if (safari.extension.settings.useGoogleOAuth) {
      return this._shortenWithOAuthToken(longUrl);
    } else {
      return this._shortenWithApiKey(longUrl);
    }
  }

  _shortenWithApiKey(longUrl) {
    var queryAPI = API_ENDPOINT + `?key=${ API_KEY }`;

    return fetch(queryAPI, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({longUrl})
    }).then(this._processResponse);
  }

  _shortenWithOAuthToken(longUrl) {
    return GoogleOAuth.getAuthenticateHeader().then( authString => {
      return fetch(API_ENDPOINT, {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authString
        },
        body: JSON.stringify({longUrl})
      }).then(this._processResponse);
    })
  }

  _processResponse(response) {
    return response.json()
      .then( resultJson => {
        if (resultJson.id) {
          return resultJson.id
        } else if (resultJson.error) {
          return Promise.reject(`Error ${resultJson.error.code}: ${resultJson.error.message}`)
        } else {
          return Promise.reject('Unknown error: goo.gl')
        }
      })
  }
}
