/*
 * Shortly Safari Extension
 * Version 2.0
 * By Zhusee, ZZHC Studio
 *
 * Visit: http://zzhc.org/shortly
 * GitHub: http://github.com/ZZHC/Shortly
 *
 */

function Shortly(triggeringToolbarItem) {
  var shortly = this;
  
  if (typeof triggeringToolbarItem === 'object' && triggeringToolbarItem.browserWindow !== undefined) {
    shortly.toolbarItem = triggeringToolbarItem;
    shortly.activeTab = triggeringToolbarItem.browserWindow.activeTab;
  }
  
  shortly.flagToolbarReady = false;
  
  return shortly;
}

Shortly.prototype = {
  constructor: Shortly,
  
  /* Runtime variables */
  flagToolbarReady: false,
  oauthTokens: undefined,
  
  /* Methods */
  checkNativeShortlinkAvailability: function() {
    var shortly = this;
    shortly.activeTab.page.dispatchMessage("findRelLink");
  },

  receiveNativeRelShortlink: function(shortlink) {
    var shortly = this, longUrl = shortly.activeTab.url;
    
    if(shortlink !== false) {
      shortly.foundShortlink(shortlink);
    } else if (Shortly.isKnownBitlyNative(longUrl)) {
      shortly.getShortlinkWithBitly(longUrl);
    } else {
      shortly.getShortlinkToAddress(longUrl, 'skip');
    }
  },

  getShortlinkToCurrentPage: function() {
    var shortly = this, longUrl = shortly.activeTab.url;
    
    shortly.getShortlinkToAddress(longUrl);
  },

  getShortlinkToAddress: function(longUrl, skipNative) {
    var shortly = this,
        service = safari.extension.settings.shortenService;
        
    skipNative = (skipNative === 'skip') || safari.extension.settings.ignoreNative || false;
    
    if (!skipNative) {
      shortly.checkNativeShortlinkAvailability();
      return;
    }
  },
  getShortlinkWithGoogle: function(longUrl) {},
  getShortlinkWithBitly: function(longUrl) {},
  getShortlinkWithTinyUrl: function(longUrl) {},
  getShortlinkWithCustomEndpoint: function(longUrl) {},
  foundShortlink: function() {},
  reportErrorMessage: function(errorType, message) {},
  displayShortlink: function() {},
  displayMessageWithToolbar: function() {},
  displayMessageWithAlert: function() {},
  displayMessageWithPopover: function() {},
  
  /* OAuth methods */
  getStoredOAuthTokensForSerive: function(service) {},
  getShortlinkWithGoogleAuth: function(longUrl) {},
  
  /* Manipulating Safari UI */
  toolbarItem: undefined,
  activeTab: undefined,
  markActiveTabAsWorkingState: function(state) {
    var shortly = this;
    
    if (state === 'Shortening') state += ':' + (new Date()).getTime();
    
    shortly.activeTab.shortlyWorkingState = state;
    shortly.toolbarItem.validate();
  },
};

/* Global variables */
Shortly.runtimeLocale = 'default';
Shortly.localeLib = shortlyLocaleLib;
Shortly.knownBitlyNativeList = {};

/* Public utility methods */
Shortly.confirmOAuthLibAvailability = function() {};
Shortly.checkNetworkAvailability = function() {
  if (navigator.onLine == false) {
    return false;
  } else {
    var xmlHttp = $.ajax({
      url: 'http://www.google.com/blank.html',
      dataType: 'html',
      async: false
    })
    
    return (xmlHttp.statusText === 'error') ? false : true;
  }
};

Shortly.isKnownBitlyNative = function(longUrl) {
  try {
    var domain = longUrl.match(/:\/\/([^\/]+)/)[1],
        list = Shortly.knownBitlyNativeList;
    
    for (var key in list) {
      if (domain.match(list[key])) return true;
    }
    return false;

  } catch(e) {
    console.log(e);
    return false;
  }
}

Shortly.toogleToolbarMode = function(flag) {
  var url = {
    js: safari.extension.baseURI + 'toolbarMode.js',
    css: safari.extension.baseURI + 'toolbarTemplate.css',
    jQuery: safari.extension.baseURI + 'jquery-1.6.2.min.js'
  };
  
  if(flag) {
    safari.extension.addContentScriptFromURL(url.jQuery);
    safari.extension.addContentScriptFromURL(url.js);
    safari.extension.addContentStyleSheetFromURL(url.css);
  } else {
    safari.extension.removeContentScript(url.jQuery);
    safari.extension.removeContentScript(url.js);
    safari.extension.removeContentStyleSheet(url.css);
  }
};

