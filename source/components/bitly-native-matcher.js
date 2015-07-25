const THREE_DAYS_MS = 1000 * 60 * 60 * 24 * 3;
const UPDATE_URL = 'https://github.com/ZZHC/Shortly/raw/master/knownBitlyNativeList.json';

class BitlyNativeMatcher {
  matchUrl(longUrl) {
    var domainMatch = longUrl.match(/:\/\/([^\/]+)\//),
        domain = domainMatch[1],
        checklist = JSON.parse(safari.extension.settings.knownBitlyNativeList) || [],
        checkRegExp, i = 0;

    for (i in checklist) {
      checkRegExp = new RegExp(checklist[i]);
      if (checkRegExp.test(domain)) {
        return true;
      }
    }
    return false;
  }

  checkUpdate() {
    var currentTime = Date.now(),
        lastCheckTime = safari.extension.settings.knownBitlyNativeLastCheck,
        timeDiff = currentTime - lastCheckTime;

    if (timeDiff < THREE_DAYS_MS) return false;

    fetch(UPDATE_URL)
      .then( response => response.json() )
      .then( result => {
        if (result.lastUpdate > lastCheckTime) {
          this.updateWithArray(result.list);
        }
      })

    // Update last check timestamp
    safari.extension.settings.knownBitlyNativeLastCheck = currentTime;
  }

  updateWithArray(listArray) {
    safari.extension.settings.knownBitlyNativeList = JSON.stringify(listArray);
  }
}

export default BitlyNativeMatcher
