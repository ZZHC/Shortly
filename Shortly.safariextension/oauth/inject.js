if(window.top === window && location.href.match(safari.extension.baseURI)) {

  function sendOAuthComplete(event) {
    safari.self.tab.dispatchMessage('oauthComplete');
  }
  
  document.addEventListener('oauthComplete', sendOAuthComplete, false);

}