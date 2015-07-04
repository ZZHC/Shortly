export default class CustomEndpointShortener {
  getShortlink(longUrl, options={}) {
    var queryAPI = options.customEndpoint || '';

    if (queryAPI === '') {
      return Promise.reject('Error: bad custom endpoint.')
    } else {
      queryAPI = queryAPI.replace(/=%@/, '=' + encodeURIComponent(longUrl));

      return fetch(queryAPI)
        .then( response => response.json() )
        .then( resultJSON => {
          var shortlinkFound = resultJSON.shortlink || resultJSON.shorturl || resultJSON.link || resultJSON.url || resultJSON.result || '';

          if (typeof shortlinkFound === 'string' && shortlinkFound != '') {
            return shortlinkFound;
          } else {
            return Promise.reject('Error: unable to parse result from custom endpoint.')
          }
        })
    }
  }
}
