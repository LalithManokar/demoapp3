/* **************************************************************************** */
/* init libraries */
var _sLibPathPrefix = "/sap/ino/ngui/build/resources/";
if (window.less && window.less.env === "development") {
    _sLibPathPrefix = "/sap/ino/ngui/";
    
	jQuery.sap.registerModulePath("sap.ino.vc", _sLibPathPrefix + "sap/ino/vc");
	jQuery.sap.registerModulePath("sap.ino.commons", _sLibPathPrefix + "sap/ino/commons");
	jQuery.sap.registerModulePath("sap.ino.controls", _sLibPathPrefix + "sap/ino/controls");
	
	jQuery.sap.registerResourcePath("sap.ino.vc", _sLibPathPrefix + "sap/ino/vc");
	jQuery.sap.registerResourcePath("sap.ino.commons", _sLibPathPrefix + "sap/ino/commons");
	jQuery.sap.registerResourcePath("sap.ino.controls", _sLibPathPrefix + "sap/ino/controls");
	
	sap.ui.getCore().loadLibrary("sap.ino.vc");
	sap.ui.getCore().loadLibrary("sap.ino.commons");
	sap.ui.getCore().loadLibrary("sap.ino.controls");
}
jQuery.sap.registerModulePath("sap.ino.fonts", _sLibPathPrefix + "sap/ino/fonts");
jQuery.sap.registerModulePath("sap.ino.thirdparty", _sLibPathPrefix + "sap/ino/thirdparty");
jQuery.sap.registerModulePath("sap.ino.wall", _sLibPathPrefix + "sap/ino/wall");

jQuery.sap.registerResourcePath("sap.ino.fonts", _sLibPathPrefix + "sap/ino/fonts");
jQuery.sap.registerResourcePath("sap.ino.thirdparty", _sLibPathPrefix + "sap/ino/thirdparty");
jQuery.sap.registerResourcePath("sap.ino.wall", _sLibPathPrefix + "sap/ino/wall");

/* **************************************************************************** */

sap.ui.define([
    "sap/ino/commons/application/BaseComponent",
    "sap/ino/controls/GenericStyle"
], function (BaseComponent, GenericStyle /* needs to be required */) {
    "use strict";
    
    return BaseComponent.extend("sap.ino.apps.ino.Component", {
        metadata : {
            manifest: "json"
        }
    });
});