import findShortlink from '../injected/shortlink.coffee'

let parser, canParse = false;

try {
  parser = new DOMParser;
  canParse = typeof parser.parseFromString === 'function';
} catch(e) {}

export default class FetchPageShortener {
  getShortlink(longUrl) {
    if (!canParse) {
      return Promise.reject('Unable to parse HTML natively.')
    }

    return fetch(longUrl)
      .then( response => response.text() )
      .then( rawHTML => parser.parseFromString(rawHTML, 'text/html') )
      .then( htmlNode => {
        let result = findShortlink(htmlNode);
        return result ? result : Promise.reject('Unable to find native shortlink inside HTML.');
      })
  }
}
