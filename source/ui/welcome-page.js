import GoogleOAuth from '../components/google-oauth';
import BitlyOAuth from '../components/bitly-oauth';
import I18n from '../components/i18n'

const PAGE_PATH = safari.extension.baseURI + 'welcome.html';

class WelcomePage {
  static everShown() {
    return safari.extension.settings.welcomePageShown
  }

  static showIfFirstTime() {
    if (!this.everShown()) {
      var instance = new this;
      instance.show();
    }
  }

  constructor() {
    this._messageReceived = this._messageReceived.bind(this)
  }

  show() {
    var localePackage = this._getLocalePackage(),
        onNavigate;

    this._pageWindow = safari.application.openBrowserWindow();
    this._pageTab = this._pageWindow.activeTab;

    onNavigate = (event) => {
      event.target.page.dispatchMessage('localePackage', localePackage);
      event.target.removeEventListener(onNavigate);
    }

    this._pageTab.addEventListener('navigate', onNavigate, false);
    this._pageTab.addEventListener('message', this._messageReceived,false);
    this._pageTab.url = PAGE_PATH;

    safari.extension.settings.welcomePageShown = true;
  }

  _getLocalePackage() {
    return {
      langProp: I18n.t('welcome.langProp'),
      title: I18n.t('welcome.title'),
      lead: I18n.t('welcome.lead'),
      assurance: I18n.t('welcome.assurance'),
      connect: I18n.t('welcome.connect'),
      connected: I18n.t('welcome.connected'),
      continue: I18n.t('welcome.continue'),
      google: {
        title: I18n.t('welcome.google.title'),
        helpText: I18n.t('welcome.google.helpText')
      },
      bitly: {
        title: I18n.t('welcome.bitly.title'),
        helpText: I18n.t('welcome.bitly.helpText')
      }
    }
  }

  _messageReceived(event) {
    if (!event.name === 'runAction') return;

    switch (event.message) {
      case 'close':
        event.target.close();
        break;
      case 'googleAuth':
        this._initOAuthFor('google', {class: GoogleOAuth, settingsKey: 'useGoogleOAuth'});
        break;
      case 'bitlyAuth':
        this._initOAuthFor('bitly', {class: BitlyOAuth, settingsKey: 'useBitlyOAuth'});
        break;
    }
  }

  _initOAuthFor(service, options={class: undefined, settingsKey: ''}) {
    var oauth = new options.class;

    oauth.authorize().then( () => {
      this._pageTab.page.dispatchMessage('authSuccess', service);
      safari.extension.settings.setItem(options.settingsKey, true);
    }).catch( error => console.warn(error) );
  }

}

export default WelcomePage
