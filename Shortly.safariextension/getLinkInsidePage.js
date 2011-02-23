function getFlickrShortLink() {
  if(document.querySelector('link[rev=canonical]')) {
    var flickrShortlink = document.querySelector('link[rev=canonical]').href;
    safari.self.tab.dispatchMessage("foundFlickrLink",flickrShortlink);
  } else {
    safari.self.tab.dispatchMessage("foundFlickrLink",false);
  }
}

function findRelShortlink() {
  if(document.querySelector('link[rel=shortlink]')) {
    var relShortlink = document.querySelector('link[rel=shortlink]').href;
    safari.self.tab.dispatchMessage("didFindRelLink",relShortlink);
  } else if(document.querySelector('link[rel=shorturl]')) {
    var relShortlink = document.querySelector('link[rel=shorturl]').href;
    safari.self.tab.dispatchMessage("didFindRelLink",relShortlink);
  } else {
    safari.self.tab.dispatchMessage("didFindRelLink",false);
  }
}

function responseToRequest(request) {
  if((location.href === request.message) && (self ===  top)) {
    /* Prevent children from getting message */
    
    if(request.name === "getFlickr") {
      getFlickrShortLink();
    }
    if(request.name === "findRelLink") {
      findRelShortlink();
    }
  }
}

safari.self.addEventListener("message", responseToRequest, false);