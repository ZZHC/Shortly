if(window.top === window && location.href.match(safari.extension.baseURI)) {

  function sendOAuthComplete(event) {
    var tokenMsg = {};
    
    try {
      tokenMsg.token = localStorage.getItem('googl_oauth_token');
      tokenMsg.token_secret = localStorage.getItem('googl_oauth_token_secret');
      
      localStorage.clear();
    } catch(e) {
      console.log(e);
      return false;
    }
    
    safari.self.tab.dispatchMessage('oauthComplete', tokenMsg);
  }
  
  document.addEventListener('oauthComplete', sendOAuthComplete, false);

}