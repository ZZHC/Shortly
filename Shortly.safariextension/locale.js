const shortlyLocaleLib = {
  btnShorten: {
    label: {
      'zh-tw': '縮短網址',
      'zh-cn': '缩短地址',
      'ja-jp': 'アドレスを短縮',
      'it-it': 'Accorcia',
      'fr-fr': 'Raccourcir',
      'default': 'Shorten'
    },
    paletteLabel: {
      'zh-tw': '縮短網址',
      'zh-cn': '缩短地址',
      'ja-jp': 'アドレスを短縮',
      'it-it': 'Accorcia',
      'fr-fr': 'Raccourcir',
      'default': 'Shorten'
    },
    toolTip: {
      'zh-tw': '縮短目前網頁的網址',
      'zh-cn': '缩短当前页面的地址',
      'ja-jp': '現在のページのアドレスを短縮します',
      'it-it': 'Ottieni un indirizzo breve della pagina corrente',
      'fr-fr': "Obtenir l'adresse raccourcie de la page active",
      'default': 'Get shortened address of the current page'
    }
  },
  notice: {
    toolbarMode: {
      'zh-tw': '您必須重新載入已開啟的網頁才能啟用工具列。',
      'zh-cn': '您必须重新载入已开启的页面才能启用工具列。',
      'ja-jp': 'You need to reload opened pages to enable the toolbar.',
      'it-it': 'Devi ricaricare le pagine aperte per far funzionare il pannello.',
      'fr-fr': "Vous devez recharger les pages actives afin que la barre d'outil fonctionne.",
      'default': 'You have to reload opened pages to enable the toolbar.'
    },
    hotkey: {
      'zh-tw': '您必須重新載入已開啟的網頁才能啟用快捷鍵。',
      'default': 'You have to reload opened pages to enable hotkey.'
    },
    popoverAvailability: {
      'zh-tw': '彈出式視窗 (Popover) 需要 Safari 5.1 以上版本才能使用。',
      'default': 'Popover is only available in Safari 5.1 or higher version.'
    },
    popoverTips: {
      'zh-tw': '請按 <kbd>&#8984;-C</kbd> 複製短網址。</small>',
      'ja-jp': '<kbd>&#8984;-C</kbd>でアドレスをコピー',
      'default': 'Press <kbd>&#8984;-C</kbd> to copy.</small>'
    }
  },
  errorMessage: {
    offline: {
      'zh-tw': '服務暫時無法使用，或是您的電腦並沒有連接 Internet。',
      'zh-cn': '服务暂时无法使用，或是您的电脑没有连接在互联网上。',
      'ja-jp': 'お使いのコンピュータはインターネットに接続していません。',
      'it-it': 'Servizio non disponibile, oppure il tuo computer non è connesso a Internet.',
      'fr-fr': "Service indisponible, ou votre ordinateur n'est pas connecté à Internet.",
      'default': 'Service unavaiable, or your computer isn’t connected to the Internet.'
    },
    invalidResponse: {
      'zh-tw': '縮址時發生錯誤：收到不正確的回應。',
      'zh-cn': '缩短地址时发生错误：收到不正确的回应。',
      'ja-jp': 'Error while shortening: Invalid server response.',
      'it-it': "Errore nell'accorciare l'indirizzo: risposta del server invalida.",
      'fr-fr': "Erreur lors du raccourcissement: Réponse invalide du serveur.",
      'default': 'Error while shortening: Invalid server response.'
    },
    generalError: {
      'zh-tw': '服務暫時無法使用：',
      'zh-cn': '服务暂时无法使用：',
      'ja-jp': 'Service unavailable: ',
      'it-it': 'Servizio non disponibile: ',
      'fr-fr': 'Service indisponible: ',
      'default': 'Service unavailable: '
    },
    timeout: {
      'zh-tw': 'Shortly 失去回應。請檢查您的 Internet 設定，或是稍後再試一次。',
      'zh-cn': 'Shortly 失去响应。请检查您的 Internet 设置，或是稍后再试一次。',
      'it-it': 'Shortly non risponde. Per favore controlla le tue impostazioni di Internet oppure prova ancora più tardi.',
      'fr-fr': 'Shortly ne répond pas. Veuillez vérifier votre connexion à Internet ou réessayer plus tard.',
      'default': 'Shortly has failed to response. Please check your Internet settings or try again later.'
    },
    authFail: {
      'zh-tw': '無法登入您的帳戶。請檢查您的登入資訊後再試一次。',
      'zh-cn': '无法登录您的账户。请检查您的登录信息后再试一次。',
      'it-it': 'Impossibile connettersi al tuo account. Per favore controlla le tue credenziali e prova di nuovo.',
      'fr-fr': 'Connexion impossible à votre compte. Veuillez vérifier vos informations puis réessayer.',
      'default': 'Unable to login your account. Please check your login info and try again.'
    },
    badEndpoint: {
      'zh-tw': '自定接點的網址格式錯誤。請檢查您的設定後再試一次。',
      'zh-cn': '自定接点的地址格式错误。请检查您的设置后再试一次。',
      'it-it': 'URL finale invalido. Per favore controlla le tue impostazioni e prova di nuovo.',
      'fr-fr': 'URL invalide. Vérfiez vos préférences et réessayez.',
      'default': 'Invalid endpoint URL pattern. Please check your settings and try again.'
    },
    unknown: {
      'zh-tw': '發生不明的錯誤。',
      'zh-cn': '发生未知的错误。',
      'it-it': 'Errore non conosciuto.',
      'fr-fr': 'Erreur inconnue',
      'default': 'Unknown error occurs.'
    },
  },
  oauth: {
    tokenLost: {
      'zh-tw': 'OAuth 資訊在儲存的過程中遺失了。',
      'zh-cn': 'OAuth 信息在存储的过程中丢失。',
      'it-it': 'Il token di OAuth si è perso mentre veniva salvato nelle impostazioni.',
      'fr-fr': 'Les informations OAuth ont été perdues lors de l\'enregistrement des préférences',
      'default': 'OAuth tokens lost when saving to settings.'
    },
    offline: {
      'zh-tw': 'Shorly 無法為您設定 Google 的 OAuth 登入。請檢查您的 Internet 設定並再試一次。',
      'zh-cn': 'Shorly 无法为您设定 Google 的 OAuth 登录。请检查您的 Internet 设置并再试一次。',
      'it-it': 'Shortly ha fallito nel settare il login di Oauth con Google. Per favore controlla le tue impostazioni di Internet e prova ancora più tardi.',
      'fr-fr': 'Shortly n\'a pas pu enregistrer vos informations OAuth avec Google. Veuillez vérifier votre connexion à Internet ou réessayer plus tard.',
      'default': 'Shortly has failed to setup OAuth login with Google for you. Please check your Internet settings and try again later.'
    },
    reset: {
      'zh-tw': 'OAuth 重設成功。\n\n請重新開啟您的「偏好設定」視窗，以正確反映變更。',
      'zh-cn': 'OAuth 重置成功。\n\n请重新打开您的「偏好设置」窗口，以正确显示更改。',
      'it-it': 'Il reset di OAuth è andato a buon fine.\n\nPer favore riapri la finestra delle preferenze per visualizzare i cambiamenti.',
      'fr-fr': 'OAuth a été réinitialisé.\n\nVeuillez réouvrir la fenêtre des préférences pour afficher les changements.',
      'default': 'OAuth reset successfully.\n\nPlease reopen your preference window to reflect changes.'
    },
    finishPage: {
      processing: {
        message: {
          'zh-tw': 'Shortly 正在處理您的 OAuth 登入資訊，請放輕鬆稍等片刻...',
          'default': 'Shorly is processing your OAuth login info, please hold on and relax...'
        }
      },
      success: {
        title: {
          'zh-tw': '恭喜！',
          'default': 'Congratulations!'
        },
        message: {
          'zh-tw': '您已經成功的以 OAuth 登入 Google；Shortly 現在開始可以使用您的 Google 帳戶來縮短 goo.gl 網址，並在您的帳戶中留下記錄了。',
          'default': "You've finished the OAuth process with Google, and Shortly can now shorten links on behalf of you. All links you shorten from now on will leave a history log on your Google Account."
        },
        moreInfo: {
          'zh-tw': '欲了解更多資訊，請參考：',
          'default': 'For more information, please visit:'
        },
        linkAPI: {
          'default': 'Google URL Shortener API'
        },
        linkRepo: {
          'zh-tw': 'GitHub 上的 Shortly 專案',
          'default': 'Shortly project on GitHub'
        },
        linkWebsite: {
          'zh-tw': 'Shortly 網站',
          'default': 'Shortly Website'
        }
      },
      failure: {
        title: {
          'zh-tw': 'OAuth 設定失敗',
          'default': 'OAuth configuration failed'
        },
        errorTitle: {
          'zh-tw': '錯誤：',
          'zh-cn': '错误:',
          'it-it': 'Errore:',
          'default': 'Error:'
        }
      }
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
      'default': 'Custom Endpoint'
    },
    IgnoreNative: {
      'zh-tw': '忽略官方縮址',
      'zh-cn': '忽略原生短地址',
      'default': 'Ignore Native'
    },
    shortenTargetLink: {
      'zh-tw': '縮短連結',
      'zh-cn': '缩短链接',
      'ja-jp': 'リンクを短縮',
      'default': 'Shorten Link'
    },
    shortenTargetImage: {
      'zh-tw': '縮短影像網址',
      'zh-cn': '缩短图像地址',
      'ja-jp': 'イメージのアドレスを短縮',
      'default': 'Shorten Image Address'
    }
  }
}