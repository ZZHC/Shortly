import ShortenSerivces from './shorten-services/services'
import Displays from './displays/displays'
import ShortenTask from './components/shorten-task'
import SimpleSet from './components/simple-set'
import ToolbarItemValidator from './ui/toolbar-item-validator'
import MenuValidator from './ui/menu-validator'
import SettingsResponder from './components/settings-responder'
import ContextMenuValidator from './ui/context-menu-validator'
import HotkeyManager from './ui/hotkey-manager'
import BitlyNativeMatcher from './components/bitly-native-matcher'
import I18n from './components/i18n'

class Shortly {
  constructor() {
    this._taskQueue = new SimpleSet;
    this._validators = {
      toolbarItem: new ToolbarItemValidator(this),
      menu: new MenuValidator(this),
      contextMenu: new ContextMenuValidator(this)
    };
    this._settingsResponder = new SettingsResponder(this);
    this._hotkeyManager = new HotkeyManager(this)
    this._bitlyNativeMatcher = new BitlyNativeMatcher();

    this._taskQueue.on('change', () => ToolbarItemValidator.validateAll());
    this.toggleContextMenu(safari.extension.settings.enableContextMenu);
    this._hotkeyManager.toggle(safari.extension.settings.enableKbHotkey);

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

  getShortlinkToURLAndDisplay(longUrl, {title=longUrl, fetchPage=false}) {
    var skipNative = safari.extension.settings.ignoreNative,
        DisplayClass = Displays[safari.extension.settings.displayMethod],
        display = new DisplayClass,
        taskPromise, shortenTask;

    taskPromise = Promise.resolve()
      .then( () => {
        if (fetchPage) {
          const shortener = new ShortenSerivces['fetchPage'];
          return shortener.getShortlink(longUrl);
        } else {
          return this.getShortlinkFromInjectedScript({skipNative})
        }
      })
      .catch( () => this.getShortlinkWithKnownShortener(longUrl, {skipNative}) )
      .catch( () => this.getShortlinkToAddress(longUrl) )
      .then(
        result => {
          display.displayShortlink({shortlink: result, title: title});
        },
        error => {
          if (!navigator.onLine) {
            display.displayError(I18n.t('error.offline'));
          } else {
            display.displayError(error);
          }
        }
      )
      .then( () => this._taskQueue.remove(shortenTask) )

    shortenTask = new ShortenTask({
      promise: taskPromise,
      browserWindow: safari.application.activeBrowserWindow
    });

    this._taskQueue.push(shortenTask);
  }

  getShortlinkFromInjectedScript(options={skipNative: false}) {
    const TARGET_PAGE = safari.application.activeBrowserWindow.activeTab.page,
          shortener = new ShortenSerivces['injectedPage'];

    if (options.skipNative) {
      return Promise.reject('Skip native.');
    }
    return shortener.getShortlink({page: TARGET_PAGE});
  }

  getShortlinkWithKnownShortener(longUrl, options={skipNative: false}) {
    if (options.skipNative) {
      return Promise.reject('Skip native.')
    }

    const FLICKR_PATTERN = /https?:\/\/w*\.?flickr\.com\/photos\/[^\/]+\/(\d+)\//;
    const GITHUB_PATTERN = /http(s)?:\/\/(gist\.)?github\.com/;

    var isBitlyNative = this._bitlyNativeMatcher.matchUrl(longUrl),
        shortener, shortenerOptions;

    switch (false) {
      case !FLICKR_PATTERN.test(longUrl):
        shortener = new ShortenSerivces['flickr'];
        break;

      case !GITHUB_PATTERN.test(longUrl):
        shortener = new ShortenSerivces['github'];
        break;

      case !isBitlyNative:
        shortener = new ShortenSerivces['bitly'];
        shortenerOptions = {useOAuth: safari.extension.settings.useBitlyOAuth};
        break;

      default:
        return Promise.reject('No applicable known native shorteners.')
    }

    return shortener.getShortlink(longUrl, shortenerOptions);
  }

  getShortlinkToAddress(longUrl, options={withService: safari.extension.settings.shortenService}) {
    return Promise.resolve()
      .then( () => {
        // Shorten with preferred service
        var ShortenService = ShortenSerivces[options.withService] || ShortenSerivces.DefaultService,
            shortener = new ShortenService,
            shortenerOptions = {};

        switch (options.withService) {
          case ShortenSerivces.GOOGLE:
            shortenerOptions = {useOAuth: safari.extension.settings.useGoogleOAuth};
            break;
          case ShortenSerivces.BITLY:
            shortenerOptions = {useOAuth: safari.extension.settings.useBitlyOAuth};
            break;
          case ShortenSerivces.CUSTOM:
            shortenerOptions = {customEndpoint: safari.extension.settings.customEndpoint}
            break;
        }

        return shortener.getShortlink(longUrl, shortenerOptions);
      });
  }

  toggleContextMenu(enabled) {
    var pathToInject = safari.extension.baseURI + 'js/injected/context-menu.js';

    if (enabled) {
      safari.extension.addContentScriptFromURL(pathToInject);
    } else {
      safari.extension.removeContentScript(pathToInject);
    }
  }

  // Event listener hanlders
  _performCommand(event) {
    var menuMatch = event.command.match(/^setService-(\w+)/),
        contextMenuMatch = event.command.match(/^shortenTarget-(\w+)/),
        inputURL = '';

    if (menuMatch) {
      safari.extension.settings.shortenService = menuMatch[1];
      return
    }

    if (contextMenuMatch) {
      let key = contextMenuMatch[1];
      this.getShortlinkToURLAndDisplay(event.userInfo[key], {fetchPage: true});
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
        inputURL = window.prompt(I18n.t('notice.shortenInputPrompt'));
        if (!inputURL) return false;

        this.getShortlinkToURLAndDisplay(inputURL, {fetchPage: true});
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
      case !(event.target.identifier.match(/^contextMenuItem/)):
        this._validators['contextMenu'].validateWithEvent(event);
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
