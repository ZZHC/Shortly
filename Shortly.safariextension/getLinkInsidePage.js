function findRelShortlink() {
  var flickrPattern = /^http\:\/\/\w*\.*flickr\.com\/photos\/\w*\@?\w*\/\d*\/?$/;
  
  if (location.href.match(flickrPattern) && document.querySelector('link[rev=canonical]')) {
    var flickrShortlink = document.querySelector('link[rev=canonical]').href;
    safari.self.tab.dispatchMessage("foundRelShortlink", flickrShortlink);

  } else if (document.querySelector('link[rel=shortlink]')) {
    var relShortlink = document.querySelector('link[rel=shortlink]').href;
    safari.self.tab.dispatchMessage("foundRelShortlink", relShortlink);

  } else if (document.querySelector('link[rel=shorturl]')) {
    var relShortlink = document.querySelector('link[rel=shorturl]').href;
    safari.self.tab.dispatchMessage("foundRelShortlink", relShortlink);

  } else {
    safari.self.tab.dispatchMessage("foundRelShortlink", false);
  }
}

function responseToRequest(request) {
  if(self ===  top) {
    /* Prevent children from getting message */

    if(request.name === "findRelLink") {
      findRelShortlink();
    }
  }
}

safari.self.addEventListener("message", responseToRequest, false);