Shortly.getLocaleString = function(query) {
  var userLocale = navigator.language.toLowerCase(),
      queryArray = query.split('.'),
      pointer = Shortly.localeLib;
  try {
    for (var i in queryArray) {
      pointer = pointer[queryArray[i]];
    }
    return (typeof pointer[userLocale] === 'string') ? pointer[userLocale] : pointer['default']
  } catch(e) {
    console.log(e);
    return false;
  }
};


/* Initialize */
Shortly.toogleToolbarMode(safari.extension.settings.toolbarMode);
if(safari.extension.settings.googleAuth) Shortly.confirmOAuthLibAvailability();

safari.application.addEventListener("command", performCommand, false);
safari.application.addEventListener("validate", validateCommand, false);
safari.application.addEventListener("message", respondToMessage, false);
safari.extension.settings.addEventListener("change", settingsChanged, false);

/* Event Listeners */

function performCommand(event) {
  if (event.command === "shortenURL") {
    if (!navigator.onLine) {
      reportErrorMessage('offline');
      return false;
    }
    
    var shortly = event.target.browserWindow.activeTab.shortlyInstance;
    
    if (!(shortly instanceof Shortly)) {
      shortly = event.target.browserWindow.activeTab.shortlyInstance = new Shortly(event.target);
    }
    
    shortly.markActiveTabAsWorkingState('Shortening');
    shortly.getShortlinkToCurrentPage();
  }
}

function validateCommand(event) {
  if (event.command === "shortenURL") {
    var toolbarItem = event.target,
        activeTab = toolbarItem.browserWindow.activeTab;
    
    toolbarItem.label = Shortly.getLocaleString('btnShorten.label');
    toolbarItem.toolTip = Shortly.getLocaleString('btnShorten.toolTip');
    
    if (activeTab.shortlyInstance) {
      var state = activeTab.shortlyWorkingState;
      
      if (state.match(/Shortening:(\d+)$/)) {
        var sinceTime = state.split(':')[1],
            currentTime = (new Date()).getTime();
            
        if ((currentTime - sinceTime) > 60000) {
          activeTab.shortlyInstance.reportErrorMessage('timeout');
          state = 'Failed';
        }
      }
      
      switch (state.split(':')[0]) {
        case 'Shortening': 
          toolbarItem.badge = 1;
          toolbarItem.disabled = true;
          break;
        case 'Ready':
        default:
          toolbarItem.badge = 0;
          toolbarItem.disabled = false;
          break;
      }
      if(!activeTab.url) toolbarItem.disabled = true;
    } else {
      toolbarItem.badge = 0;
      toolbarItem.disabled = !activeTab.url;
    }
  }
}

function settingsChanged(event) {
  if (event.key === "toolbarMode") {
    toggleToolbarMode(event.newValue);
    if (event.newValue) alert(Shortly.getLocaleString('notice.toolbarMode'));
  }
  if (event.key === "googleAuth") {
    if(event.newValue) enableGoogleAuthShortening();
  }
}

/* Communications with injected script */

function respondToMessage(messageEvent) {
  if(messageEvent.name === "foundRelShortlink") {
    messageEvent.target.shortlyInstance.receiveNativeRelShortlink(messageEvent.message);
  }
  if(messageEvent.name === "toolbarReady") {
    confirmedInjectedToolbarReady();
  }
  if(messageEvent.name === "oauthComplete") {
    saveOauthTokensToSettings(messageEvent.message);
  }
}


function enableGoogleAuthShortening() {
  confirmOauthLibAvailability();
  startOAuthDanceWithGoogle();
}

function initializeShortening(sender) {
  var url = sender.browserWindow.activeTab.url;
  var toolbarMode = safari.extension.settings.getItem("toolbarMode");
  var urlFilter = {
    youtube: /^http\:\/\/\w*\.*youtube\.com\/watch\?.*v\=(.{0,15})(?:\&|$)/,
    flickr: /^http\:\/\/\w*\.*flickr\.com\/photos\/\w*\@?\w*\/\d*\/?$/
  };
  var urlFlag = {
    youtube: url.match(urlFilter.youtube),
    flickr: url.match(urlFilter.flickr)
  };
  
  sender.badge = 1;
  sender.disabled = true;
  runtimeSettings.currentToolbarItem = sender;
  
  if(urlFlag.flickr) {
    getFlickrShortLink(sender.browserWindow.activeTab);
  } else {
    checkNativeShortlinkAvailability(sender);
  }
  
  if(toolbarMode) checkInjectedToolbarReady();
  
  if(urlFlag.youtube) {
    shortenYoutube(urlFlag.youtube[1]);
  } else {
    shortenWithExternalService(sender);
  }
};

