import ShortenSerivces from './shorten-services/services'

class Shortly {
  constructor() {
    this._performCommand = this._performCommand.bind(this)
  }

  // Instance methods
  getShortlinkToCurrentPage() {
    var longUrl = safari.application.activeBrowserWindow.activeTab.url;
    return this.getShortlinkToAddress(longUrl);
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
            shortener = new ShortenService;

        return shortener.getShortlink(longUrl);
      });
  }

  // Event listener hanlders
  _performCommand(event) {
    switch (event.command) {
      case 'shortenURL':
        this.getShortlinkToCurrentPage()
          .then(  (result) => console.log(result) )
          .catch( (err) => console.warn(err) );
        break;
      default:
        console.warn('Not implemented');
    }
  }
}

export default Shortly
