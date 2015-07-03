import apiKeys from '../api-keys'

const API_ENDPOINT = 'https://www.googleapis.com/urlshortener/v1/url'
const API_KEY = apiKeys.google

export default class GoogleShortener {
  getShortlink(longUrl) {
    return this._shortenWithApiKey(longUrl);
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
    })
      .then( response => response.json() )
      .then( resultJSON => {
        if (resultJSON.id) {
          return resultJSON.id
        } else if (resultJSON.error) {
          return Promise.reject(`Error ${resultJSON.error.code}: ${resultJSON.error.message}`)
        } else {
          return Promise.reject('Unknown error: goo.gl')
        }
      })
  }
}
