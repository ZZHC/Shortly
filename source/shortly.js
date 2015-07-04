import ShortenSerivces from './shorten-services/services'
import Displays from './displays/displays'

class Shortly {
  constructor() {
    this._performCommand = this._performCommand.bind(this)
  }

  // Instance methods
  getShortlinkToCurrentPageAndDisplay() {
    var longUrl = safari.application.activeBrowserWindow.activeTab.url,
        DisplayClass = Displays[safari.extension.settings.displayMethod],
        display = new DisplayClass;

    this.getShortlinkToAddress(longUrl)
      .then( result => display.displayShortlink(result) )
      .catch( error => display.displayError(error) )
  }

  getShortlinkToAddress(longUrl, options={skipNative: false, withService: safari.extension.settings.shortenService}) {
    return Promise.resolve()
      .then( () => {
        if (options.skipNative) return;

        // Check inject script
        return;
      })
      .then( () => {
        if (options.skipNative) return;

        // Check known list and shorten with Bitly
        return;
      })
      .then( () => {
        // Shorten with preferred service
        var ShortenService = ShortenSerivces[options.withService] || ShortenSerivces.DefaultService,
            shortener = new ShortenService,
            shortenerOptions = {};

        switch (options.withService) {
          case ShortenSerivces.BITLY:
            shortenerOptions = {
              bitlyUsername: safari.extension.secureSettings.bitlyUsername,
              bitlyAPIKey: safari.extension.secureSettings.bitlyAPIKey
            };
            break;
          case ShortenSerivces.CUSTOM:
            shortenerOptions = {customEndpoint: safari.extension.settings.customEndpoint}
            break;
        }

        return shortener.getShortlink(longUrl, shortenerOptions);
      });
  }

  // Event listener hanlders
  _performCommand(event) {
    switch (event.command) {
      case 'shortenURL':
        this.getShortlinkToCurrentPageAndDisplay();
        break;
      default:
        console.warn('Not implemented');
    }
  }
}

export default Shortly
