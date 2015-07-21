class OAuth {
  static init() {
    this.storageKey = 'OAuthCredentials';
  }

  static getStoredCredentials() {
    var credentials = safari.extension.secureSettings[this.storageKey];
    if (credentials) return JSON.parse(credentials);
  }

  static saveCredentials(credentialObj, options={last_update: undefined}) {
    credentialObj.last_update = options.last_update || Date.now();
    safari.extension.secureSettings[this.storageKey] = JSON.stringify(credentialObj);
    return credentialObj;
  }

  static clearStoredCredentials() {
    safari.extension.secureSettings.removeItem(this.storageKey);
  }

  authorize() {
    return this.requestAuthCode()
      .then( authCode => this.exchangeAuthCodeForToken(authCode) )
      .then( credentials => this.saveCredentials(credentials, {last_update: Date.now()}) );
  }

  requestAuthCode() {
    return Promise.reject('You have to implement requestAuthCode() method in your inherited class.')
  }

  exchangeAuthCodeForToken(authCode) {
    return Promise.reject('You have to implement exchangeAuthCodeForToken(authCode) method in your inherited class.')
  }
}

export default OAuth
