var toolbarLocale = {
  "zh-tw": {
    hideBar: "關閉Shortly工具列"
  },
  "zh-cn": {
    hideBar: "关闭Shortly工具列"
  },
  "ja-jp": {
    hideBar: "Shortlyツールバーを閉じる"
  },
  "it-it": {
    hideBar: "Chiudi il pannello"
  },
  "fr-fr": {
    hideBar: "Fermer la barre de raccourcissement"
  },
  "default": {
    hideBar: "Close Shortly toolbar"
  }
};

/*
<div id="-shortly-toolbar">
  <a class="hideBar glymp" href="#" title="Close Shortly toolbar">&times;</a>
  <input id="ipbShortUrl" type="text" value="http://goo.gl/xdGC" />
  <p id="txtPageTitle">Page title here</p>
  <a class="hideBar button" href="#" title="Close Shortly toolbar">Close</a>
</div>
*/

var toolbarTemplate = $('<div>')
  .attr('id', '-shortly-toolbar')
  .append('<a class="hideBar glymp" href="#" title="Close Shortly toolbar">&times;</a>')
  .append('<input id="ipbShortUrl" type="text" value="" />')
  .append('<p id="txtPageTitle"></p>')
  .append('<a id="copyLink"><Copy</a>');

function initializeToolbar(message) {
  var lang = navigator.language.toLowerCase();
  
  if(typeof toolbarLocale[lang] === 'undefined') {
    lang = 'default';
  }
  
  $(toolbarTemplate)
    .toggleClass('error', (message.type == 'error'))
    .appendTo('body');
  
  $('#-shortly-toolbar a.hideBar')
    .attr('title', toolbarLocale[lang].hideBar)
    .click(function(event) {
      $('#-shortly-toolbar').removeClass('activated');
      setTimeout(function() {
        $('#-shortly-toolbar').remove();
      }, 1000);
      event.preventDefault();
    });
    
  $('#-shortly-toolbar a.copyLink').click(function() {
    var shortlink = $('input#ipbShortUrl').value;
    alert(shortlink);
    shortlink.execCommand("Copy");
  });
    
  $('#-shortly-toolbar input#ipbShortUrl').attr('value', message.message);
  $('#-shortly-toolbar p#txtPageTitle').text((message.type === 'error') ? message.message : (document.title || location.href));
  
  setTimeout(function() {
    $('#-shortly-toolbar input#ipbShortUrl')
      .select()
      .keyup(function(event) {
        if(event.which === 27) {
          $('#-shortly-toolbar a.hideBar').click();
        }
      });
    $('#-shortly-toolbar').one('webkitTransitionEnd', function() {
        $(this).find('input#ipbShortUrl').focus();
    });
    $('#-shortly-toolbar').addClass('activated');
  }, 100);
}

function responseToRequest(request) {
  if(self === top) {
    /* Prevent children from getting message */
    
    if(request.name === "displayToolbar") {
      initializeToolbar(request.message);
    }
    if(request.name === "reportToolbarReady") {
      /* To see if DOM injection is possible */
      if ($('<div>').appendTo('body').remove().length) {
        safari.self.tab.dispatchMessage("toolbarReady");
      }
    }
  }
}

safari.self.addEventListener("message", responseToRequest, false);