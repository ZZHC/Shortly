/*
 * ContextMenuItem:
 *   - identifier: contextMenuItemShortenLink
 *   - command: shortenTarget-link
 *
 * Menu Initializer:
 * { type: 'link', url: 'http://example.com/' }
 * { type: 'image', url: 'http://example.com/images/foo.png' }
 *
 */

import I18n from '../components/i18n'

class ContextMenuValidator {
  constructor(shortly) {
    this._parent = shortly
  }

  validateWithEvent(validateEvent) {
    var menuItem = validateEvent.target,
        linkCandidates = validateEvent.userInfo,
        command = '',
        key = '',
        localeIdentifier = menuItem.identifier.match(/^contextMenuItem(\w+)/)[1];

    // Disable unqualified context menu items
    menuItem.disabled = true;

    for (key in linkCandidates) {
      command = `shortenTarget-${key}`;

      if (menuItem.command === command) {
        menuItem.disabled = false;
        break;
      }
    }

    // Set locale
    menuItem.title = I18n.t(`contextMenuItem.${localeIdentifier}`);
  }
}

export default ContextMenuValidator
