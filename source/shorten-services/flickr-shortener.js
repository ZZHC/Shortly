const URL_PATTERN = /https?:\/\/w*\.?flickr\.com\/photos\/[^\/]+\/(\d+)\//;
const KEY = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

export default class FlickrShortener {
  getShortlink(longUrl) {
    var match = longUrl.match(URL_PATTERN),
        photoId;

    if (match && match.length > 1) {
      let shortPhotoId = this.encode(match[1]);
      return Promise.resolve(`http://flic.kr/p/${shortPhotoId}`);
    } else {
      return Promise.reject('URL pattern does not match Flick photo page.');
    }
  }

  encode(photoId) {
    var baseCount = KEY.length, encoded = '';

    while (photoId > 0) {
      let mod = photoId % baseCount;
      encoded = KEY[mod] + encoded;
      photoId = parseInt(photoId / baseCount);
    }

    return encoded;
  }
}
