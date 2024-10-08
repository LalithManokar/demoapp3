//@ui5-bundle sap/ndc/library-h2-preload.js
/*!
 * SAPUI5
 * (c) Copyright 2009-2022 SAP SE. All rights reserved.
 */
sap.ui.predefine('sap/ndc/library',['sap/m/library','sap/ui/core/library'],function(l,a){"use strict";sap.ui.getCore().initLibrary({name:"sap.ndc",dependencies:["sap.ui.core","sap.m"],types:[],interfaces:[],controls:["sap.ndc.BarcodeScannerButton"],elements:[],noLibraryCSS:true,version:"1.71.61"});return sap.ndc;});
sap.ui.require.preload({
	"sap/ndc/manifest.json":'{"_version":"1.9.0","sap.app":{"id":"sap.ndc","type":"library","embeds":[],"applicationVersion":{"version":"1.71.61"},"title":"SAPUI5 library with controls with native device capabilities.","description":"SAPUI5 library with controls with native device capabilities.","ach":"MOB-SDK-UI5","resources":"resources.json","offline":true,"openSourceComponents":[{"name":"zxing-cpp/zxing-cpp","packagedWithMySelf":true,"version":"2.1.0"}]},"sap.ui":{"technology":"UI5","supportedThemes":[]},"sap.ui5":{"dependencies":{"minUI5Version":"1.71","libs":{"sap.ui.core":{"minVersion":"1.71.61"},"sap.m":{"minVersion":"1.71.61"}}},"library":{"i18n":"messagebundle.properties","css":false,"content":{"controls":["sap.ndc.BarcodeScannerButton"],"elements":[],"types":[],"interfaces":[]}}}}'
},"sap/ndc/library-h2-preload"
);
sap.ui.loader.config({depCacheUI5:{
"sap/ndc/BarcodeScanner.js":["sap/base/Log.js","sap/base/util/deepClone.js","sap/m/BusyDialog.js","sap/m/Button.js","sap/m/Dialog.js","sap/m/Input.js","sap/m/Label.js","sap/m/MessageToast.js","sap/m/library.js","sap/ndc/BarcodeScannerUIContainer.js","sap/ui/Device.js","sap/ui/base/Event.js","sap/ui/base/EventProvider.js","sap/ui/dom/includeStylesheet.js","sap/ui/model/BindingMode.js","sap/ui/model/json/JSONModel.js","sap/ui/model/resource/ResourceModel.js","sap/ui/thirdparty/jquery.js"],
"sap/ndc/BarcodeScannerButton.js":["sap/m/Button.js","sap/ndc/BarcodeScanner.js","sap/ndc/BarcodeScannerButtonRenderer.js","sap/ndc/library.js","sap/ui/core/Control.js","sap/ui/model/resource/ResourceModel.js"],
"sap/ndc/BarcodeScannerUIContainer.js":["sap/ui/core/Control.js"],
"sap/ndc/library.js":["sap/m/library.js","sap/ui/core/library.js"]
}});
//# sourceMappingURL=library-h2-preload.js.map