export default class CustomEndpointShortener {
  getShortlink(longUrl) {
    return Promise.resolve('custom endpoint');
  }
}
