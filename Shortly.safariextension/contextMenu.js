function contextMenuHandler(event) {
  safari.self.tab.setContextMenuEventUserInfo(event, event.target.nodeName);
  console.log(event);
}

document.addEventListener('contextmenu', contextMenuHandler);