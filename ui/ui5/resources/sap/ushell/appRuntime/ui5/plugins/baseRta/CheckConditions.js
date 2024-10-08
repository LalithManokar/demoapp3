/*!
 * Copyright (c) 2009-2017 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/base/util/UriParameters","sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils"],function(U,A){"use strict";var C={_getAppDescriptor:function(c){if(c&&c.getMetadata){var o=c.getMetadata();if(o&&o.getManifest){return o.getManifest();}}return{};},checkRestartRTA:function(l){var u=new U(window.location.href);var s=u.get("sap-ui-layer");l=s||l;var r=!!window.sessionStorage.getItem("sap.ui.rta.restart."+l);if(r){window.sessionStorage.removeItem("sap.ui.rta.restart."+l);}return r;},checkFlexEnabledOnStart:function(){var c=A.getCurrentRunningApplication(),r=c.componentInstance,a=this._getAppDescriptor(r),f=a["sap.ui5"]&&a["sap.ui5"].flexEnabled;return f!==false;},checkUI5App:function(){var c=A.getCurrentRunningApplication();var i=c&&c.applicationType==="UI5";return i;}};return C;},true);
