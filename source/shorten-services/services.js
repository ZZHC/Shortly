import GoogleShortener from './google-shortener'
import BitlyShortener from './bitly-shortener'
import TinyUrlShortener from './tinyurl-shortener'
import CustomEndpointShortener from './custom-shortener'

import FlickrShortener from './flickr-shortener'

var ShortenServices = {
  DefaultService: GoogleShortener,
  google: GoogleShortener,
  bitly: BitlyShortener,
  tinyurl: TinyUrlShortener,
  custom: CustomEndpointShortener,

  flickr: FlickrShortener,

  GOOGLE: 'google',
  BITLY: 'bitly',
  TINYURL: 'tinyurl',
  CUSTOM: 'custom'
};

export default ShortenServices
