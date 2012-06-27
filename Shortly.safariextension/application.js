/*
 * Shortly Safari Extension
 * Version 2.0
 * By Zhusee, ZZHC Studio
 *
 * Visit: http://zzhc.org/shortly
 * GitHub: http://github.com/ZZHC/Shortly
 *
 */

function Shortly(mountPoint) {
  var shortly = this;
  
  if (typeof mountPoint === 'object' && mountPoint.toolTip !== undefined) {
    /* Check if SafariExtensionToolbarItem for Safari 4 */
    shortly.toolbarItem = mountPoint;
    shortly.activeTab = mountPoint.browserWindow.activeTab;
  } else if (typeof mountPoint === 'object' && mountPoint.page !== undefined) {
    /* Check if SafariBrowserTab for Safari 4 */
    shortly.toolbarItem = null;
    shortly.activeTab = mountPoint;
  }

  shortly.flagToolbarReady = false;
  
  return shortly;
}

Shortly.prototype = {
  constructor: Shortly,
  
  /* Runtime variables */
  flagToolbarReady: false,
  flagAbort: false,
  flagWaitingMessageFromPage: false,
  oauthTokens: undefined,
  
  /* Methods */
  checkNativeShortlinkAvailability: function(longUrl) {
    var shortly = this;
    
    if (longUrl.match(/http(s)?:\/\/(gist\.)?github\.com/)) {

      (function shortenWithGithubNativeShortener(longUrl) {
        $.ajax({ url: 'http://git.io', data: {url: longUrl}, type: 'POST',
            success: function(data, textStatus, jqXHR) {
              var statusCode = jqXHR.status, statusText = jqXHR.getResponseHeader('Status'),
                  shortlink = jqXHR.getResponseHeader('Location');

              if (shortlink) {
                shortly.foundShortlink(shortlink);
              } else {
                console.warn('Unknown error', jqXHR.getAllResponseHeaders());
                shortly.getShortlinkToAddress(longUrl, 'skip');
              }
            },
            error: function(jqXHR, textStatus, errorThrown) {
              var statusCode = jqXHR.status, statusText = jqXHR.getResponseHeader('Status'),
                  errorMsg = jqXHR.responseText;

              if (jqXHR.status === 0 && textStatus == 'error') {
                shortly.reportErrorMessage('offline');
              } else {
                console.error('Git.io Error:', statusText, errorMsg);
                shortly.getShortlinkToAddress(longUrl, 'skip');
              }
            }
          });
      })(longUrl);

    } else if (Shortly.isKnownBitlyNative(longUrl)) {
      shortly.getShortlinkWithBitly(longUrl);
    } else {
      shortly.activeTab.page.dispatchMessage("findRelLink");
      shortly.flagWaitingMessageFromPage = true;
      setTimeout(function() {
        if (shortly.flagWaitingMessageFromPage) {
          shortly.getShortlinkToAddress(longUrl, 'skip');
          shortly.flagWaitingMessageFromPage = false;
          console.warn('Not receiving resonse from injected script for native shortlinks. Shorten URL with external service instead.');
        }
      }, 2000);
    }
  },

  receiveNativeRelShortlink: function(shortlink) {
    var shortly = this, longUrl = shortly.activeTab.url;
    if (this.flagAbort) return 'Aborted';

    shortly.flagWaitingMessageFromPage = false;

    if (shortlink !== false) {
      shortly.foundShortlink(shortlink);
    } else {
      shortly.getShortlinkToAddress(longUrl, 'skip');
    }
  },
  
  confirmedInjectedToolbarReady: function() {
    this.flagToolbarReady = true;
  },

  getShortlinkToCurrentPage: function() {
    var shortly = this, longUrl = shortly.activeTab.url;
    if (this.flagAbort) return 'Aborted';

    shortly.getShortlinkToAddress(longUrl);
  },

  getShortlinkToAddress: function(longUrl, skipNative, service) {
    var shortly = this;
    if (this.flagAbort) return 'Aborted';

    service = service || safari.extension.settings.shortenService;
    skipNative = (skipNative === 'skip') || safari.extension.settings.ignoreNative || false;
    
    if (!skipNative) {
      shortly.checkNativeShortlinkAvailability(longUrl);
      return;
    }

    switch (service) {
      case 'bit.ly':
        shortly.getShortlinkWithBitly(longUrl);
        break;
      case 'tinyurl':
        shortly.getShortlinkWithTinyUrl(longUrl);
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
        queryAPI = 'https://www.googleapis.com/urlshortener/v1/url';
    if (this.flagAbort) return 'Aborted';
    
    /* Private methods for shortening */
    function successHandler(data, textStatus, jqXHR) {
      if (data.id) {
          shortly.foundShortlink(data.id)
        } else {
          shortly.reportErrorMessage('unknown', 'Expected shortlink not exists in Google response');
        }
    }
    
    function sendNormalShortenRequest(url) {
      var queryAPIwithKey = queryAPI + '?key=' + apiKeyChain.google;
      $.ajax({ url: queryAPIwithKey, type: 'POST', dataType: 'json',
        data: '{ longUrl: "' + url + '" }',
        contentType: 'application/json',
        success: successHandler,
        error: function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.status === 0 && textStatus == 'error') {
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
          if (data.text === '') {
            if (!Shortly.isNetworkAvailable()) shortly.reportErrorMessage('offline');
          } else {
            successHandler(JSON.parse(data.text), 'success', null);
          }
        },
        failure: function(data) {
          var errorMsg = JSON.parse(data.text).error;
          
          if (errorMsg.code == 401) {
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
  getShortlinkWithBitly: function(longUrl) {
    var shortly = this,
        defaultLogin = 'zzhc', defaultAPIKey = apiKeyChain.bitly,
        userLogin = safari.extension.secureSettings.bitlyUsername || '',
        userAPIKey = safari.extension.secureSettings.bitlyAPIKey || '',
        queryAPI = 'http://api.bitly.com/v3/shorten?';

    if (this.flagAbort) return 'Aborted';
    
    function errorMessageHandler(code, message) {
      switch (message) {
        case 'INVALID_LOGIN':
        case 'INVALID_APIKEY':
        case 'MISSING_ARG_LOGIN':
        case 'MISSING_ARG_APIKEY':
          shortly.reportErrorMessage('authFail', message);
          break;
        case 'RATE_LIMIT_EXCEEDED':
          shortly.reportErrorMessage('limit', message);
          break;
        default:
          shortly.reportErrorMessage('unknown', 'bit.ly returning error ' + code + ': ' + message);
          break;
      }
    }
    
    if (userLogin == '' && userAPIKey == '') {
      userLogin = defaultLogin; userAPIKey = defaultAPIKey;
    }
    queryAPI += 'login=' + userLogin + '&apiKey=' + userAPIKey + '&longUrl=' + encodeURIComponent(longUrl);
    
    $.ajax({ url: queryAPI, dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          if (data.status_code == 200) {
            shortly.foundShortlink(data.data.url);
          } else {
            errorMessageHandler(data.status_code, data.status_txt);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.status === 0 && textStatus == 'error') {
            shortly.reportErrorMessage('offline');
          } else {
            shortly.reportErrorMessage('unknown', 'Error on fetching bit.ly JSON query.');
          }
        }
      });
    
  },
  getShortlinkWithTinyUrl: function(longUrl) {
    var shortly = this,
        queryAPI = "http://tinyurl.com/api-create.php?url=" + encodeURIComponent(longUrl);
    
    if (this.flagAbort) return 'Aborted';
    
    $.ajax({ url: queryAPI, dataType: 'text',
        success: function(data, textStatus, jqXHR) {
          if (data.match(/^http:\/\/\w*\.?tinyurl\.com\//)) {
            shortly.foundShortlink(data);
          } else {
            shortly.reportErrorMessage('unknown', 'TinyURL responding ' + data);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.status === 0 && textStatus == 'error') {
            shortly.reportErrorMessage('offline');
          } else {
            shortly.reportErrorMessage('unknown', 'Error on fetching TinyURL query.');
          }
        }
      });
  },
  getShortlinkWithCustomEndpoint: function(longUrl) {
    var shortly = this,
        queryAPI = safari.extension.settings.customEndpoint || '';

    if (this.flagAbort) return 'Aborted';

    if (queryAPI === '') {
      shortly.reportErrorMessage('error', Shortly.getLocaleString('errorMessage.badEndpoint'));
    } else {
      queryAPI = queryAPI.replace(/=%@/, '=' + encodeURIComponent(longUrl));

      $.ajax({ url: queryAPI, dataType: 'json',
          success: function(data, textStatus, jqXHR) {
            var shortlink = data.shortlink || data.shorturl || data.link || data.url || data.result || '',
                errorType = data.errorType || '',
                errorMessage = data.errorMessage || data.errormessage || '';

            if (data.status === 'success' || shortlink.match(/^https?:\/\//)) {
              shortly.foundShortlink(shortlink);
            } else if (data.status === 'failure' || errorType || errorMessage) {
              shortly.reportErrorMessage(errorType, errorMessage);
            } else {
              shortly.reportErrorMessage('error', Shortly.getLocaleString('errorMessage.invalidResponse'));
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            if (textStatus === 'parsererror') {
              if (jqXHR.responseText.match(/^https?:\/\//)) {
                shortly.foundShortlink(jqXHR.responseText);
              } else {
                shortly.reportErrorMessage('error', jqXHR.responseText);
              }
            } else if (jqXHR.responseText !== '') {
              shortly.reportErrorMessage('error', jqXHR.responseText);
            } else if (jqXHR.status === 0 && textStatus == 'error') {
              shortly.reportErrorMessage('offline');
            } else {
              shortly.reportErrorMessage('unknown', 'Error on fetching  endpoint JSON response.');
            }
          }
        });
    }
  },
  foundShortlink: function(shortlink) {
    var shortly = this;
    if (this.flagAbort) return 'Aborted';
    
    console.log('Success: ' + shortlink + ' for ' + this.activeTab.url);
    shortly.markActiveTabAsWorkingState('Ready');
    shortly.displayMessage(shortlink, 'shortlink');
  },
  reportErrorMessage: function(errorType, message) {
    var shortly = this;
    /* Expecting error: offline, timeout, authFail, limit, unknown */
    
    switch (errorType) {
      case 'timeout':
        var errMsg = Shortly.getLocaleString('errorMessage.generalError') + Shortly.getLocaleString('errorMessage.timeout');
        shortly.displayMessage(errMsg, 'error');
        break;

      case 'offline':
        shortly.displayMessage(Shortly.getLocaleString('errorMessage.offline'), 'error');
        break;

      case 'authFail':
        shortly.displayMessage(Shortly.getLocaleString('errorMessage.authFail') + ' (' + message + ')', 'error');
        break;

      case 'unknown':
        shortly.displayMessage(Shortly.getLocaleString('errorMessage.generalError') + Shortly.getLocaleString('errorMessage.unknown'), 'error');
        break;
      case 'limit':
      case 'error':
      default:
        shortly.displayMessage(Shortly.getLocaleString('errorMessage.generalError') + message, 'error');
        break;
    }
  
    console.error(errorType, message, shortly.activeTab.url, (new Date()).toLocaleString());
    shortly.markActiveTabAsWorkingState('Failed');
  },

  displayMessage: function(message, type) {
    var shortly = this,
        displayMethod = (Shortly.displayMethod()) || 'toolbar',
        toolbarReady = shortly.flagToolbarReady;

    type = type || 'text'; /* Expected: shortlink, error, or text */
    
    switch (displayMethod) {
      case 'popover':
        if (shortly.toolbarItem) {
          shortly.displayMessageWithPopover(message, type);
          break;
        }
      case 'toolbar':
        var waitTimeForToolbar = (toolbarReady) ? 0 : 600;

        setTimeout(function() {
          if (shortly.flagToolbarReady) {
            shortly.displayMessageWithToolbar(message, type);
          } else {
            console.warn('Toolbar not ready when displaying message', (new Date()).toLocaleString());
            if (safari.extension.popovers && shortly.toolbarItem) {
              shortly.displayMessageWithPopover(message, type);
            } else {
              shortly.displayMessageWithAlert(message, type);
            }
          }
          /* Reset shortly.flagToolbarReady to false for next request */
          shortly.flagToolbarReady = false;
        }, waitTimeForToolbar);
        break;
      case 'alert':
      default:
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
    var shortly = this;
    type = type || 'text';
    
    switch (type) {
      case 'shortlink':
        if (navigator.platform.match(/Win/)) {
          prompt(shortly.activeTab.title, message);
        } else {
          alert(message + '\n\n' + shortly.activeTab.title);
        }
        break;
      case 'error':
      case 'text':
      default:
        alert(message);
        break;
    }
  },

  displayMessageWithPopover: function(message, type) {
    var shortly = this,
        popover = shortly.setupTemporaryPopover('popoverResult'),
        localeLib = [];
        
    type = type || 'text';

    localeLib.push({query: '#result small', string: Shortly.getLocaleString('notice.popoverTips')});
    popover.contentWindow.setLocaleString(localeLib);
    popover.contentWindow.displayMessage(message, type);

    shortly.toolbarItem.showPopover();
  },
  
  /* Abortion methods */
  callAbort: function(message, flagPublic) {
    this.flagAbort = true;
    console.log('Called abort.', message, (new Date()).toLocaleString());

    if (this.activeTab.shortlyWorkingState.match(/Shortening:(\d+)$/)) {
      this.markActiveTabAsWorkingState('Aborted');
    }
    
    if (flagPublic) this.displayMessage(message, 'error');
  },
  backToWork: function() {
    this.flagAbort = false;
  },
  
  /* Manipulating Safari UI */
  toolbarItem: undefined,
  activeTab: undefined,
  markActiveTabAsWorkingState: function(state) {
    var shortly = this;
    
    if (state === 'Shortening') state += ':' + (new Date()).getTime();

    console.log('State change:', state, shortly.activeTab);
    shortly.activeTab.shortlyWorkingState = state;

    if (shortly.toolbarItem) {
      if (state.match(/^Shortening/)) {
        shortly.startAnimation(); //Including validate request.
      } else {
        shortly.stopAnimation();
        shortly.toolbarItem.validate();
      }
    }
  },
  startAnimation: function() {
    Shortly.startAnimationForTab(this.activeTab);
  },
  stopAnimation: function() {
    Shortly.stopAnimationForTab(this.activeTab);
  },
  setupTemporaryPopover: function(identifier) {
    var shortly = this,
        popover = undefined,
        menu = shortly.toolbarItem.menu;

    function popoverSelfBomb(event) {
      /* Remove popover and hook back the menu
       * after popover being closed */
      if (event.srcElement === popover.contentWindow) {
        shortly.toolbarItem.popover = null;
        shortly.toolbarItem.menu = menu;
        popover.contentWindow.removeEventListener('blur', popoverSelfBomb, false)
        console.log('Popover removed:', identifier, (new Date()).toLocaleString())
      }
    }

    /* Get the popover for displaying results */
    for (var i in safari.extension.popovers) {
      if (safari.extension.popovers[i].identifier === identifier) {
        popover = safari.extension.popovers[i];
      }
    }

    try {
      shortly.toolbarItem.menu = null;
      shortly.toolbarItem.popover = popover;
      console.log('Temporary popover setup:', identifier, (new Date()).toLocaleString());
    } catch(error) {
      shortly.reportErrorMessage('unknown', 'Popover setup failed.');
      return false;
    }

    popover.contentWindow.addEventListener('blur', popoverSelfBomb, false);

    return popover;
  }
};

/* Global variables */
Shortly.runtimeLocale = 'default';
Shortly.localeLib = shortlyLocaleLib;
Shortly.knownBitlyNativeList = JSON.parse(safari.extension.settings.getItem('knownBitlyNativeList'));

/* Public utility methods */
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
    
    for (var i=0; i<list.length; i++) {
      if (domain.match(new RegExp(list[i]))) return true;
    }
    return false;

  } catch(e) {
    console.log(e);
    return false;
  }
}
Shortly.updateKnownBitlyNativeListWithArray = function(listArray) {
  if (safari.extension.settings.knownBitlyNativeList) {
    safari.extension.settings.setItem('knownBitlyNativeList', JSON.stringify(listArray));
    Shortly.knownBitlyNativeList = JSON.parse(safari.extension.settings.getItem('knownBitlyNativeList'));
  } else {
    console.error('Property `knownBitlyNativeList` does not exist.');
  }
}

Shortly.toggleToolbarMode = function(flag) {
  var url = {
    js: safari.extension.baseURI + 'toolbarMode.js',
    css: safari.extension.baseURI + 'toolbarTemplate.css',
    jQuery: safari.extension.baseURI + 'jquery-1.6.2.min.js'
  };
  
  if (flag) {
    safari.extension.addContentScriptFromURL(url.jQuery);
    safari.extension.addContentScriptFromURL(url.js);
    safari.extension.addContentStyleSheetFromURL(url.css);
    console.log('Toolbar mode: ON');
  } else {
    safari.extension.removeContentScript(url.jQuery);
    safari.extension.removeContentScript(url.js);
    safari.extension.removeContentStyleSheet(url.css);
  }
};
Shortly.toggleKbHotkey = function(flag) {
  var url = {
    js: safari.extension.baseURI + 'kbHotkey.js'
  };
  
  if (flag) {
    safari.extension.addContentScriptFromURL(url.js);
  } else {
    safari.extension.removeContentScript(url.js);
  }
};
Shortly.toggleContextMenu = function(flag) {
  var url = {
    js: safari.extension.baseURI + 'contextMenu.js'
  };
  
  if (flag) {
    safari.extension.addContentScriptFromURL(url.js);
    safari.application.addEventListener('contextmenu', Shortly.contextMenuEventHandler);
  } else {
    safari.extension.removeContentScript(url.js);
    safari.application.removeEventListener('contextmenu', Shortly.contextMenuEventHandler);
  }
};
Shortly.contextMenuEventHandler = function(event) {
  var menuToResponse = event.userInfo;

  if (menuToResponse != null && menuToResponse.length) {
    for (var i = 0; i < menuToResponse.length; i++) {
      var menu = menuToResponse[i];

      switch(menu.type) {
        case 'link':
          event.contextMenu.appendContextMenuItem('menu_shortenTargetLink', Shortly.getLocaleString('menuItem.shortenTargetLink'), 'shortenTarget_' + i);
          break;
        case 'image':
          event.contextMenu.appendContextMenuItem('menu_shortenTargetImage', Shortly.getLocaleString('menuItem.shortenTargetImage'), 'shortenTarget_' + i);
          break;
        default:
          break;
      }
      console.log('Menu added:', menu.type, i);
    }
  } else {
    var contextMenuItems = event.contextMenu.contextMenuItems;
    
    for (var i = 0; i < contextMenuItems.length; i++) {
      contextMenuItems[i].disabled = true;
    }
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

/* OAuth methods */
Shortly.confirmOAuthLibAvailability = function() {
  if (typeof OAuth === 'undefined') {
    $(document).ready(function() {
      var oauthJsLibElement = document.createElement('script');
        oauthJsLibElement.src = safari.extension.baseURI + 'oauth/jsOAuth-1.3.1.js';
        document.querySelector('body').appendChild(oauthJsLibElement);
    });
  }
};
Shortly.getOAuthFieldNamesForService = function(service) {
  if (service === 'goo.gl') {
    return {
      token: 'googl_oauth_token',
      token_secret: 'googl_oauth_token_secret',
      date: 'googl_oauth_date'
    };
  }
};
Shortly.getStoredOAuthTokensForService = function(service) {
  if (service === 'goo.gl') {
    var token_complete = true,
        token_fields = Shortly.getOAuthFieldNamesForService('goo.gl'),
        tokens = {};
    for (var i in token_fields) {
      tokens[i] = safari.extension.secureSettings.getItem(token_fields[i]) || '';
      if (tokens[i] === '') token_complete = false;
    }
    
    return (token_complete) ? tokens : false;
  }
};
Shortly.removeStoredOAuthTokensForService = function(service) {
  if (service === 'goo.gl') {
    var token_fields = Shortly.getOAuthFieldNamesForService('goo.gl');
    
    for (var i in token_fields) {
      safari.extension.secureSettings.removeItem(token_fields[i]);
    }
  }
  console.log('OAuth tokens for ' + service + ' has been removed.', (new Date()).toLocaleString());
};
Shortly.setupOAuthForService = function(service) {
  if (service === 'goo.gl') {
    var tokens = Shortly.getStoredOAuthTokensForService(service);

    Shortly.confirmOAuthLibAvailability();

    /* Check if tokens completed stored; otherwise reset them */
    if (tokens === false) {
      console.log('Stored goo.gl token broken or not exist.', (new Date()).toLocaleString());
      Shortly.removeStoredOAuthTokensForService(service);
      safari.application.openBrowserWindow().activeTab.url = safari.extension.baseURI + 'oauth/start.html';
    }
  }
  console.log('Starting to setup OAuth with ' + service, (new Date()).toLocaleString());
};
Shortly.saveOAuthTokensToSettings = function(tokenMsg, targetTab) {
  var service = tokenMsg.service, tokens = tokenMsg.tokens;

  if (service === 'goo.gl') {
    var reportTokenLost = function() {
      targetTab.page.dispatchMessage('oauthSaveFail', Shortly.getLocaleString('oauth.tokenLost'));
      console.log('OAuth fail:', Shortly.getLocaleString('oauth.tokenLost'), (new Date()).toLocaleString());
    };

    if (!tokenMsg || !tokens) {
      reportTokenLost();
    } else {
      if(tokens.oauth_token !== null && tokens.oauth_token_secret !== null) {
        safari.extension.secureSettings.setItem('googl_oauth_token', tokens.oauth_token);
        safari.extension.secureSettings.setItem('googl_oauth_token_secret', tokens.oauth_token_secret);
        safari.extension.secureSettings.setItem('googl_oauth_date', (new Date()).getTime());
        
        targetTab.page.dispatchMessage('oauthSaveComplete');
        console.log('OAuth tokens for goo.gl has been saved.', (new Date()).toLocaleString());
      } else {
        reportTokenLost();
      }
    }
  }
};

/* Spin animation helpers */
Shortly.startAnimationForTab = function(targetTab) {
  var toolbarItem = undefined;

  for (var i in safari.extension.toolbarItems) {
    if (safari.extension.toolbarItems[i].browserWindow === targetTab.browserWindow) {
      toolbarItem = safari.extension.toolbarItems[i]
    }
  }

  targetTab.shortlyEnableAnimation = true;
  toolbarItem.validate();
};
Shortly.stopAnimationForTab = function(targetTab) {
  targetTab.shortlyEnableAnimation = false;
};

/* Helpers for reading display method settings */
Shortly.displayMethod = function() {
  return safari.extension.settings.displayMethod;
};

/* Initialize */
Shortly.toggleToolbarMode(Shortly.displayMethod() === 'toolbar' || safari.extension.toolbarItems.length === 0);
if (safari.extension.settings.googleAuth) {
  if (Shortly.getStoredOAuthTokensForService('goo.gl') === false) {
    safari.extension.settings.googleAuth = false;
  } else {
    Shortly.confirmOAuthLibAvailability();
  }
}
Shortly.toggleKbHotkey(safari.extension.settings.enableKbHotkey);
Shortly.toggleContextMenu(safari.extension.settings.enableContextMenu);

safari.application.addEventListener("command", performCommand, false);
safari.application.addEventListener("validate", validateCommand, false);
safari.application.addEventListener("message", respondToMessage, false);
safari.application.addEventListener("menu", menuValidation, false);
safari.extension.settings.addEventListener("change", settingsChanged, false);

/* Check if a newer list of known domain patter, once per day */

(function checkKnownBitlyNativeListUpdate() {
  var checkFrequency = 86400538, // 1 day
      currentTime = (new Date()).getTime(),
      lastCheckTime = safari.extension.settings.getItem('knownBitlyNativeListLastCheck'),
      updateUrl = 'https://raw.github.com/ZZHC/Shortly/develop/knownBitlyNativeList.json';
      
  console.log('## Status of know bitly-native list');
  console.log('- Current time:', (new Date(currentTime)).toString());
  console.log('- Last check time:', (new Date(lastCheckTime)).toString());
      
  if (currentTime - lastCheckTime > checkFrequency) {
    console.log('Checking for bitly-native update…');
    $.getJSON(updateUrl, function(data) {
      if (data.lastUpdate > lastCheckTime) {
        Shortly.updateKnownBitlyNativeListWithArray(data.list);
        console.log('Known Bitly native pattern list updated.', data.list);
      }
      safari.extension.settings.knownBitlyNativeListLastCheck = currentTime;
    });
  }
})();

/* Event Listeners */

function performCommand(event) {
  if (event.command === "shortenURL") {
    var shortly = event.target.browserWindow.activeTab.shortlyInstance;
    
    if (!(shortly instanceof Shortly)) {
      shortly = event.target.browserWindow.activeTab.shortlyInstance = new Shortly(event.target);
    }
    
    if (shortly.flagAbort) shortly.backToWork();
    shortly.markActiveTabAsWorkingState('Shortening');

    if (event.overwriteUrl) {
      shortly.getShortlinkToAddress(event.overwriteUrl, 'skip');
    } else {
      shortly.getShortlinkToCurrentPage();
    }
    
    /* Abort Shortly and report failure
     * if shortening not finished within 60secs. */
    setTimeout(function() {
      var state = shortly.activeTab.shortlyWorkingState;
      
      if (state.match(/Shortening:(\d+)$/)) {
        var errType = (Shortly.isNetworkAvailable()) ? 'timeout' : 'offline';
        shortly.callAbort();
        shortly.reportErrorMessage(errType);
      }
    }, 60000);
    
    /* Ask if injected toolbar ready.
     * When receive confrimation, confirmedInjectedToolbarReady() will mark
     * instance.flagToolbarReady as true.
     *
     * flagToolbarReady should be reset to false again after display.
     */
    if (Shortly.displayMethod() === 'toolbar' || safari.extension.toolbarItems.length === 0) {
      shortly.activeTab.page.dispatchMessage("reportToolbarReady");
    }
  }

  if (event.command.match(/menuOption_/)) {
    var menuCommand = event.command.split('_')[1];

    performMenuCommand(menuCommand);
  }
  
  if (event.command.match(/shortenTarget_/)) {
    var menuInfoIndex = event.command.split('_')[1],
        targetLink = event.userInfo[menuInfoIndex];
    
    /* Construct a fake SafariCommandEvent */
    var commandTriggerer = {
      command: 'shortenURL',
      target: safari.application.activeBrowserWindow,
      overwriteUrl: targetLink.src
    };
    
    for (var i in safari.extension.toolbarItems) {
      var toolbarItem = safari.extension.toolbarItems[i];

      if (toolbarItem.browserWindow = commandTriggerer.target) {
        commandTriggerer.target = toolbarItem;
      } else {
        commandTriggerer.target = safari.application.activeBrowserWindow.activeTab;
      }
    }
    
    performCommand(commandTriggerer);
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

      switch (state.split(':')[0]) {
        case 'Shortening': 
          toolbarItem.disabled = true;
          break;
        case 'Ready':
        default:
          toolbarItem.disabled = false;
          break;
      }
      if (!activeTab.url || activeTab.url.match(/^safari-extension:/)) toolbarItem.disabled = true;
    } else {
      toolbarItem.disabled = !activeTab.url || activeTab.url.match(/^safari-extension:/);
    }

    /* Handling spinnig animation */
    function animationHelper(phase) {
      var monitorTab = safari.application.activeBrowserWindow.activeTab,
          baseURI = safari.extension.baseURI,
          spinSpeed = 85;
      phase = phase || 1;

      if (monitorTab.shortlyEnableAnimation) {
        toolbarItem.image = baseURI + 'spin/' + phase + '.png';
        toolbarItem.shortlyAnimationPlaying = true;

        setTimeout(function() {
          animationHelper((phase % 12) + 1);
        }, spinSpeed);
      } else {
        toolbarItem.image = baseURI + 'toolbarShorten.png';
        toolbarItem.shortlyAnimationPlaying = false;

        console.log('Animation stopped', (new Date()).toLocaleString());
      }
    }
    if (activeTab.shortlyEnableAnimation &&
        !toolbarItem.shortlyAnimationPlaying) {
      animationHelper();
      console.log('Animation started', (new Date()).toLocaleString());
    } else if (!activeTab.shortlyEnableAnimation) {
      Shortly.stopAnimationForTab(activeTab);
    }
  }
}

function settingsChanged(event) {
  if (event.key === "displayMethod") {
    if (event.newValue === 'toolbar') {
      Shortly.toggleToolbarMode(true);
      alert(Shortly.getLocaleString('notice.toolbarMode'));
    } else {
      Shortly.toggleToolbarMode(false);
    }
    if (event.newValue === 'popover') {
      if (!safari.extension.popovers) alert(Shortly.getLocaleString('notice.popoverAvailability'));
    }
  }
  if (event.key === "googleAuth") {
    if (event.newValue) {
      if (!Shortly.getStoredOAuthTokensForService('goo.gl')) {
        console.log(event.newValue, safari.extension.settings.googleAuth);
        Shortly.setupOAuthForService('goo.gl');
      }
      if (typeof OAuth !== 'object') {
        Shortly.confirmOAuthLibAvailability();
      }
    }
  }
  if (event.key === "clearOAuth") {
    if (event.newValue) {
      Shortly.removeStoredOAuthTokensForService('goo.gl');
      safari.extension.settings.googleAuth = false;
      safari.extension.settings.clearOAuth = false;

      console.log('User called to reset OAuth tokens', (new Date()).toLocaleString());
      alert(Shortly.getLocaleString('oauth.reset'));
    }
  }

  if (event.key === "enableKbHotkey") {
    Shortly.toggleKbHotkey(event.newValue);
    if (event.newValue) alert(Shortly.getLocaleString('notice.hotkey'));
  }

  if (event.key.match(/^kbHotkey(\w+)$/)) {
    var newSetting = {
      key: event.key.match(/^kbHotkey(\w+)$/)[1],
      value: event.newValue
    }

    /* Validate hotkey as a single capitalized character */
    if (event.key === 'kbHotkeyChar') {
      if (event.newValue.length > 1) {
        safari.extension.settings.setItem(event.key, event.newValue.charAt(0).toUpperCase());
        return false;
      }
      if (event.newValue !== event.newValue.toUpperCase()) {
        safari.extension.settings.setItem(event.key, event.newValue.toUpperCase());
        return false;
      }
    }

    /* To decapitalize the key */
    newSetting.key = newSetting.key.charAt(0).toLowerCase() + newSetting.key.slice(1);

    /* Deliver hotkey change to every opened tab */
    for (var i in safari.application.browserWindows) {
      var targetWindow = safari.application.browserWindows[i];
      for (var j in targetWindow.tabs) {
        targetWindow.tabs[j].page.dispatchMessage('updateHotkeySettings', newSetting);
      }
    }
    
    console.log('Shortly hotkey settings updated', newSetting.key, newSetting.value, (new Date()).toLocaleString());
  }
  
  if (event.key === "enableContextMenu") {
    Shortly.toggleContextMenu(event.newValue);
  }
}

/* Communications with injected script */

function respondToMessage(messageEvent) {
  if (messageEvent.name === "foundRelShortlink") {
    messageEvent.target.shortlyInstance.receiveNativeRelShortlink(messageEvent.message);
  }
  if (messageEvent.name === "toolbarReady") {
    messageEvent.target.shortlyInstance.confirmedInjectedToolbarReady();
  }
  if (messageEvent.name === "oauthComplete") {
    Shortly.saveOAuthTokensToSettings(messageEvent.message, messageEvent.target);
  }
  if (messageEvent.name === "oauthFail") {
    console.log('OAuth fail', messageEvent.message, (new Date()).toLocaleString());
  }
  
  if (messageEvent.name === "readHotkeySettings") {
    var hotkeySettings = {
      char: safari.extension.settings.kbHotkeyChar,
      metaKey: safari.extension.settings.kbHotkeyMetaKey,
      altKey: safari.extension.settings.kbHotkeyAltKey,
      ctrlKey: safari.extension.settings.kbHotkeyCtrlKey,
      shiftKey: safari.extension.settings.kbHotkeyShiftKey,
    };

    messageEvent.target.page.dispatchMessage('hotkeySettings', hotkeySettings);
  }
  
  if (messageEvent.name === 'hotkeyCaptured') {
    /* Construct a fake SafariCommandEvent */
    var commandTriggerer = {
      command: 'shortenURL',
      target: undefined
    };
    
    for (var i in safari.extension.toolbarItems) {
      var toolbarItem = safari.extension.toolbarItems[i];

      if (toolbarItem.disabled) return false;
      if (toolbarItem.browserWindow = messageEvent.target.browserWindow) {
        commandTriggerer.target = toolbarItem;
      }
    }
    
    /* Pass the active SafariBrowserTab as target if there's no toolbar item. */
    if (commandTriggerer.target === undefined) commandTriggerer.target = messageEvent.target;
    
    performCommand(commandTriggerer);
  }

  if (messageEvent.name === 'getLocaleString') {
    var message = {
      string: Shortly.getLocaleString(messageEvent.message.string),
      target: messageEvent.message.target
    };
    messageEvent.target.page.dispatchMessage('setLocaleString', message);
  }
}

function menuValidation(event) {
  if (event.target.identifier === 'menuQuickOption') {
    /* Validate quick option menu */
    var menuItems = event.target.menuItems,
        serviceMenuItemId = '';
    
    switch (safari.extension.settings.shortenService) {
      case 'goo.gl':
        serviceMenuItemId = 'menuItemGoogle';
        break;
      case 'bit.ly':
        serviceMenuItemId = 'menuItemBitly';
        break;
      case 'tinyurl':
        serviceMenuItemId = 'menuItemTinyurl';
        break;
      case 'endpoint':
        serviceMenuItemId = 'menuItemEndpoint';
        break;
      default:
        break;
    }
    
    for (var i in menuItems) {
      /* Set localed lable */
      if (menuItems[i].identifier != null) {
        var localeQuery = menuItems[i].identifier.replace(/(^menuItem)(\w+$)/, '$1.$2');
        menuItems[i].title = Shortly.getLocaleString(localeQuery);
      }

      /* Set correc checked state */
      if (menuItems[i].identifier === serviceMenuItemId) {
        menuItems[i].checkedState = menuItems[i].CHECKED;
      } else {
        menuItems[i].checkedState = menuItems[i].UNCHECKED;
      }
      
      if (menuItems[i].identifier === 'menuItemIgnoreNative') {
        menuItems[i].checkedState = safari.extension.settings.ignoreNative;
      }
    }
  }
}

function performMenuCommand(menuCommand) {
  switch (menuCommand) {
    case 'selectGoogle':
      safari.extension.settings.shortenService = 'goo.gl';
      break;
    case 'selectBitly':
      safari.extension.settings.shortenService = 'bit.ly';
      break;
    case 'selectTinyURL':
      safari.extension.settings.shortenService = 'tinyurl';
      break;
    case 'selectEndpoint':
      safari.extension.settings.shortenService = 'endpoint';
      break;
    case 'ignoreNative':
      safari.extension.settings.ignoreNative = !safari.extension.settings.ignoreNative;
      break;
    default:
      break;
  }
}