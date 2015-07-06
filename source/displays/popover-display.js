class PopoverDisplay {
  constructor() {
    this._toolbarItem = this.getToolbarItemOnActiveWindow();
    this._popover = this.getPopover();
  }

  displayShortlink(shortlink) {
    this.setupTemporaryPopover();
    this._toolbarItem.showPopover();
  }

  displayError(errorMsg) {
    console.log(errorMsg);
  }

  getPopover() {
    for (let i in safari.extension.popovers) {
      let popover = safari.extension.popovers[i];
      if (popover.identifier === 'popoverResult') return popover;
    }
  }

  getToolbarItemOnActiveWindow() {
    for (let i in safari.extension.toolbarItems) {
      let toolbarItem = safari.extension.toolbarItems[i];
      if (toolbarItem.browserWindow === safari.application.activeBrowserWindow) return toolbarItem;
    }
  }

  setupTemporaryPopover() {
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
