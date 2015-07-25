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

window.shortly = new Shortly();

safari.application.addEventListener('command', shortly._performCommand, false);
safari.application.addEventListener('validate', shortly._validateCommand, false);
safari.extension.settings.addEventListener('change', shortly._settingsChanged, false);

shortly._bitlyNativeMatcher.checkUpdate();
