/*
 * queryPath = 'btnShorten.label'
 * lang = 'en-US'
 */

import LOCALE_LIB from '../locale'

class I18n {
  static t(queryPath, lang=navigator.language) {
    var localeObj = LOCALE_LIB, result = '',
        pathArray = queryPath.split('.'),
        i = 0;

    // Map different results from navigator.language for Safari 9+
    lang.replace(/zh-hant/, 'zh-tw');
    lang.replace(/zh-hans/, 'zh-cn');

    for (i in pathArray) {
      if (!(localeObj = localeObj[pathArray[i]])) return false
    }

    if (result = localeObj[lang]) {
      return result;
    } else {
      return localeObj['default']
    }
  }
}

export default I18n
