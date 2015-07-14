import ShortenSerivces from './shorten-services/services'
import Displays from './displays/displays'
import ShortenTask from './components/shorten-task'
import SimpleSet from './components/simple-set'
import ToolbarItemValidator from './ui/toolbar-item-validator'
import MenuValidator from './ui/menu-validator'
import SettingsResponder from './components/settings-responder'

class Shortly {
  constructor() {
    this._taskQueue = new SimpleSet;
    this._validators = {
      toolbarItem: new ToolbarItemValidator(this),
      menu: new MenuValidator(this)
    };
    this._settingsResponder = new SettingsResponder(this);

    this._taskQueue.on('change', () => ToolbarItemValidator.validateAll());
    this.toggleContextMenu(safari.extension.settings.enableContextMenu);

    this._performCommand = this._performCommand.bind(this);
    this._validateCommand = this._validateCommand.bind(this);
    this._settingsChanged = this._settingsChanged.bind(this);
  }

  // Instance methods
  getShortlinkToCurrentPageAndDisplay() {
    var longUrl = safari.application.activeBrowserWindow.activeTab.url,
        pageTitle = safari.application.activeBrowserWindow.activeTab.title;

    this.getShortlinkToURLAndDisplay(longUrl, {title: pageTitle})
  }

  getShortlinkToURLAndDisplay(longUrl, options={title: longUrl}) {
    var skipNative = safari.extension.settings.ignoreNative,
        DisplayClass = Displays[safari.extension.settings.displayMethod],
        display = new DisplayClass,
        taskPromise, shortenTask;

    taskPromise = this.getShortlinkFromInjectedScript({skipNative})
      .catch( () => this.getShortlinkWithKnownShortener(longUrl, {skipNative}) )
      .catch( () => this.getShortlinkToAddress(longUrl) )
      .then(
        result => { display.displayShortlink({shortlink: result, title: options.title}) },
        error =>  { display.displayError(error) }
      )
      .then( () => this._taskQueue.remove(shortenTask) )

    shortenTask = new ShortenTask({
      promise: taskPromise,
      browserWindow: safari.application.activeBrowserWindow
    });

    this._taskQueue.push(shortenTask);
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

  toggleContextMenu(enabled) {
    var pathToInject = safari.extension.baseURI + 'js/contextMenuInjected.js';

    if (enabled) {
      safari.extension.addContentScriptFromURL(pathToInject);
    } else {
      safari.extension.removeContentScript(pathToInject);
    }
  }

  // Event listener hanlders
  _performCommand(event) {
    var cmdMatch = event.command.match(/^setService-(\w+)/),
        inputURL = '';

    if (cmdMatch) {
      safari.extension.settings.shortenService = cmdMatch[1];
      return
    }

    switch (event.command) {
      case 'shortenURL':
        this.getShortlinkToCurrentPageAndDisplay();
        break;
      case 'toggleIgnoreNative':
        safari.extension.settings.ignoreNative = !safari.extension.settings.ignoreNative;
        break;
      case 'shortenInputURL':
        inputURL = window.prompt('Please enter the URL you want to shorten below:');
        if (inputURL.length < 1) return false;

        this.getShortlinkToURLAndDisplay(inputURL);
        break;
      default:
        console.warn('Not implemented:', event);
    }
  }

  _validateCommand(event) {
    switch (false) {
      case !(event.command === 'shortenURL'):
        this._validators['toolbarItem'].validate(event.target);
        break;
      case !(event.target.identifier.match(/^menuItem/)):
        this._validators['menu'].validate(event.target);
        break;
      default:
        console.warn('Not implemented:', event);
    }
  }

  _settingsChanged(event) {
    this._settingsResponder.respondToEvent(event);
  }
}

export default Shortly
