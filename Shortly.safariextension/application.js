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
  
  confirmedInjectedToolbarReady: function() {
    this.flagToolbarReady = true;
  },

  getShortlinkToCurrentPage: function() {
    var shortly = this, longUrl = shortly.activeTab.url;
    
    shortly.getShortlinkToAddress(longUrl);
  },

  getShortlinkToAddress: function(longUrl, skipNative, service) {
    var shortly = this;
    
    service = service || safari.extension.settings.shortenService;
    skipNative = (skipNative === 'skip') || safari.extension.settings.ignoreNative || false;
    
    if (!skipNative) {
      shortly.checkNativeShortlinkAvailability();
      return;
    }

    switch (service) {
      case 'bit.ly':
        shortly.getShortlinkWithBitly(longUrl);
        break;
      case 'tinyurl':
        shortly.getShortlinkWithTinyURL(longUrl);
        break;
      case 'endpoint':
        shortly.getShortlinkWithCustomEndpoint(longUrl);
        break;
      case 'goo.gl':
      default:
        shortly.getShortlinkWithGoogle(longUrl);
        break;
    }

  },
  getShortlinkWithGoogle: function(longUrl) {
    var shortly = this,
        queryAPI = 'https://www.googleapis.com/urlshortener/v1/url?key=' + apiKeyChain.google;
        
    /* Private methods for shortening */
    function successHandler(data, textStatus, jqXHR) {
      if (data.id) {
          shortly.foundShortlink(data.id)
        } else {
          shortly.reportErrorMessage('unknown', 'Expected shortlink not exists in Google response');
        }
    }
    
    function sendNormalShortenRequest(url) {
      $.ajax({ url: queryAPI, type: 'POST', dataType: 'json',
        data: '{ longUrl: "' + url + '" }',
        contentType: 'application/json',
        success: successHandler,
        error: function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.responseText === '' && textStatus == 'error') {
            shortly.reportErrorMessage('offline');
          } else {
            var response = JSON.parse(jqXHR.responseText).error;
            
            shortly.reportErrorMessage(response.errors[0].reason, response.message);
          }
        }
      });
    };
    
    function sendOAuthShortenRequest(url) {
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
          if (data.text === '' && !Shortly.isNetworkAvailable()) {
            shortly.reportErrorMessage('offline');
          } else {
            successHandler(JSON.parse(data.text), 'success', null);
          }
        },
        failure: function(data) {
          var errorMsg = JSON.parse(data.text).error;
          
          if(errorMsg.code == 401) {
            shortly.reportErrorMessage('authFail', errorMsg.message);
          } else {
            shortly.reportErrorMessage(errorMsg.errors[0].reason, errorMsg.errors.message);
          }
        }
      });
    }
    
    /* Calling the shortening code */
    if (safari.extension.settings.googleAuth) {
      sendOAuthShortenRequest(longUrl);
    } else {
      sendNormalShortenRequest(longUrl);
    }

  },
  getShortlinkWithBitly: function(longUrl) {},
  getShortlinkWithTinyUrl: function(longUrl) {},
  getShortlinkWithCustomEndpoint: function(longUrl) {},
  foundShortlink: function(shortlink) {
    var shortly = this;
    
    shortly.displayMessage(shortlink, 'shortlink');
    shortly.markActiveTabAsWorkingState('Ready');
  },
  reportErrorMessage: function(errorType, message) {
    var shortly = this;
    
    console.log(errorType, message);
    shortly.markActiveTabAsWorkingState('Failed');
  },

  displayMessage: function(message, type) {
    var shortly = this,
        displayMethod = (safari.extension.settings.toolbarMode) ? 'toolbar' : 'alert',
        toolbarReady = shortly.flagToolbarReady;
    type = type || 'text';
    
    if (safari.extension.settings.toolbarMode) {
      var waitTimeForToolbar = (toolbarReady) ? 0 : 600;
      
      setTimeout(function() {
        if(toolbarReady) {
          shortly.displayMessageWithToolbar(message, type);
        } else {
          shortly.displayMessageWithAlert(message, type);
        }
      }, waitTimeForToolbar);
      
      /* Reset shortly.flagToolbarReady to false for next request */
      shortly.flagToolbarReady = false;
    } else {
      shortly.displayMessageWithAlert(message, type);
    }
    

  },

  displayMessageWithToolbar: function(message, type) {
    var shortly = this, messageToToolbar = {};
    type = type || 'text';
    
    messageToToolbar = {
      message: message,
      type: type
    }
    
    shortly.activeTab.page.dispatchMessage("displayToolbar", messageToToolbar);
  },

  displayMessageWithAlert: function(message, type) {
    var shortly = this; type = type || 'text';
    
    switch (type) {
      case 'shortlink':
        if(navigator.platform.match(/Win/)) {
          prompt(shortly.activeTab.title, message);
        } else {
          alert(message + '\n\n' + shortly.activeTab.title);
        }
        break;
      case 'error':
        message = 'Error: ' + message;
      case 'text':
      default:
        alert(message);
        break;
    }
  },

  displayMessageWithPopover: function(message, type) {
    /* Not yet implemented. */
  },
  
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
Shortly.confirmOAuthLibAvailability = function() {
  if (typeof OAuth === 'undefined') {
    $(document).ready(function() {
      var oauthJsLibElement = document.createElement('script');
        oauthJsLibElement.src = safari.extension.baseURI + 'oauth/jsOAuth-1.2.js';
        document.querySelector('body').appendChild(oauthJsLibElement);
    });
  }
};
Shortly.isNetworkAvailable = function() {
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
    
    /* Ask if injected toolbar ready.
     * When receive confrimation, confirmedInjectedToolbarReady() will mark
     * instance.flagToolbarReady as true.
     *
     * flagToolbarReady should be reset to false again after display.
     */
    if (safari.extension.settings.toolbarMode) {
      shortly.activeTab.page.dispatchMessage("reportToolbarReady");
    }
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
          activeTab.shortlyWorkingState = state = 'Failed';
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
    Shortly.toggleToolbarMode(event.newValue);
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
    messageEvent.target.shortlyInstance.confirmedInjectedToolbarReady();
  }
  if(messageEvent.name === "oauthComplete") {
    saveOauthTokensToSettings(messageEvent.message);
  }
}