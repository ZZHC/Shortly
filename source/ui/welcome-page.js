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

  show() {
    var welcomeWindow = safari.application.openBrowserWindow(),
        localePackage = this._getLocalePackage(),
        pageTab = welcomeWindow.activeTab,
        onNavigate;

    onNavigate = (event) => {
      event.target.page.dispatchMessage('localePackage', localePackage);
      event.target.removeEventListener(onNavigate);
    }
    pageTab.addEventListener('navigate', onNavigate, false);
    pageTab.url = PAGE_PATH;

    //safari.extension.settings.welcomePageShown = true;
  }

  _getLocalePackage() {
    return {
      langProp: I18n.t('welcome.langProp'),
      title: I18n.t('welcome.title'),
      lead: I18n.t('welcome.lead'),
      assurance: I18n.t('welcome.assurance'),
      connect: I18n.t('welcome.connect'),
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
}

export default WelcomePage
