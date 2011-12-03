function findRelShortlink() {
  var flickrPattern = /^http\:\/\/\w*\.*flickr\.com\/photos\/\w*\@?\w*\/\d*\/?$/,
      kkboxPattern = /^http\:\/\/\w*\.?kkbox.com\/(album|song)\//;
  
  if (location.href.match(flickrPattern) && document.querySelector('link[rev=canonical]')) {
    var flickrShortlink = document.querySelector('link[rev=canonical]').href;
    safari.self.tab.dispatchMessage("foundRelShortlink", flickrShortlink);

  } else if (document.querySelector('link[rel=shortlink]')) {
    var relShortlink = document.querySelector('link[rel=shortlink]').href;
    safari.self.tab.dispatchMessage("foundRelShortlink", relShortlink);

  } else if (document.querySelector('link[rel=shorturl]')) {
    var relShortlink = document.querySelector('link[rel=shorturl]').href;
    safari.self.tab.dispatchMessage("foundRelShortlink", relShortlink);
  } else if (location.href.match(kkboxPattern)) {
    (function getKKBoxNativeShortlink(count) {
      var queryTarget = 'div.share-link-bar > input', waitTime = 2000;
      count = count || 0;

      if (document.querySelector(queryTarget)) {
        var result = document.querySelector(queryTarget).value;        
        result = (result.match(/^http\:\/\/kkbox\.fm\//)) ? result : false;

        safari.self.tab.dispatchMessage("foundRelShortlink", result);
      } else if(count < 3) {
        setTimeout(getKKBoxNativeShortlink, waitTime, ++count);
        console.log('Retrying to find kkbox.fm link…(' + count + ')');
      } else {
        safari.self.tab.dispatchMessage("foundRelShortlink", false);
        console.warn('Shortly failed to find native kkbox.fm shortlink.');
      }
    })();
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