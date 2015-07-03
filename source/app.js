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

var shortly = new Shortly();

safari.application.addEventListener('command',  shortly._performCommand, false);
