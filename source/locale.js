const LocaleLib = {
  toolbarBtn: {
    label: {
      'default': 'Shorten',
      'zh-tw': '縮短網址',
      'zh-cn': '缩短地址',
      'ja-jp': 'アドレスを短縮',
      'it-it': 'Accorcia',
      'fr-fr': 'Raccourcir'
    },
    paletteLabel: {
      'default': 'Shorten',
      'zh-tw': '縮短網址',
      'zh-cn': '缩短地址',
      'ja-jp': 'アドレスを短縮',
      'it-it': 'Accorcia',
      'fr-fr': 'Raccourcir'
    },
    tooltip: {
      'default': 'Get the shortlink for current page',
      'zh-tw': '縮短目前網頁的網址',
      'zh-cn': '缩短当前页面的地址',
      'ja-jp': '現在のページのアドレスを短縮します',
      'it-it': 'Ottieni un indirizzo breve della pagina corrente',
      'fr-fr': "Obtenir l'adresse raccourcie de la page active",
    }
  },
  menuItem: {
    Google: {
      'default': 'goo.gl'
    },
    Bitly: {
      'default': 'bit.ly'
    },
    Tinyurl: {
      'default': 'TinyURL'
    },
    Endpoint: {
      'zh-tw': '自定服務接點',
      'zh-cn': '自定义服务接口',
      'default': 'Custom Endpoint'
    },
    IgnoreNative: {
      'zh-tw': '忽略官方短網址',
      'zh-cn': '忽略原生短地址',
      'default': 'Ignore Native'
    },
    ShortenUrl: {
      'zh-tw': '縮短網址⋯',
      'zh-cn': '缩短地址⋯',
      'ja-jp': 'アドレスを短縮⋯',
      'default': 'Shorten Address…'
    }
  },
  contextMenuItem: {
    ShortenLink: {
      'zh-tw': '縮短連結',
      'zh-cn': '缩短链接',
      'ja-jp': 'リンクを短縮',
      'default': 'Shorten Link'
    },
    ShortenImage: {
      'zh-tw': '縮短影像網址',
      'zh-cn': '缩短图像地址',
      'ja-jp': 'イメージのアドレスを短縮',
      'default': 'Shorten Image Address'
    }
  },
  notice: {
    hotkey: {
      'zh-tw': '您必須重新載入已開啟的網頁才能啟用快捷鍵。',
      'zh-cn': '您必须重新载入已开启的网页才能启用快捷键。',
      'default': 'You have to reload opened pages to enable hotkey.'
    },
    popoverTip: {
      'zh-tw': '請按 <kbd>&#8984;-C</kbd> 複製短網址。</small>',
      'zh-cn': '请按 <kbd>&#8984;-C</kbd> 复制短地址。</small>',
      'ja-jp': '<kbd>&#8984;-C</kbd>でアドレスをコピー',
      'default': 'Press <kbd>&#8984;-C</kbd> to copy.</small>'
    },
    shortenInputPrompt: {
      'zh-tw': '請在下方輸入您想縮短的完整網址：',
      'zh-cn': '请在下方输入您想缩短的完整地址：',
      'default': 'Please enter the long URL you want to shorten below:'
    }
  },
  error: {
    offline: {
      'default': 'Service unavaiable, or your computer isn’t connected to the Internet.',
      'zh-tw': '服務暫時無法使用，或是您的電腦並沒有連接 Internet。',
      'zh-cn': '服务暂时无法使用，或是您的电脑没有连接在互联网上。',
      'ja-jp': 'お使いのコンピュータはインターネットに接続していません。',
      'it-it': 'Servizio non disponibile, oppure il tuo computer non è connesso a Internet.',
      'fr-fr': "Service indisponible, ou votre ordinateur n'est pas connecté à Internet."
    },
    badEndpoint: {
      'default': 'Invalid endpoint URL pattern. Please check your settings and try again.',
      'zh-tw': '自定接點的網址格式錯誤。請檢查您的設定後再試一次。',
      'zh-cn': '自定接点的地址格式错误。请检查您的设置后再试一次。',
      'it-it': 'URL finale invalido. Per favore controlla le tue impostazioni e prova di nuovo.',
      'fr-fr': 'URL invalide. Vérfiez vos préférences et réessayez.'
    },
    invalidResponse: {
      'default': 'Error while shortening: Invalid server response.',
      'zh-tw': '縮短網址時發生錯誤：收到不正確的回應。',
      'zh-cn': '缩短地址时发生错误：收到不正确的回应。',
      'ja-jp': 'Error while shortening: Invalid server response.',
      'it-it': "Errore nell'accorciare l'indirizzo: risposta del server invalida.",
      'fr-fr': "Erreur lors du raccourcissement: Réponse invalide du serveur."
    },
  }
}

export default LocaleLib
