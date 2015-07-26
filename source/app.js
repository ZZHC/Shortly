/*
 * Shortly Safari Extension
 * Version 3.0
 * By Zhusee (ZZHC)
 *
 * Visit: http://zzhc.org/shortly
 * GitHub: http://github.com/ZZHC/Shortly
 *
 */

import Shortly from './shortly'
import WelcomePage from './ui/welcome-page'

window.shortly = new Shortly();

WelcomePage.showIfFirstTime();

safari.application.addEventListener('command', shortly._performCommand, false);
safari.application.addEventListener('validate', shortly._validateCommand, false);
safari.extension.settings.addEventListener('change', shortly._settingsChanged, false);

shortly._bitlyNativeMatcher.checkUpdate();
