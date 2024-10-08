/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/base/Log'],function(L){"use strict";var D="sap_fiori_3";var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=/^([a-zA-Z0-9_]*)(_(hcb|hcw|dark))$/g;var k=["sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_bluecrystal","sap_hcb"];var t={};var T={};T.validateAndFallbackTheme=function(s,a){var n;if(s){if(a==null&&t[s]){return t[s];}n=s;if(a==null&&s.startsWith("sap_")&&k.indexOf(s)==-1){var b=r.exec(s)||[];var v=b[2];if(v){n=D+v;}else{n=D;}t[s]=n;L.warning("The configured theme '"+s+"' is not yet or no longer supported in this version. "+"The valid fallback theme is '"+n+"'.","Theming");}}return n;};T.getDefaultThemeInfo=function(){return{DEFAULT_THEME:D,DARK_MODE:d};};return T;});
