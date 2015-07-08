import ShortenSerivces from './shorten-services/services'
import Displays from './displays/displays'

class Shortly {
  constructor() {
    this._performCommand = this._performCommand.bind(this)
  }

  // Instance methods
  getShortlinkToCurrentPageAndDisplay() {
    var longUrl = safari.application.activeBrowserWindow.activeTab.url,
        pageTitle = safari.application.activeBrowserWindow.activeTab.title,
        skipNative = safari.extension.settings.ignoreNative,
        DisplayClass = Displays[safari.extension.settings.displayMethod],
        display = new DisplayClass;

    this.getShortlinkFromInjectedScript({skipNative})
      .catch( () => this.getShortlinkWithKnownShortener(longUrl, {skipNative}) )
      .catch( () => this.getShortlinkToAddress(longUrl) )
      .then(
        result => { display.displayShortlink({shortlink: result, title: pageTitle}) },
        error =>  { display.displayError(error) }
      )
  }

  getShortlinkFromInjectedScript(options={skipNative: false}) {
    if (options.skipNative) {
      return Promise.reject('Skip native.')
    }

    return new Promise( (resolve, reject) => {
      var messageListener = (msgEvent) => {
        if (msgEvent.name === 'shortlinkFromPage') {
          if (msgEvent.message) {
            resolve(msgEvent.message);
          } else {
            reject('Not found from injected script.')
          }
          // Work is done, unmount listener
          safari.application.removeEventListener('message', messageListener, false);
        }
      };

      safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('findShortlink');
      safari.application.addEventListener('message', messageListener, false);
    });
  }

  getShortlinkWithKnownShortener(longUrl, options={skipNative: false}) {
    if (options.skipNative) {
      return Promise.reject('Skip native.')
    }

    const FLICKR_PATTERN = /https?:\/\/w*\.?flickr\.com\/photos\/[^\/]+\/(\d+)\//;
    const GITHUB_PATTERN = /http(s)?:\/\/(gist\.)?github\.com/;

    var shortner;

    switch (false) {
      case !FLICKR_PATTERN.test(longUrl):
        shortner = new ShortenSerivces['flickr'];
        return shortner.getShortlink(longUrl);

      case !GITHUB_PATTERN.test(longUrl):
        shortner = new ShortenSerivces['github'];
        return shortner.getShortlink(longUrl);

      default:
        return Promise.reject('No applicable known native shorteners.')
    }
  }

  getShortlinkToAddress(longUrl, options={withService: safari.extension.settings.shortenService}) {
    return Promise.resolve()
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