function shortenWithExternalService(sender) {
  var url = sender.browserWindow.activeTab.url;
  var defaultService = "goo.gl";
  var serviceFlag = safari.extension.settings.getItem("shortenService") || defaultService;
  
  if(serviceFlag === "goo.gl") { shortenWithGoogleShortenerAPI(url); }
  if(serviceFlag === "bit.ly") {
    var bitlyUsername = safari.extension.secureSettings.getItem("bitlyUsername") || "";
    var bitlyAPIKey = safari.extension.secureSettings.getItem("bitlyAPIKey") || "";
    
    if(bitlyUsername === "" || bitlyAPIKey.length === "") {
      shortenWithBitly(url);
    } else {
      shortenWithBitlyWithAPI(url, bitlyUsername, bitlyAPIKey);
    }
  }
  if(serviceFlag === "tinyurl") { shortenWithTinyURL(url); }
}


function finalizeShortening(shortUrl, errorMsg) {
  var activeTab = runtimeSettings.currentToolbarItem.browserWindow.activeTab;
  var toolbarReady = runtimeSettings.injectedToolbarReady;
  var toolbarMode = safari.extension.settings.getItem("toolbarMode");
  var finalUrl = '';
  var waitMessageTime = 0;
  
  var displayViaToolbar = function() {
    var message = {
      url: activeTab.url,
      shortUrl: finalUrl,
      error: errorMsg
    };
    
    if(finalUrl !== null) { message.error = null; }
    
    activeTab.page.dispatchMessage("displayToolbar", message);
  };
  
  var displayViaAlert = function() {
    if(errorMsg && finalUrl === null) {
      alert(errorMsg);
    } else {
     if(navigator.platform.match(/Win/)) {
        prompt(activeTab.title, (finalUrl || errorMsg));
      } else {
        alert(activeTab.title + '\n' + (finalUrl || errorMsg));
      }
    }
  };
  
  if((runtimeSettings.currentNativeShortlink === null) || !toolbarReady) {
    waitMessageTime = 500;
  }
  
  setTimeout(function() {
    if(runtimeSettings.currentNativeShortlink !== null) {
      finalUrl = runtimeSettings.currentNativeShortlink;
    } else {
      finalUrl = shortUrl;
    }
    toolbarReady = runtimeSettings.injectedToolbarReady;
    
    if(toolbarMode && toolbarReady) {
      displayViaToolbar();
    } else {
      displayViaAlert();
    }
    
    runtimeSettings.currentToolbarItem.badge = 0;
    runtimeSettings.currentToolbarItem.disabled = false;
    
    /* Reset runtime settings */
    runtimeSettings.currentToolbarItem = null;
    runtimeSettings.currentNativeShortlink = null;
    runtimeSettings.injectedToolbarReady = false;
  }, waitMessageTime);
}

function proceedJSONWithApiAndIndex(queryAPI, targetIndex, method) {
  var lang = runtimeSettings.langFlag;
  method = method || 'get';

  $.ajax({
    url: queryAPI,
    type: method,
    dataType: 'json',
    success: function(data, status, xmlHttp) {
      if(data === null && xmlHttp.status === 0) {
        generalAjaxErrorHandler(xmlHttp, 'offline', null);
        return;
      }
      try {
        finalizeShortening(data[targetIndex], null);
      } catch(e) {
        generalAjaxErrorHandler(xmlHttp, 'error', 'undefined');
      }
    },
    error: generalAjaxErrorHandler
  });
};

function generalAjaxErrorHandler(xmlHttp, status, errorMsg) {
  var lang = runtimeSettings.langFlag;
  
  if(typeof errorMsg === 'undefined') {
    var errorJson = {};
    
    try {
      errorJson = jQuery.parseJSON(xmlHttp.responseText);
    } catch(e) {
      var errorJson = {};
    }
    
    errorMsg = ((typeof errorJson.error_message) ? errorJson.error_message : null) || xmlHttp.statusText || status;
  }
  
  if(status.match(/parseerror/i)) {
    finalizeShortening(null, locale[lang].errorMessage.invalidJSON);
  } else if(status.match(/offline/i)) {
    finalizeShortening(null, locale[lang].errorMessage.offline);
  } else {
    finalizeShortening(null, locale[lang].errorMessage.generalError + errorMsg);
  }
}



