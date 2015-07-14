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

class ContextMenuValidator {
  constructor(shortly) {
    this._parent = shortly
  }

  validateWithEvent(validateEvent) {
    var menuItem = validateEvent.target,
        linkCandidates = validateEvent.userInfo,
        command = '',
        key = '';

    menuItem.disabled = true;

    for (key in linkCandidates) {
      command = `shortenTarget-${key}`;

      if (menuItem.command === command) {
        menuItem.disabled = false;
        return
      }
    }
  }
}

export default ContextMenuValidator
