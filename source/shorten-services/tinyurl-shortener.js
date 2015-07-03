const URL_PATTERN = /^http:\/\/\w*\.?tinyurl\.com\//

export default class TinyUrlShortener {
  getShortlink(longUrl) {
    var queryAPI = 'http://tinyurl.com/api-create.php?url=' + encodeURIComponent(longUrl);

    return fetch(queryAPI)
      .then( response => response.text() )
      .then( result => {
        if(result.match(URL_PATTERN)) {
          return result
        } else {
          return Promise.reject(`Error: TinyURL responding ${result}`)
        }
      })
  }
}
