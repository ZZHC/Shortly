function contextMenuHandler(event) {
  var nodeName = event.target.nodeName,
      menuToResponse = new Array();

  /* Find if children of hyperlink */
  (function findHyperlinkParent() {
    var currentElem = event.target.parentNode;
    
    if (event.target.nodeName === 'A') return;
    
    while (currentElem && currentElem.nodeType !== 9) {
      if (currentElem.nodeName === 'A' && currentElem.href !== '#') {
        menuToResponse.push({type: 'link', src: currentElem.href});
        break;
      } else {
        currentElem = currentElem.parentNode;
      }
    }
  })();

  switch (nodeName) {
    case 'A':
      menuToResponse.push({type: 'link', src: event.target.href});
      break;
    case 'IMG':
      menuToResponse.push({type: 'image', src: event.target.src});
      break;
    default:
      break;
  }
  safari.self.tab.setContextMenuEventUserInfo(event, menuToResponse);
}

document.addEventListener('contextmenu', contextMenuHandler);