function receiveFlickrShortlink(message) {
  if(message) {
    runtimeSettings.currentNativeShortlink = message;
  } else {
    var currentToolbarItem = runtimeSettings.currentToolbarItem;
    checkNativeShortlinkAvailability(currentToolbarItem);
  }
}

function receiveNativeShortlinkAvailability(message) {
  if(message) {
    runtimeSettings.currentNativeShortlink = message;
  } /* else {
    var currentToolbarItem = runtimeSettings.currentToolbarItem;
    shortenWithExternalService(currentToolbarItem);
  } */
}

function checkInjectedToolbarReady() {
  var activeTab = runtimeSettings.currentToolbarItem.browserWindow.activeTab;
  var message = { url: activeTab.url }
  
  activeTab.page.dispatchMessage("checkToolbarReady", message);
}

function confirmedInjectedToolbarReady() {
  runtimeSettings.injectedToolbarReady = true;
}

/* Get native shortlinks */

function shortenYoutube(video) {
  finalizeShortening('http://youtu.be/' + video, null);
}

function getFlickrShortLink(activeTab) {
  activeTab.page.dispatchMessage("getFlickr", activeTab.url);
}

function checkNativeShortlinkAvailability(currentToolbarItem) {
  var activeTab = currentToolbarItem.browserWindow.activeTab;
  activeTab.page.dispatchMessage("findRelLink", activeTab.url);
}


/* goo.gl Shorten API */

function shortenWithGoogle(url) {
  var queryAPI = "http://ggl-shortener.appspot.com/?url=" + encodeURIComponent(url);
  
  proceedJSONWithApiAndIndex(queryAPI, "short_url");
}

function shortenWithGoogleShortenerAPI(url) {
  var queryAPI = 'https://www.googleapis.com/urlshortener/v1/url?key=' + apiKeyChain.google;
  
  var googleResultHandler = function(data, status, xmlHttp) {
    if(data === null && xmlHttp.status === 0) {
      generalAjaxErrorHandler(xmlHttp, 'offline', null);
      return;
    }
    try {
      finalizeShortening(data['id'], null);
    } catch(e) {
      generalAjaxErrorHandler(xmlHttp, 'error', 'undefined');
    }
  };
  
  if (safari.extension.settings.googleAuth) {
    var googl_tokens = {
      token: safari.extension.secureSettings.getItem('googl_oauth_token'),
      token_secret: safari.extension.secureSettings.getItem('googl_oauth_token_secret'),
    };
    var options = {
      consumerKey: 'anonymous',
      consumerSecret: 'anonymous',
      accessTokenKey: googl_tokens.token,
      accessTokenSecret: googl_tokens.token_secret
    };
    
    var oauth = new OAuth(options);
    
    oauth.request({
      method: 'POST',
      url: queryAPI,
      data: '{ longUrl: "' + url + '" }',
      headers: { 'Content-Type': 'application/json' },
      success: function(data) {
        googleResultHandler(JSON.parse(data.text), 'sucess', null);
      },
      failure: function(data) {
        var errorMsg = JSON.parse(data.text).error;
        if(errorMsg.code == 401) {
          var msg = "Bad authentication, please reset your login info then try again.";
          generalAjaxErrorHandler(null, errorMsg.code.toString(), msg);
        } else {
          generalAjaxErrorHandler(null, errorMsg.codetoString(), errorMsg.message);
        }
      }
    });
  
  } else {
    $.ajax({
      url: queryAPI,
      type: 'POST',
      data: '{ longUrl: "' + url + '" }',
      dataType: 'json',
      contentType: 'application/json',
      success: googleResultHandler,
      error: generalAjaxErrorHandler
    });
  }
}

/* Bit.ly Shorten API */

function shortenWithBitly(url) {
  var defaultUser = "zzhc";
  var defaultAPIKey = apiKeyChain.bitly;
  
  shortenWithBitlyWithAPI(url, defaultUser, defaultAPIKey);
}

