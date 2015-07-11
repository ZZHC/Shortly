const {CHECKED, UNCHECKED, MIXED} = SafariExtensionMenuItem

class MenuValidator {
  constructor(shortly) {
    this._parent = shortly
  }

  validate(menuItem) {
    var serviceMatch = menuItem.command.match(/^setService-(\w+)/),
        shortenServicePref = safari.extension.settings.shortenService,
        ignoreNativePref = safari.extension.settings.ignoreNative,
        customEndpointPref = safari.extension.settings.customEndpoint;

    if (serviceMatch) {
      menuItem.checkedState = (serviceMatch[1] === shortenServicePref) ? CHECKED : UNCHECKED;
    }

    switch (menuItem.command) {
      case 'setService-custom':
        menuItem.disabled = !(customEndpointPref);
        break;
      case 'toggleIgnoreNative':
        menuItem.checkedState = (ignoreNativePref) ? CHECKED : UNCHECKED;
        break;
      case 'shortenInputURL':
        break;
    }
  }
}

export default MenuValidator
