import BASE_LOCALE from './locale/base'
import WELCOME_PAGE_LOCALE from './locale/welcome-page'

var localeLibrary = BASE_LOCALE;
localeLibrary.welcome = WELCOME_PAGE_LOCALE.welcome

export default localeLibrary
