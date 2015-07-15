var Helpers = {
  isKnownBitlyNative(longUrl) {
    var domainMatch = longUrl.match(/:\/\/([^\/]+)\//),
        domain = domainMatch[1],
        checklist = JSON.parse(safari.extension.settings.knownBitlyNativeList),
        checkRegExp, i = 0;

    for (i in checklist) {
      checkRegExp = new RegExp(checklist[i]);
      if (checkRegExp.test(domain)) {
        return true;
      }
    }
    return false;
  }
};

export default Helpers