function shortenWithBitlyWithAPI(url, username, APIKey) {
  var lang = runtimeSettings.langFlag;
  var bitlyAPI = "http://bit.ly/javascript-api.js?version=latest&login=" + username + "&apiKey=" + APIKey;
  
  /* I know this is ugly, but it's the only way I could think of to solve the Safari navigator.onLine bug. */
  
  $.ajax({
    url: "http://goo.gl",
    dataType: "html",
    cache: false,
    success: function(data, status, xmlHttp) {
      if(data === "" && xmlHttp.status === 0) {
        generalAjaxErrorHandler(xmlHttp, 'offline', null);
        return;
      }
      try {
        doTheShortenThing();
      } catch(e) {
        generalAjaxErrorHandler(xmlHttp, 'error', 'undefined');
      }
    },
    error: generalAjaxErrorHandler
  });
  
  var doBitlyAPI = function(longUrl) {

    BitlyCB.shortenResponse = function(data) {
      var s = '';
      var first_result;
      // Results are keyed by longUrl, so we need to grab the first one.
      try {
        for (var r in data.results) {
          first_result = data.results[r]; break;
        }
        for (var key in first_result) {
          s += key + ":" + first_result[key].toString() + "\n";
        }
      
        finalizeShortening(first_result.shortUrl, null);
      } catch(e) {
        if(data.statusCode === "INVALID_APIKEY") {
          generalAjaxErrorHandler(null, 'authFail', 'bit.ly auth fail. Please check you have your API key (not password) entered, restart Safari and try again.');
        } else if(data.statusCode === "MISSING_ARG_APIKEY" || data.statusCode === "INVALID_LOGIN") {
          generalAjaxErrorHandler(null, 'authFail', 'bit.ly auth fail. Please check your login information, restart Safari and try again.');
        } else if(data.statusCode !== "OK") {
          generalAjaxErrorHandler(null, 'error', 'bit.ly error: ' + data.statusCode);
        }
      }
    }
    
    BitlyClient.shorten(url, 'BitlyCB.shortenResponse');
  };
  
  var doTheShortenThing = function() {
  
    if(typeof BitlyCB === "undefined" || typeof BitlyClient === "undefined") {
      $.getScript(bitlyAPI, function() { doBitlyAPI(url); });
    } else {
      doBitlyAPI(url);
    }
    
  };
}

/* TinyURL API */

function shortenWithTinyURL(url) {
  var queryAPI = "http://json-tinyurl.appspot.com/?url=" + encodeURIComponent(url);
  
  proceedJSONWithApiAndIndex(queryAPI, "tinyurl");

}

/* OAuth experimental support */

function startOAuthDanceWithGoogle() {
  var google_token_complete = true;

  /* Check OAuth tokens */
  var googl_tokens = {
    token: safari.extension.secureSettings.getItem('googl_oauth_token'),
    token_secret: safari.extension.secureSettings.getItem('googl_oauth_token_secret'),
    date: safari.extension.secureSettings.getItem('googl_oauth_date')
  };

  for (var i in googl_tokens) {
    if (googl_tokens[i] === null) google_token_complete = false;
  }

  if (google_token_complete == true) {
    alert((new Date(oauth.date)).toLocaleDateString());
  } else {
    safari.extension.secureSettings.removeItem('googl_oauth_token');
    safari.extension.secureSettings.removeItem('googl_oauth_token_secret');
    safari.extension.secureSettings.removeItem('googl_oauth_date');

    safari.application.openBrowserWindow().activeTab.url = safari.extension.baseURI + 'oauth/start.html';
  }
}


function saveOauthTokensToSettings(tokenMsg) {
  try {
  
    if (!tokenMsg) throw "Receive bad token message.";
    
    if(tokenMsg.oauth_token !== null && tokenMsg.oauth_token_secret !== null) {
      safari.extension.secureSettings.setItem('googl_oauth_token', tokenMsg.oauth_token);
      safari.extension.secureSettings.setItem('googl_oauth_token_secret', tokenMsg.oauth_token_secret);
      safari.extension.secureSettings.setItem('googl_oauth_date', (new Date()).getTime());
    } else {
      throw "Token infos missing in message.";
    }
  
  } catch(e) {
    console.log(e);
    alert('OAuth failed. Please try again.');
  }
}

function confirmOauthLibAvailability() {
  if (typeof OAuth === 'undefined') {
    $(document).ready(function() {
      var oauthJsLibElement = document.createElement('script');
        oauthJsLibElement.src = safari.extension.baseURI + 'oauth/jsOAuth-1.2.js';
        document.querySelector('body').appendChild(oauthJsLibElement);
    });
  }
}