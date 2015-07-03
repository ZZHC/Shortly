import apiKeys from '../api-keys'

const DEFAULT_LOGIN = 'zzhc';
const DEFAULT_API_KEY = apiKeys.bitly;

export default class BitlyShortener {
  getShortlink(longUrl) {
    var queryAPI,
        userLogin = safari.extension.secureSettings.bitlyUsername || '',
        userApiKey = safari.extension.secureSettings.bitlyAPIKey || '';

    if ((userLogin === '') && (userApiKey === '')) {
      userLogin = DEFAULT_LOGIN;
      userApiKey = DEFAULT_API_KEY;
    }
    queryAPI = `http://api.bitly.com/v3/shorten?login=${ userLogin }&apiKey=${ userApiKey }&longUrl=${ encodeURIComponent(longUrl) }`

    return fetch(queryAPI)
      .then( response => response.json() )
      .then( resultJSON => {
        if (resultJSON.status_code === 200) {
          return resultJSON.data.url;
        } else {
          return Promise.reject(`Error ${resultJSON.status_code}: ${resultJSON.status_txt}`)
        }
      })
  }
}
