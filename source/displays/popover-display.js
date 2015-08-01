import I18n from '../components/i18n';

class PopoverDisplay {
  constructor() {
    this._toolbarItem = this._getToolbarItemOnActiveWindow();
    this._popover = this._getPopover();

    this._popover.width = 280;
    this._popover.contentWindow.updateLocale(I18n.t('notice.popoverTip'));

    this._popover.contentWindow.document.addEventListener('visibilitychange', () => {
      var _document = this._popover.contentWindow.document;
      if (!this._popover.contentWindow.document.hidden) {
        this._popover.height = this._popover.contentWindow.document.body.offsetHeight + 10;
      }
    }, false);
  }

  // Public instance methods
  displayShortlink(result) {
    this.displayMessage(result, 'shortlink')
  }

  displayError(errorMsg) {
    this.displayMessage(errorMsg, 'error')
  }

  displayMessage(message, type='text') {
    this._setupTemporaryPopover();
    this._popover.contentWindow.displayMessage(message, type);
    this._toolbarItem.disabled = false;
    this._toolbarItem.showPopover();
  }

  // Private methods
  _getPopover() {
    for (let i in safari.extension.popovers) {
      let popover = safari.extension.popovers[i];
      if (popover.identifier === 'popoverResult') return popover;
    }
  }

  _getToolbarItemOnActiveWindow() {
    for (let i in safari.extension.toolbarItems) {
      let toolbarItem = safari.extension.toolbarItems[i];
      if (toolbarItem.browserWindow === safari.application.activeBrowserWindow) return toolbarItem;
    }
  }

  _setupTemporaryPopover() {
    var toolbarMenu = this._toolbarItem.menu;

    var popoverSelfBomb = (event) => {
      /* Remove popover and hook back the menu
       * after popover being closed */
      if (event.srcElement === this._popover.contentWindow) {
        this._toolbarItem.popover = null;
        this._toolbarItem.menu = toolbarMenu;
        this._popover.contentWindow.removeEventListener('blur', popoverSelfBomb, false);
      }
    }

    this._toolbarItem.menu = null;
    this._toolbarItem.popover = this._popover;
    this._popover.contentWindow.addEventListener('blur', popoverSelfBomb, false);
  }
}

export default PopoverDisplay
