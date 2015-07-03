import GoogleShortener from './google-shortener'
import BitlyShortener from './bitly-shortener'
import TinyUrlShortener from './tinyurl-shortener'
import CustomEndpointShortener from './custom-shortener'

var ShortenServices = {
  google: GoogleShortener,
  bitly: BitlyShortener,
  tinyurl: TinyUrlShortener,
  custom: CustomEndpointShortener,
  DefaultService: GoogleShortener
};

export default ShortenServices
