import I18n from '../components/i18n';

const ENDPOINT_PATTERN = /=\%\@/;

export default class CustomEndpointShortener {
  getShortlink(longUrl, options={}) {
    var queryAPI = options.customEndpoint || '';

    if (!ENDPOINT_PATTERN.test(queryAPI)) {
      return Promise.reject(I18n.t('error.badEndpoint'))
    } else {
      queryAPI = queryAPI.replace(ENDPOINT_PATTERN, '=' + encodeURIComponent(longUrl));

      return fetch(queryAPI)
        .then( this._checkFetchStatus )
        .then( response => response.json() )
        .then( resultJSON => {
          var shortlinkFound = resultJSON.shortlink || resultJSON.shorturl || resultJSON.link || resultJSON.url || resultJSON.result || '';

          if (typeof shortlinkFound === 'string' && shortlinkFound != '') {
            return shortlinkFound;
          } else {
            return Promise.reject(I18n.t('error.invalidResponse'))
          }
        })
    }
  }

  _checkFetchStatus(response) {
    if (response.ok) {
      return response
    } else {
      return Promise.reject(`Error ${response.status}: ${response.statusText}`)
    }
  }
}
