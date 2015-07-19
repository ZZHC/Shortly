import apiKeys from '../api-keys'
import I18n from '../components/i18n'

const ACCESS_TOKEN = apiKeys.bitly;

export default class BitlyShortener {
  getShortlink(longUrl, options={useOAuth: false}) {
    var queryAPI = `https://api-ssl.bitly.com/v3/shorten?access_token=${ ACCESS_TOKEN }&longUrl=${ encodeURIComponent(longUrl) }`;

    return fetch(queryAPI)
      .then( response => response.json() )
      .then( resultJSON => {
        if (resultJSON.status_code === 200) return resultJSON.data.url;

        switch (resultJSON.status_txt) {
          case 'INVALID_LOGIN':
          case 'INVALID_APIKEY':
          case 'MISSING_ARG_LOGIN':
          case 'MISSING_ARG_APIKEY':
          case 'MISSING_ARG_ACCESS_TOKEN':
            return Promise.reject(I18n.t('error.bitly.badLogin') + `(${resultJSON.status_txt})`);

          case 'RATE_LIMIT_EXCEEDED':
            return Promise.reject(I18n.t('error.bitly.limitExceeded') + `(${resultJSON.status_txt})`);

          default:
            return Promise.reject(`[bit.ly] Error ${resultJSON.status_code}: ${resultJSON.status_txt}`);
        }

      })
  }
}
