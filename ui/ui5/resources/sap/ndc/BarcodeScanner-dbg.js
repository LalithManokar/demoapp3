/*!
 * SAPUI5
 * (c) Copyright 2009-2022 SAP SE. All rights reserved.
 */

/*global cordova, EB, ImageCapture */

// configure shim for zxingcpp library to allow AMD-like import
sap.ui.loader.config({
	shim: {
		'sap/ndc/thirdparty/zxingcpp/zxing_reader': {
			amd: true,
			exports: 'ZXing'
		}
	}
});

sap.ui.define([
		"sap/base/Log",
		'sap/ui/model/json/JSONModel',
		"sap/ui/model/BindingMode",
		'sap/ui/model/resource/ResourceModel',
		'sap/m/Input',
		'sap/m/Label',
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/BusyDialog',
		"sap/ui/dom/includeStylesheet",
		"./BarcodeScannerUIContainer",
		"sap/m/MessageToast",
		'sap/m/library',
		"sap/ui/base/Event",
		"sap/ui/base/EventProvider",
		'sap/ui/Device',
		"sap/ui/thirdparty/jquery",
		"sap/base/util/deepClone"
	],
	function(Log, JSONModel, BindingMode, ResourceModel, Input, Label, Button, Dialog, BusyDialog, includeStylesheet, BarcodeScannerUIContainer, MessageToast, mobileLibrary, Event, EventProvider, Device, jQuery, deepClone) {
	"use strict";

	document.addEventListener("settingsDone", init);
	document.addEventListener("SettingCompleted", init);
	document.addEventListener("mockSettingsDone", init);

	includeStylesheet({
		url: sap.ui.require.toUrl("sap/ndc/css/sapNdcBarcodeScanner.css")
	});

	/**
	 * @class
	 *
	 * Please refer to <a target="_blank" rel="noopener,noreferrer" href="https://launchpad.support.sap.com/#/notes/2402585">SAP Note 2402585</a> for information on Barcode Scanner support in native iOS and Android browsers.
	 *
	 * Here is an example of how to trigger the scan function of BarcodeScanner:
	 * <pre>
	 * sap.ui.require(["sap/ndc/BarcodeScanner"], function(BarcodeScanner) {
	 * 	BarcodeScanner.scan(
	 * 		function (oResult) { / * process scan result * / },
	 * 		function (oError) { / * handle scan error * / },
	 * 		function (oResult) { / * handle input dialog change * / }
	 * 	);
	 * });
	 * </pre>
	 *
	 * The Barcode Scanner control integrates with the laser scanner when the page is loaded in the Enterprise Browser on a Zebra device. To enable laser scanning with a Zebra device, two JavaScript files (ebapi.js and eb.barcode.js) need to be loaded during runtime by the Enterprise Browser.
	 * <ul>
	 * <li>Your company admin / IT should configure the Barcode API settings in the Enterprise Browser config.xml file using mobile device management (MDM). Refer to <a target="_blank" rel="noopener,noreferrer" href="https://techdocs.zebra.com/enterprise-browser/3-3/guide/configreference/">CustomDOMElements</a> for detailed information (recommended).</li>
	 * <li>Developers can load these files directly into an HTML file. Refer to <a target="_blank" rel="noopener,noreferrer" href="https://techdocs.zebra.com/enterprise-browser/3-3/api/barcode/">Enabling the API</a> for detailed information.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @since 1.28.0
	 *
	 * @namespace
	 * @public
	 * @alias sap.ndc.BarcodeScanner
	 */
	var BarcodeScanner = {},

	/* =========================================================== */
	/* Internal methods and properties							 */
	/* =========================================================== */
		oStream,
		oScanDialog,
		oBarcodeScannerUIContainer,
		oVideoTrack,
		oBarcodeVideoDOM,
		oBarcodeCanvasDOM,
		oBarcodeOverlayDOM,
		oBarcodeHighlightDOM,

		oScannerAPIStatus = {
			Initial: "Initial",
			Loading: "Loading",
			Available: "Available",
			UnAvailable : "UnAvailable"
		},
		oModel = new JSONModel({
			// current scanner API
			scannerAPI: "unknown",
			available: false,
			config: {
				defaultConstraints: {
					audio: false,
					video: {
						facingMode: 'environment'
					}
				},
				deviceId: undefined,
				preferFrontCamera: false,
				enableGS1Header: false
			},
			scanDialog: {
				title: "", //oDialogTitle
				onLiveUpdate: null, //Live update function
				barcodeOverlaySetup: false,
				isNoScanner: false,
				scanningStartTime: 0,
				keepCameraScan: false,
				disableBarcodeInputDialog: false
			},
			callBackHandler: {
				onFnFail: null,
				onFnSuccess: null,
				callBackFromSetPhysicalScan: false
			},
			devices: {
				mainCamera: undefined,
				needCheck: true,
				all: [],
				front: [],
				back: []
			},
			apis: {
				ZebraEnterpriseBrowser: {
					key: "ZebraEnterpriseBrowser",
					description: "Zebra Enterprise Browser",
					status: oScannerAPIStatus.Initial,
					enableBarcodeState: "init",
					enableZebraBarcodeRetryCount: 6
				},
				Cordova: {
					key: "Cordova",
					description: "Cordova",
					status: oScannerAPIStatus.Initial,
					scannerAPI: null  //oCordovaScannerAPI
				},
				ZXingCPP: {
					key: "ZXingCPP",
					description: "WebAssembly build (using Emcripten) of zxing-cpp",
					status: oScannerAPIStatus.Initial,
					instance: null, //oZXingCPP
					scannerAPI: null //oZXingCPPScannerAPI
				}
			},
			bReady: true			// No scanning is in progress
			// TODO: following var is not used, right now it is useless // bInitialized = false,	// Flag indicating whether the feature vector (sap.Settings) is available
									// sap.Settings might be loaded later, so it is checked again the next scan
		}),
		oStatusModel = new JSONModel({
			scannerAPI: "unknown",
			available: false,
			deviceId: undefined,
			devices: [],
			apis: {
				ZebraEnterpriseBrowser: {
					key: "ZebraEnterpriseBrowser",
					status: oScannerAPIStatus.Initial
				},
				Cordova: {
					key: "Cordova",
					status: oScannerAPIStatus.Initial
				},
				ZXingCPP: {
					key: "ZXingCPP",
					status: oScannerAPIStatus.Initial
				}
			}
		}).setDefaultBindingMode(BindingMode.OneWay),

		oResourceModel = new ResourceModel({
			bundleName: "sap.ndc.messagebundle"
		});

	/**
	 * Get the scanner API in data model
	 * @param {string} sScannerAPI the scanner API
	 * @returns {object} The scanner API object
	 * @private
	 */
	function getScannerAPI(sScannerAPI) {
		return oModel.getProperty("/apis/" + sScannerAPI + "/");
	}

	/**
	 * Update the scanner API in data model
	 * @param {string} sScannerAPI The scanner API
	 * @param {string} sStatus New status of the scanner API
	 * @param {boolean} bSetAsCurrentScannerAPI If true, set the scanner API as current scanner API
	 * @private
	 */
	function updateScannerAPI(sScannerAPI, sStatus, bSetAsCurrentScannerAPI) {
		if (!sScannerAPI || !getScannerAPI(sScannerAPI)) {
			Log.error("BarcodeScanner.updateScannerAPI: scanner API '" + sScannerAPI + "' is not a valid status code, stop update scanner API. Please check!");
			return;
		}
		var sScannerAPIPath = "/apis/" + sScannerAPI + "/";
		// set status
		if (sStatus) {
			if (oScannerAPIStatus[sStatus]) {
				oModel.setProperty(sScannerAPIPath + "status", sStatus);
				oStatusModel.setProperty(sScannerAPIPath + "status", sStatus);
			} else {
				Log.error("BarcodeScanner.updateScannerAPI: scanner API status '" + sStatus + "' is not a valid status code, please check!");
			}
		}
		// set current scanner API
		if (typeof bSetAsCurrentScannerAPI === "boolean" && bSetAsCurrentScannerAPI) {
			oModel.setProperty("/scannerAPI", sScannerAPI);
			oStatusModel.setProperty("/scannerAPI", sScannerAPI);
		}
		oModel.checkUpdate(true);
		oStatusModel.checkUpdate(true);
	}

	/**
	 * Set the scanner API status as Available in data model
	 * @param {string} sScannerAPI The scanner API
	 * @param {boolean} bSetAsCurrentScannerAPI If true, set the scanner API as current scanner API
	 * @private
	 */
	 function setScannerAPIAvailable(sScannerAPI, bSetAsCurrentScannerAPI) {
		updateScannerAPI(sScannerAPI, oScannerAPIStatus.Available, bSetAsCurrentScannerAPI);
	}

	/**
	 * Set the scanner API status as UnAvailable in data model
	 * @param {string} sScannerAPI The scanner API
	 * @private
	 */
	 function setScannerAPIUnAvailable(sScannerAPI) {
		oModel.setProperty("/apis/" + sScannerAPI + "/instance", null);
		oModel.setProperty("/apis/" + sScannerAPI + "/scannerAPI", null);
		updateScannerAPI(sScannerAPI, oScannerAPIStatus.UnAvailable);
	}

	/**
	 * Returns the current scanner API that will be used to scan.
	 * @private
	 * @returns {string} The Barcode Scanner API info. (e.g. ZebraEnterpriseBrowser, Cordova, ZXingCPP or unknown)
	 */
	function getCurrentScannerAPI() {
		return oModel.getProperty("/scannerAPI");
	}

	/**
	 * Set the scanner API as current scanner API
	 * @param {string} sScannerAPI The scanner API
	 * @private
	 */
	function setCurrentScannerAPI(sScannerAPI) {
		if (sScannerAPI === "unknown") {
			// set current scanner API "unknown"
			oModel.setProperty("/scannerAPI", sScannerAPI);
			oStatusModel.setProperty("/scannerAPI", sScannerAPI);
		} else {
			updateScannerAPI(sScannerAPI, undefined, true);
		}
	}

	/**
	 * Check if the status of the scanner API match the status parameter
	 * @param {string} sScannerAPI The scanner API
	 * @param {string} sStatus The status to match
	 * @returns {boolean} Returns true if match, or returns false
	 * @private
	 */
	 function checkScannerAPIStatus(sScannerAPI, sStatus) {
		if (!sScannerAPI || !getScannerAPI(sScannerAPI)) {
			Log.error("BarcodeScanner.checkScannerAPIStatus: scanner API '" + sScannerAPI + "' doesn't exist. Please check!");
			return false;
		}
		var sScannerAPIStatus = oModel.getProperty("/apis/" + sScannerAPI + "/status");
		return sStatus === sScannerAPIStatus;
	}

	/**
	 * Check if the status of the scanner API is Available
	 * @param {string} sScannerAPI The scanner API
	 * @returns {boolean} Returns true if is Available, or returns false
	 * @private
	 */
	function isScannerAPIAvailable(sScannerAPI) {
		return checkScannerAPIStatus(sScannerAPI, oScannerAPIStatus.Available);
	}

	/**
	 * Check if the status of the scanner API is UnAvailable
	 * @param {string} sScannerAPI The scanner API
	 * @returns {boolean} Returns true if is UnAvailable, or returns false
	 * @private
	 */
	 function isScannerAPIUnAvailable(sScannerAPI) {
		return checkScannerAPIStatus(sScannerAPI, oScannerAPIStatus.UnAvailable);
	}

	/**
	 * Disable the Feature APIs(ZXingCPP)
	 * @private
	 */
	function disableFeatureAPIs() {
		// set the feature available to false since the feature flag is false
		oModel.setProperty("/available", false);
		oStatusModel.setProperty("/available", false);
		setScannerAPIUnAvailable("ZXingCPP");
		Log.debug("BarcodeScanner.disableFeatureAPIs: Set status of Feature scanner APIs (ZXingCPP) to unavailable!");
	}

	/**
	 * Init the scanner APIs.
	 * @private
	 */
	function initScannerAPIs() {
		try {
			// check cordova plugin, if exists, no need to check ZXingCPP
			var oCordovaScannerAPI = cordova.plugins.barcodeScanner;
			if (oCordovaScannerAPI) {
				oModel.setProperty("/apis/Cordova/scannerAPI", oCordovaScannerAPI);
				setScannerAPIAvailable("Cordova");
				if (getCurrentScannerAPI() === "unknown") {
					// set current scanner API to Cordova if Zebra is unavailable
					setCurrentScannerAPI("Cordova");
				}
				Log.debug("BarcodeScanner.initScannerAPIs: Cordova BarcodeScanner plugin is available!");
				// disable feature scanner APIs (ZXingCPP)
				disableFeatureAPIs();
			} else {
				Log.debug("BarcodeScanner.initScannerAPIs: Cordova BarcodeScanner plugin is unavailable!");
				setScannerAPIUnAvailable("Cordova");
				initFeatureAPIs();
			}
		} catch (e) {
			Log.debug("BarcodeScanner.initScannerAPIs: Cordova BarcodeScanner plugin is unavailable!");
			setScannerAPIUnAvailable("Cordova");
			initFeatureAPIs();
		}
	}

	/**
	 * Init feature APIs and get device cameras
	 * @private
	 */
	function initFeatureAPIs() {
		jQuery(document).ready(function() {
			if (isEnumerateDevicesSupported()) {
				getDeviceCameras();
			}
		});
		loadZXingCPPAPI();
	}

	/**
	 * Callback for Load ZXingCPP scanner API or Instances failed
	 * @private
	 */
	 function loadZXingCPPFailed(sMessage) {
		Log.error(sMessage);
		Log.warning("BarcodeScanner.loadZXingCPPFailed: no feature scanner API available now.");
		disableFeatureAPIs();
		oModel.checkUpdate(true);
	}

	/**
	 * Load ZXingCPP scanner API.
	 * @private
	 */
	function loadZXingCPPAPI() {
		Log.debug("BarcodeScanner.loadZXingCPPAPI: load ZXingCPP API");
		updateScannerAPI("ZXingCPP", oScannerAPIStatus.Loading);
		sap.ui.require([
			"sap/ndc/thirdparty/zxingcpp/zxing_reader"
		], function (ZXing) {
			oModel.setProperty("/apis/ZXingCPP/instance", ZXing);
			if (getCurrentScannerAPI() === "unknown") {
				// set current scanner API to ZXingCPP if Zebra is unavailable
				setCurrentScannerAPI("ZXingCPP");
			}
			Log.debug("BarcodeScanner.loadZXingCPPAPI: ZXingCPP API is Initial!");
			updateScannerAPI("ZXingCPP", oScannerAPIStatus.Initial);
		}, function (oError) {
			loadZXingCPPFailed("BarcodeScanner.loadZXingCPPAPI: ZXingCPP API is unavailable.\n" + oError);
		});
	}

	/**
	 * Load ZXingCPP scanner Instance.
	 * @param {function} fnSuccess The callback function if load success
	 * @param {function} fnFail The callback function if load failed
	 * @private
	 */
	function loadZXingCPPInstance(fnSuccess, fnFail) {
		// since the size of zxing_reader.wasm is about 1M, we need to open a busy dialog to lock the current frame/page
		var oBusyDialog = new BusyDialog({
			title: oResourceModel.getProperty("BARCODE_DIALOG_BUSY_TITLE"),
			text: oResourceModel.getProperty("BARCODE_DIALOG_BUSY_TEXT_ZXINGCPP")
		});
		oBusyDialog.open();
		updateScannerAPI("ZXingCPP", oScannerAPIStatus.Loading);
		var oZXingCPPConfig = {
			"locateFile": function(sPath, sScriptDictionary) {
				return locateFile(sPath, sScriptDictionary, "zxingcpp");
			}
		};
		var oZXingCPP = oModel.getProperty("/apis/ZXingCPP/instance");
		oZXingCPP(oZXingCPPConfig).then(function(instance) {
			oModel.setProperty("/apis/ZXingCPP/scannerAPI", instance);
			Log.debug("BarcodeScanner.loadZXingCPPInstance: wasm lib instance of ZXingCPP is available!");
			setScannerAPIAvailable("ZXingCPP");
			if (getCurrentScannerAPI() === "unknown") {
				// set current scanner API to ZXingCPP if Zebra is unavailable
				setCurrentScannerAPI("ZXingCPP");
			}
			Log.debug("BarcodeScanner.loadZXingCPPInstance: ZXingCPP API is available!");
			oBusyDialog.close();
			fnSuccess();
		}, function(oError) {
			loadZXingCPPFailed("BarcodeScanner.loadZXingCPPInstance: can not load wasm lib instance of ZXingCPP.\n" + oError);
			oBusyDialog.close();
			fnFail();
		});
	}

	/**
	 * Get the url of the wasm file.
	 * @param {string} sPath The wasm file path
	 * @param {string} sScriptDictionary the script dictionary
	 * @param {string} sLibrary The API library name
	 * @returns {string} The url of the wasm file
	 * @private
	 */
	function locateFile(sPath, sScriptDictionary, sLibrary) {
		if (!sScriptDictionary || sScriptDictionary === "") {
			return sap.ui.require.toUrl("sap/ndc/thirdparty/" + sLibrary + "/") + sPath;
		}
		return sScriptDictionary + sPath;
	}

	/**
	 * Used to detect if browser support enumerate devices
	 * @private
	 * @returns {boolean} true is enumerate devices supported by browser
	 */
	function isEnumerateDevicesSupported() {
		return !!(window && window.navigator && window.navigator.mediaDevices && window.navigator.mediaDevices.enumerateDevices);
	}

	/**
	 * Get the device cameras
	 * @private
	 */
	function getDeviceCameras() {
		Log.debug("BarcodeScanner.getDeviceCameras: start to get device cameras");
		// List cameras and microphones
		window.navigator.mediaDevices.enumerateDevices()
			.then(
				function(devices) {
					var oDevices = oModel.getProperty("/devices");
					var iCameraCount = 0;
					devices.forEach(function(device) {
						if (device.kind === "videoinput") {
							iCameraCount++;
							var oDevice = {
								"deviceId": device.deviceId,
								"groupId": device.groupId,
								"kind": device.kind,
								"label": device.label
							};
							if (oDevice.label && oDevice.label !== "") {
								if (oDevice.label.indexOf('0, facing back') > 0) {
									// set the main camera if one camera label contains "0, facing back"
									Log.debug("BarcodeScanner.getDeviceCameras: has a camera with label contains '0, facing back', set it as main camera.");
									oDevices.needCheck = false;
									oDevices.mainCamera = oDevice;
								}
								if (oDevice.label.indexOf('back') > 0) {
									oDevices.back.push(oDevice);
								} else if (oDevice.label.indexOf('front') > 0) {
									oDevices.front.push(oDevice);
								}
							} else {
								// if has no permission to access device cameras, the camere label will be empty, then we set it manually.
								oDevice.label = "Camera " + iCameraCount;
							}
							oDevices.all.push(oDevice);
						}
					});
					if (!oDevices.mainCamera) {
						if (oDevices.back.length === 1) {
							// set the main camera if only has 1 back camera
							Log.debug("BarcodeScanner.getDeviceCameras: has only one camera which label contains 'back', set it as main camera.");
							oDevices.mainCamera = deepClone(oDevices.back[0]);
							oDevices.needCheck = false;
						} else if (oDevices.all.length === 1) {
							// set the main camera if only has 1 camera
							Log.debug("BarcodeScanner.getDeviceCameras: has only one camera, set it as main camera.");
							oDevices.mainCamera = deepClone(oDevices.all[0]);
							oDevices.needCheck = false;
						}
					}
					oModel.setProperty("/devices", oDevices);
					updateDevicesInStatusModel();
				}
			)
			.catch(
				function(oErr) {
					oModel.setProperty("/devices/needCheck", false);
					Log.error("BarcodeScanner.getDeviceCameras: Can not get device cameras.\nError Message: " + oErr);
			});
	}

	/**
	 * Find the main camera in the camera list
	 * @param {Array} aCameras the camera list
	 * @param {function} fnCallback callback function
	 * @private
	 */
	function findMainCamera(aCameras, fnCallback) {
		var aCamerasClone = deepClone(aCameras);
		var fnCheckStream = function () {
			if (aCamerasClone.length === 0) {
				oModel.setProperty("/devices/needCheck", false);
				updateDevicesInStatusModel();
				Log.debug("BarcodeScanner.findMainCamera: can not find the main camera.");
				fnCallback();
			} else {
				var oCamera = aCamerasClone[aCamerasClone.length - 1];
				var oConstraints = deepClone(oModel.getProperty("/config/defaultConstraints"));
				oConstraints.video.deviceId = {
					exact: oCamera.deviceId
				};
				var oVideoResolution = calculateVideoResolution();
				oConstraints.video = Object.assign(oConstraints.video, oVideoResolution);
				window.navigator.mediaDevices
				.getUserMedia(oConstraints)
				.then(
					function(stream) {
						var videoTrack = typeof stream.stop === "function" ? stream : stream.getTracks()[0];
						// main camera always support flash light.
						checkFlashLight(videoTrack).then(function() {
							oCamera.flashLight = true;
							oModel.setProperty("/devices/mainCamera", oCamera);
							oModel.setProperty("/devices/needCheck", false);
							updateDevicesInStatusModel();
							Log.debug("BarcodeScanner.findMainCamera: the main camera is " + oCamera.deviceId);
							oStream = stream;
							if (oStream) {
								playbackVideoAndDecode();
							} else {
								oScanDialog.getModel().setProperty("/isNoScanner", true);
								openBarcodeInputDialog(oResourceModel.getResourceBundle().getText('BARCODE_DIALOG_CAMERA_STREAM_ERROR_MSG'));
							}
						}, function() {
							videoTrack.stop();
							Log.debug("BarcodeScanner.findMainCamera: " + oCamera.deviceId + " is not the main camera, check the next camera");
							aCamerasClone.pop();
							fnCheckStream();
						});
					}
				).catch(
					function (error) {
						Log.debug("BarcodeScanner.findMainCamera: getUserMedia() failed.\nError Message: " + error);
						if (oModel.getProperty("/config/defaultConstraints/video/zoom") !== undefined) {
							Log.debug("BarcodeScanner.findMainCamera: getUserMedia() failed maybe caused by unsupported constraint 'zoom', delete it and try again.");
							delete oModel.getProperty("/config/defaultConstraints/video").zoom;
						} else {
							aCamerasClone.pop();
						}
						fnCheckStream();
					}
				);
			}
		};
		fnCheckStream();
	}

	/**
	 * Update the devices list in status model
	 * @private
	 */
	function updateDevicesInStatusModel() {
		Log.debug("BarcodeScanner.updateDevicesInStatusModel: update the devices in status model");
		var oDevices = deepClone(oModel.getProperty("/devices/all"));
		oStatusModel.setProperty("/devices", oDevices);
	}

	/**
	 * Check if the current video track support flashlight
	 * @param {object} videoTrack the current video track
	 * @private
	 */
	function checkFlashLight(videoTrack) {
		if (!("ImageCapture" in window)) {
			// apple device don't support ImageCapture API now
			return new Promise(function (resolve, reject) {
				Log.debug("BarcodeScanner.checkFlashLight: Device does not support image capture");
				reject();
			});
		} else if (!videoTrack) {
			return new Promise(function (resolve, reject) {
				Log.debug("BarcodeScanner.checkFlashLight: Camera is not opened");
				reject();
			});
		} else {
			var oImageCapture = new ImageCapture(videoTrack);
			return new Promise(function (resolve, reject) {
				oImageCapture.getPhotoCapabilities().then(function(oCapabilities) {
					if (oCapabilities.fillLightMode && oCapabilities.fillLightMode.includes("flash")) {
						Log.debug("BarcodeScanner.checkFlashLight: Camera does support flash light");
						resolve();
					} else {
						Log.debug("BarcodeScanner.checkFlashLight: Camera doesn't support flash light");
						reject();
					}
				}).catch(function(oError) {
					Log.debug("BarcodeScanner.checkFlashLight: Camera not started or not available.\nError Message: " + oError);
					reject();
				});
			});
		}
	}

	/**
	 * Used to detect browsers which does not have access to html5 user media api and can not use device camera
	 * @private
	 * @returns {boolean} true is user media access supported by html5 compatible browser
	 */
	function isUserMediaAccessSupported() {
		return !!(window && window.navigator && window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia);
	}

	function checkCordovaInIframe() {
		try {
			if (self != top && typeof cordova === "undefined") {
				// self != top, means the app is loaded in an iframe.
				// typeof cordova === "undefined", means cannot find cordova plugins in the iframe.
				// Now assign top.cordova to window.cordova variable in current iframe.
				window.cordova = top.cordova;
			}
		} catch (err) {
			// Catch the DOMException in the cross-origin iframe. Cordova doesn't support cross-origin
			Log.info("BarcodeScanner.checkCordovaInIframe: cordova is unavailable in cross-origin iframe");
		}
	}

	function initZebraEB() {
		try {
			// typeof EB === "undefined" || typeof Rho === "undefined", means cannot find EB API in the iframe.
			if (self != top && (typeof EB === "undefined" || typeof window.Rho === "undefined")) {
				if (typeof top.EB !== "undefined" || typeof top.Rho !== "undefined") {
					// Now assign window.EB to top.EB and window.Rho to top.Rho variable in current iframe.
					window.EB = top.EB;
					window.Rho = top.Rho;
				}
			}
			if (typeof EB !== "undefined" && typeof EB.Barcode !== "undefined") {
				setScannerAPIAvailable("ZebraEnterpriseBrowser", true);
				Log.debug("BarcodeScanner.initZebraEB: Zebra Enterprise Browser plugin is available!");
			} else {
				setScannerAPIUnAvailable("ZebraEnterpriseBrowser");
				Log.debug("BarcodeScanner.initZebraEB: Zebra Enterprise Browser plugin is unavailable!");
			}
		} catch (oErr) {
			Log.info("BarcodeScanner.initZebraEB: EB and Rho are unavailable");
		}
	}

	// Check:
	//	* Feature vector (sap.Settings.isFeatureEnabled) is available
	//  * Barcode Scanner is enabled by the Feature Vector
	//  * Barcode Scanner Cordova plug-in (cordova.plugins.barcodeScanner) or zxing-cpp (ZXing CPP) is available
	function init() {
		checkCordovaInIframe();

		//true by default and only false if feature is forbidden from feature vector
		oModel.setProperty("/available", true);
		oStatusModel.setProperty("/available", true);

		// Initial Zebra EB
		if (Device.os.android) {
			jQuery(document).ready(function() {
				initZebraEB();
				zebraEBScanEnable();
			});
		} else {
			setScannerAPIUnAvailable("ZebraEnterpriseBrowser");
			Log.debug("BarcodeScanner.init: Not Android device, Zebra Enterprise Browser plugin is unavailable!");
		}

		//sap.Settings is provided by Kapsel SettingsExchange plugin.
		if (sap.Settings && typeof sap.Settings.isFeatureEnabled === "function") {
			// TODO: following var is not used, right now it is useless // bInitialized = true;
			sap.Settings.isFeatureEnabled("cordova.plugins.barcodeScanner",
				// Feature check success
				function (bEnabled) {
					if (bEnabled) {
						// init the scanner APIs
						initScannerAPIs();
					} else {
						// disable feature scanner APIs (ZXingCPP, ZXing)
						disableFeatureAPIs();
						Log.warning("BarcodeScanner.init: Feature disabled in sap.Settings");
						// init the scanner APIs
						initScannerAPIs();
					}
				},
				// Feature check error
				function () {
					Log.warning("BarcodeScanner.init: Feature check failed");
					// init the scanner APIs
					initScannerAPIs();
				}
			);
		} else {
			if (sap.Settings === undefined) {
				//native device capabilities should be by default enabled if there is no feature vector
				//available to restrict the capability.
				Log.debug("BarcodeScanner.init: No sap.Settings. No feature vector available.");
			} else {
				Log.warning("BarcodeScanner.init: Feature vector (sap.Settings.isFeatureEnabled) is unavailable");
			}
			// init the scanner APIs
			initScannerAPIs();
		}
	}

	/**
	 * Makes sure that fallback option with input field appears in case if video device unavailable
	 * @private
	 * @param {string} sMessage popup will contain label with this explanatory message about reason why scanner is unavailable
	 */
	function openBarcodeInputDialog(sMessage) {
		if (sMessage) {
			Log.warning("BarcodeScanner.openBarcodeInputDialog: isNoScanner. Message: " + sMessage);
			var sErrorMsg = oResourceModel.getResourceBundle().getText('BARCODE_DIALOG_CAMERA_OTHER_ERROR_MSG', sMessage);
			if (sMessage.name) {
				var sErrorMsgKey = "BARCODE_DIALOG_CAMERA_" + sMessage.name.toUpperCase() + "_ERROR_MSG";
				sErrorMsg = oResourceModel.getResourceBundle().getText(sErrorMsgKey);
			}
			MessageToast.show(
				sErrorMsg,
				{
					duration: 1000
				}
			);
		}

		var disableBarcodeInputDialog = oModel.getProperty("/scanDialog/disableBarcodeInputDialog");
		if (disableBarcodeInputDialog) {
			BarcodeScanner.closeScanDialog();
		} else {
			oScanDialog.destroyContent();
			oScanDialog.setTitle('');
			oScanDialog.setStretch(false);
			oScanDialog.setContentHeight('auto');
			if (oBarcodeOverlayDOM) {
				oBarcodeOverlayDOM.hidden = true;
			}
			oScanDialog.removeStyleClass('sapUiNoContentPadding');

			oScanDialog.setTitle(oModel.getProperty("/scanDialog/title"));

			var oMSGLabel = new Label(oScanDialog.getId() + '-txt_barcode', {
				text: "{i18n>BARCODE_DIALOG_MSG}",
				visible: "{/isNoScanner}"
			});
			oScanDialog.addContent(
				oMSGLabel
			);

			var oFallbackInput = new Input(oScanDialog.getId() + '-inp_barcode', {
				value: "{/barcode}",
				valueLiveUpdate: true,
				ariaLabelledBy: oMSGLabel.getId(),
				liveChange: function(oEvent) {
					var onLiveUpdate = oModel.getProperty("/scanDialog/onLiveUpdate");
					if (typeof onLiveUpdate === "function") {
						onLiveUpdate({
							newValue: oEvent.getParameter("newValue")
						});
					}
				},
				placeholder: "{i18n>BARCODE_DIALOG_PLACEHOLDER}"
			});
			oScanDialog.addContent(oFallbackInput);

			// shortcut for sap.m.ButtonType
			var ButtonType = mobileLibrary.ButtonType;

			oScanDialog.setBeginButton(
				new Button(oScanDialog.getId() + '-btn_barcode_ok', {
					type: ButtonType.Emphasized,
					text: "{i18n>BARCODE_DIALOG_OK}",
					press: function(oEvent) {
						var onFnSuccess = oModel.getProperty("/callBackHandler/onFnSuccess");
						if (typeof onFnSuccess === "function") {
							var oScanningTime = "unknown";
							if (oModel.getProperty("/scanDialog/scanningStartTime") > 0) {
								var scanningStopTime = Date.now();
								oScanningTime = scanningStopTime - oModel.getProperty("/scanDialog/scanningStartTime");
							}
							onFnSuccess({
								text: oScanDialog.getModel().getProperty("/barcode"),
								scanningTime: oScanningTime,
								cancelled: false
							});
						}
						BarcodeScanner.closeScanDialog();
					}
				})
			);
			oScanDialog.setEndButton(
				new Button({
					text: "{i18n>BARCODE_DIALOG_CANCEL}",
					press: function() {
						BarcodeScanner.closeScanDialog();
					}
				})
			);

			oScanDialog.setBusy(false);
		}
	}

	/**
	 * Open correct camera
	 * @private
	 */
	function openCorrectCamera() {
		if (!oModel.getProperty("/config/preferFrontCamera")) {
			delete oModel.getProperty("/config/defaultConstraints/video").facingMode;
			var oDevices = oModel.getProperty("/devices");
			// when:
			//		a. no camera seleted
			//		b. main camera not found (no camera label contains '0, facing back')
			//		c. not iphone devices
			//		d. not Mac, or not ipad devices with Safari browser
			//		e. needCheck flag !== false
			//		f. camera list length > 1
			// need to find main camera
			if (!oModel.getProperty("/config/deviceId") && !oDevices.mainCamera && !Device.os.ios && !Device.os.macintosh && oDevices.needCheck && oDevices.all.length > 1) {
				// if back camera list length > 1, find main camera in back camera list, or find it in all camera list
				var oCameras = oDevices.back.length > 1 ? oDevices.back : oDevices.all;
				var sCategory = oDevices.back.length > 1 ? "back" : "all";
				Log.debug("BarcodeScanner.openCorrectCamera: start to find the main camera in " + sCategory + " camera list.");
				findMainCamera(oCameras, openCamera);
				return;
			}
		}
		openCamera();
	}

	function openCamera(bAttachOrientationChangeListener) {
		Log.debug("BarcodeScanner.openCamera: start to open camera");
		if (oModel.getProperty("/config/deviceId")) {
			// if config/deviceId is set, use it as camera deviceId directly
			delete oModel.getProperty("/config/defaultConstraints/video").facingMode;
			oModel.setProperty("/config/defaultConstraints/video/deviceId", {
				exact: oModel.getProperty("/config/deviceId")
			});
		} else if (oModel.getProperty("/config/preferFrontCamera")) {
			oModel.setProperty("/config/defaultConstraints/video/facingMode", "user");
			delete oModel.getProperty("/config/defaultConstraints/video").deviceId;
		} else {
			var oDevices = oModel.getProperty("/devices");
			if (oDevices.mainCamera && oDevices.mainCamera.deviceId !== "") {
				oModel.setProperty("/config/defaultConstraints/video/deviceId", {
					exact: oDevices.mainCamera.deviceId
				});
			} else {
				oModel.setProperty("/config/defaultConstraints/video/facingMode", "environment");
			}
		}
		var oConstraints = deepClone(oModel.getProperty("/config/defaultConstraints"));
		var oVideoResolution = calculateVideoResolution();
		oConstraints.video = Object.assign(oConstraints.video, oVideoResolution);
		window.navigator.mediaDevices
			.getUserMedia(oConstraints)
			.then(
				function(stream) {
					oStream = stream;
					if (oStream) {
						playbackVideoAndDecode(bAttachOrientationChangeListener);
					} else {
						oModel.setProperty("/scanDialog/isNoScanner", true);
						openBarcodeInputDialog(oResourceModel.getResourceBundle().getText('BARCODE_DIALOG_CAMERA_STREAM_ERROR_MSG'));
					}
				}
			)
			.catch(
				function (error) {
					Log.debug("BarcodeScanner.openCamera: getUserMedia() failed.\nError Message: " + error);
					if (oModel.getProperty("/config/defaultConstraints/video/zoom") !== undefined) {
						Log.debug("BarcodeScanner.openCamera: getUserMedia() failed maybe caused by unsupported constraint 'zoom', delete it and try again.");
						delete oModel.getProperty("/config/defaultConstraints/video").zoom;
						openCamera();
					} else {
						oModel.setProperty("/scanDialog/isNoScanner", true);
						openBarcodeInputDialog(error);
					}
				}
			);
	}

	function openScanDialog() {
		oModel.checkUpdate(true);
		var oDialogModel;

		if (!oScanDialog || (oScanDialog && oScanDialog.getContent().length === 0)) {
			oDialogModel = new JSONModel();
			oScanDialog = new Dialog('sapNdcBarcodeScannerDialog', {
				icon: 'sap-icon://bar-code',
				title: oResourceModel.getProperty("BARCODE_DIALOG_SCANNING_TITLE"),
				stretch: true,
				horizontalScrolling: false,
				verticalScrolling: false,
				endButton: new Button({
					text: "{i18n>BARCODE_DIALOG_CANCEL}",
					enabled: false,
					press: function() {
						oScanDialog.getModel().setProperty("/isNoScanner", false);
						closeScannerContain();
						openBarcodeInputDialog();
					}
				}),
				afterClose: function() {
					closeScannerContain();
					if (oScanDialog) {
						oScanDialog.destroyContent();
						oScanDialog.destroy();
					}
					oScanDialog = null;
				}
			});
			oScanDialog.setEscapeHandler(function(promise) {
				BarcodeScanner.closeScanDialog();
				var oFnSuccess = oModel.getProperty("/callBackHandler/onFnSuccess");
				if (typeof oFnSuccess === "function") {
					oFnSuccess({
						text: oDialogModel.getProperty("/barcode"),
						cancelled: true
					});
				}
				promise.resolve();
			});
			oScanDialog.setModel(oDialogModel);
			oScanDialog.setModel(oResourceModel, "i18n");
		}

		oScanDialog.addStyleClass('sapUiNoContentPadding');
		oScanDialog.setBusy(true);

		if (isScannerAPIAvailable("ZXingCPP") && isUserMediaAccessSupported()) {
			oScanDialog.attachAfterOpen(function() {
				openCorrectCamera();
			});
			oScanDialog.destroyContent();
			oBarcodeHighlightDOM = undefined;
			oBarcodeOverlayDOM = undefined;
			oBarcodeVideoDOM = undefined;
			oBarcodeCanvasDOM = undefined;

			oBarcodeScannerUIContainer = new BarcodeScannerUIContainer();
			oScanDialog.addContent(oBarcodeScannerUIContainer);
			oScanDialog.setContentWidth('100%');
			oScanDialog.setContentHeight('100%');

			oModel.setProperty("/scanDialog/barcodeOverlaySetup", false);
		} else {
			if (oModel.getProperty("/available")) {
				oModel.setProperty("/scanDialog/isNoScanner", false);
			} else {
				oModel.setProperty("/scanDialog/isNoScanner", true);
			}
			openBarcodeInputDialog();
		}
		oScanDialog.open();
	}

	/**
	 * Scan the barcode via Zebra scanner API
	 * @private
	 */
	function scanWithZebra() {
		oModel.setProperty("/bReady", true);
		oModel.setProperty("/callBackHandler/callBackFromSetPhysicalScan", false);
		EB.Barcode.triggerType = EB.Barcode.SOFT_ONCE;
		EB.Barcode.start();
	}

	/**
	 * Scan the barcode via Cordova scanner API
	 * @private
	 */
	function scanWithCordova() {
		var options;
		if (oModel.getProperty("/config/preferFrontCamera")) {
			options = {
				preferFrontCamera: true
			};
		}
		oModel.getProperty("/apis/Cordova/scannerAPI").scan(
			function (oResult) {
				if (oResult.cancelled === "false" || !oResult.cancelled) {
					oResult.cancelled = false;
					var onFnSuccess = oModel.getProperty("/callBackHandler/onFnSuccess");
					if (typeof onFnSuccess === "function") {
						onFnSuccess(oResult);
					}
				} else {
					openScanDialog();
				}
				oModel.setProperty("/bReady", true);
			},
			function (oEvent) {
				Log.error("BarcodeScanner.scanWithCordova: Barcode scanning failed.");
				oModel.setProperty("/bReady", true);
				var onFnFail = oModel.getProperty("/callBackHandler/onFnFail");
				if (typeof onFnFail === "function") {
					if (typeof oEvent === "string") {
						var str = oEvent;
						oEvent = {"text": str};
						Log.debug("BarcodeScanner.scanWithCordova: Change the type of oEvent from string to object");
					}
					onFnFail(oEvent);
				}
			},
			options
		);
	}

	/**
	 * Scan the barcode via ZXingCPP
	 * @private
	 */
	 function scanWithZXingCPP() {
		if (checkScannerAPIStatus("ZXingCPP", oScannerAPIStatus.Initial)) {
			Log.debug("BarcodeScanner.scanWithZXingCPP: ZXingCPP instances is not loaded, start to load them.");
			loadZXingCPPInstance(function() {
				openScanDialog();
			}, function() {
				if (isScannerAPIAvailable("ZebraEnterpriseBrowser")) {
					setCurrentScannerAPI("ZebraEnterpriseBrowser");
					Log.debug("BarcodeScanner.scanWithZXingCPP: Zebra is available, set the current scanner API to Zebra.");
				} else {
					setCurrentScannerAPI("unknown");
					Log.warning("BarcodeScanner.scanWithZXingCPP: Zebra is unavailable too, set the current scanner API to unknown.");
				}
				openScanDialog();
			});
		} else {
			Log.debug("BarcodeScanner.scanWithZXingCPP: get scan dialog.");
			openScanDialog();
		}
	}

	/**
	 * Playback the video, then decode via ZXingCPP
	 * @private
	 */
	function playbackVideoAndDecode(bAttachOrientationChangeListener) {
		// Dev note: if video element dom reference is unavailable at this point (console exception)
		// some error happened during dialog creation and may not be directly related to video element
		oScanDialog.getEndButton().setEnabled(true);
		oScanDialog.setBusy(false);

		if (!oBarcodeHighlightDOM) {
			oBarcodeHighlightDOM = oBarcodeScannerUIContainer.getDomRef('highlight');
		}
		if (!oBarcodeVideoDOM) {
			oBarcodeVideoDOM = oBarcodeScannerUIContainer ? oBarcodeScannerUIContainer.getDomRef('video') : undefined;
		}
		try {
			oBarcodeVideoDOM.srcObject = oStream;
			oBarcodeVideoDOM.play().then(function() {
				// show scan overlay box
				scanFrame();
				if (Device.support.orientation && bAttachOrientationChangeListener !== false) {
					Device.orientation.attachHandler(orientationChangeListener);
				}
				Log.debug("BarcodeScanner.playbackVideoAndDecode: video screen size " + oBarcodeVideoDOM.videoHeight + "X" + oBarcodeVideoDOM.videoWidth);
				oVideoTrack = typeof oStream.stop === "function" ? oStream : oStream.getTracks()[0];
				var settings = oVideoTrack.getSettings();
				Log.debug("BarcodeScanner.playbackVideoAndDecode: video screen frameRate is " + settings.frameRate + ", zoom is " + settings.zoom);
				decodeWithZXingCPP();
			});
		} catch (err) {
			Log.debug("BarcodeScanner.playbackVideoAndDecode is failed. error: " + err);
		}
	}

	/**
	 * Decode the barcode via ZXingCPP scanner API
	 * @private
	 */
	function decodeWithZXingCPP() {
		Log.debug("BarcodeScanner.decodeWithZXingCPP: start to decode");
		if (!oBarcodeVideoDOM || !oBarcodeVideoDOM.srcObject) {
			Log.debug("BarcodeScanner.decodeWithZXingCPP: video dom doesn't exist, stop decoding");
			return;
		}

		try {
			// use canvas to get video frame as image data
			if (!oBarcodeCanvasDOM) {
				oBarcodeCanvasDOM = oBarcodeScannerUIContainer ? document.createElement("canvas") : undefined;
			}
			if (!oBarcodeCanvasDOM) {
				Log.debug("BarcodeScanner.decodeWithZXingCPP: canvas dom doesn't exist, stop decoding");
				return;
			}
			var oContext = oBarcodeCanvasDOM.getContext("2d", { willReadFrequently: true });
			var imgWidth = oBarcodeVideoDOM.videoWidth;
			var imgHeight = oBarcodeVideoDOM.videoHeight;
			oBarcodeCanvasDOM.width = imgWidth;
			oBarcodeCanvasDOM.height = imgHeight;
			oContext.drawImage(oBarcodeVideoDOM, 0, 0, imgWidth, imgHeight);
			var imageData = oContext.getImageData(0, 0, imgWidth, imgHeight);
			var oData = imageData.data;
			// decode image data via ZXingCPP
			var buffer;
			var oZXingCPPScannerAPI = oModel.getProperty("/apis/ZXingCPP/scannerAPI");
			try {
				buffer = oZXingCPPScannerAPI._malloc(oData.length);
				oZXingCPPScannerAPI.HEAPU8.set(oData, buffer);
			} catch (err) {
				Log.error("BarcodeScanner.decodeWithZXingCPP: zxing.HEAPU8 error: " + err);
			}
			var results = oZXingCPPScannerAPI.readBarcodesFromPixmap(buffer, imgWidth, imgHeight, true, "", 1);
			oZXingCPPScannerAPI._free(buffer);
			var iSize = results.size();
			if (iSize > 0 && results.get(0).format) {
				Log.debug("BarcodeScanner.decodeWithZXingCPP: decode successful");
				var result = results.get(0);
				highlightResult(result);
				if (result.cancelled === "false" || !result.cancelled) {
					result.cancelled = false;
					var onFnSuccess = oModel.getProperty("/callBackHandler/onFnSuccess");
					if (typeof onFnSuccess === "function") {
						result.scanningTime = "unknown";
						if (oModel.getProperty("/scanDialog/scanningStartTime") > 0) {
							var scanningStopTime = Date.now();
							result.scanningTime = scanningStopTime - oModel.getProperty("/scanDialog/scanningStartTime");
						}
						if (oModel.getProperty("/config/enableGS1Header")) {
							// Add the symbology identifier of GS1 as prefix into the result text of ZXingCPP
							result.text = result.symbologyIdentifier + result.text;
						}
						onFnSuccess(result);
					}
					BarcodeScanner.closeScanDialog();
				}
			} else {
				if (oBarcodeHighlightDOM && oModel.getProperty("/scanDialog/barcodeOverlaySetup")) {
					hideHightLight();
				}
				setTimeout(decodeWithZXingCPP, 0);
			}
		} catch (err) {
			//Log.debug("BarcodeScanner: err1: " + err);
		}
	}

	/**
	 * Highlight the scan result area
	 * @param {object} result The scan result object
	 * @private
	 */
	function highlightResult(result) {
		var point, scaleX, scaleY;
		var bottom = 0,
			right = 0,
			top = 0,
			left = 0,
			i;

		if (oBarcodeHighlightDOM && !oModel.getProperty("/scanDialog/barcodeOverlaySetup")) {
			oBarcodeHighlightDOM.innerHTML = '';
			oModel.setProperty("/scanDialog/barcodeOverlaySetup", true);
		}

		if (oBarcodeHighlightDOM) {
			scaleX = oBarcodeVideoDOM.clientWidth / oBarcodeVideoDOM.videoWidth;
			scaleY = oBarcodeVideoDOM.clientHeight / oBarcodeVideoDOM.videoHeight;
			if (result.position) {
				result.resultPoints = [
					result.position.topLeft,
					result.position.topRight,
					result.position.bottomRight,
					result.position.bottomLeft
				];
			}
			if (result.resultPoints) {
				top = result.resultPoints[0].y;
				left = result.resultPoints[0].x;
				right = result.resultPoints[0].x;
				bottom = result.resultPoints[0].y;

				for (i = 0; i < result.resultPoints.length; i++) {
					point = result.resultPoints[i];
					if (point.x < left && point.x < right) {
						left = point.x;
					} else if (point.x > left && point.x > right) {
						right = point.x;
					}
					if (point.y < top && point.y < bottom) {
						top = point.y;
					} else if (point.y > top && point.y > bottom) {
						bottom = point.y;
					}
				}
			}

			oBarcodeHighlightDOM.hidden = false;
			oBarcodeHighlightDOM.style.top = top * scaleY + 'px';
			oBarcodeHighlightDOM.style.left = left * scaleX + 'px';
			oBarcodeHighlightDOM.style.width = (right - left > 0 ? (right - left) * scaleX : 5) + 'px';
			oBarcodeHighlightDOM.style.height = (bottom - top > 0 ? (bottom - top) * scaleY : 5) + 'px';
		}
	}

	/**
	 * Hide the highlight dom
	 * @private
	 */
	function hideHightLight() {
		oBarcodeHighlightDOM.hidden = true;
		oBarcodeHighlightDOM.style.top = '0';
		oBarcodeHighlightDOM.style.left = '0';
		oBarcodeHighlightDOM.style.width = '0';
		oBarcodeHighlightDOM.style.height = '0';
	}

	/**
	 * If orientaition changed, reopen camera to maxsize video screen
	 * @private
	 */
	function orientationChangeListener(oNewOrientation) {
		oScanDialog.setBusy(true);
		var sOrientation = oNewOrientation.landscape ? "landscape" : "portrait";
		Log.debug("BarcodeScanner.orientationChangeListener: device orientation changed to " + sOrientation + ", call openCamera again to resize");
		if (oBarcodeOverlayDOM) {
			// hide overlay during orientation change
			oBarcodeOverlayDOM.hidden = true;
		}
		// close the camera since video screen is not in full size after orientation changed
		closeScannerContain(false);
		if (Device.os.ios || Device.os.macintosh) {
			// on iOS devices (iphone and ipad), the dialog may be in small size and moved to top left after orientation changed, so max size and reposition it in center
			oScanDialog._positionDialog();
		}
		// need to wait for the orientation change finished, then reopen camera so that the video screen is in full size
		setTimeout(function() {
			openCamera(false);
		}, 500);
	}

	/**
	 * Calculate video height and width
	 * @returns {object} Video height and width object
	 * @private
	 */
	function calculateVideoResolution() {
		var iAvailHeight = oBarcodeScannerUIContainer.getDomRef().clientHeight,
			iAvailWidth = oBarcodeScannerUIContainer.getDomRef().clientWidth,
			iWidth = 1920,
			iHeight = 1440;
		/*
		if (iAvailHeight > iAvailWidth) {
			iHeight = 1920;
			iWidth = Math.trunc(1920 * iAvailWidth / iAvailHeight);
		} else {
			iWidth = 1920;
			iHeight = Math.trunc(1920 * iAvailHeight / iAvailWidth);
		}*/
		// in portrait mode, width means height ???, so above codes will meet Not Full Screen issue when in this mode
		// have to change to below, need to check document
		if (iAvailHeight > iAvailWidth) {
			iHeight = Math.trunc(1920 * iAvailWidth / iAvailHeight);
		} else {
			iHeight = Math.trunc(1920 * iAvailHeight / iAvailWidth);
		}
		return {
			width: { ideal: iWidth },
			height: { ideal: iHeight }
		};
	}

	function scanFrame() {
		Log.debug("BarcodeScanner.scanFrame: start to set up overlay dom");
		if (!oScanDialog || !oBarcodeVideoDOM || !oBarcodeVideoDOM.videoHeight || !oBarcodeVideoDOM.videoWidth) {
			Log.debug("BarcodeScanner.scanFrame: scan dialog or video screen is closed, stop set up");
			return;
		}
		var iInactiveZonePercent = 0.15;

		if (!oBarcodeOverlayDOM && oBarcodeScannerUIContainer) {
			oBarcodeOverlayDOM = oBarcodeScannerUIContainer.getDomRef('overlay');
		}

		if (oBarcodeOverlayDOM) {
			// show overlay since it may be hidden during orientation change
			oBarcodeOverlayDOM.hidden = false;
			var iBarcodeVideoDOMWidth = oBarcodeVideoDOM.clientWidth,
				iBarcodeVideoDOMHeight = oBarcodeVideoDOM.clientHeight;
			var oBarcodeOverlayWidthTemp = iBarcodeVideoDOMWidth * (1 - 2 * iInactiveZonePercent);
			var oBarcodeOverlayHeightTemp = iBarcodeVideoDOMHeight * (1 - 2 * iInactiveZonePercent);


			if (oBarcodeOverlayWidthTemp <= oBarcodeOverlayHeightTemp) {
				oBarcodeOverlayHeightTemp = oBarcodeOverlayWidthTemp * (1 - 2 * iInactiveZonePercent);
			}

			// Base on the size of video Dom, reset the size of Barcode Scanner Box
			var oBarcodeScannerBox = oBarcodeScannerUIContainer.getDomRef('overlay-box');
			if (oBarcodeScannerBox) {
				oBarcodeScannerBox.style.width = oBarcodeOverlayWidthTemp + 'px';
				oBarcodeScannerBox.style.height = oBarcodeOverlayHeightTemp + 'px';

				oBarcodeOverlayDOM.style.width = oBarcodeOverlayWidthTemp + 'px';
				oBarcodeOverlayDOM.style.height = oBarcodeOverlayHeightTemp + 'px';
				oBarcodeOverlayDOM.style.borderWidth = (iBarcodeVideoDOMHeight - oBarcodeOverlayHeightTemp) / 2 + 'px ' + (iBarcodeVideoDOMWidth - oBarcodeOverlayWidthTemp) / 2 + 'px';
			}
		}
	}

	function closeScannerContain(bDetachOrientationChangeListener) {
		// oStream and oBarcodeVideoDOM.srcObject point to the same video stream, set them to undefined when closing scan screen
		if (oVideoTrack) {
			oVideoTrack.stop();
			oVideoTrack = undefined;
		}
		if (oStream) {
			oStream = undefined;
		}
		if (Device.support.orientation && bDetachOrientationChangeListener !== false) {
			Device.orientation.detachHandler(orientationChangeListener);
		}
		if (oBarcodeVideoDOM && oBarcodeVideoDOM.srcObject) {
			oBarcodeVideoDOM.srcObject = undefined;
		}
	}

	function zebraEBScanEnable() {
		oModel.checkUpdate(true);
		var oEnableZebraBarcodeRetryCount = oModel.getProperty("/apis/ZebraEnterpriseBrowser/enableZebraBarcodeRetryCount");
		var oEnableBarcodeState = oModel.getProperty("/apis/ZebraEnterpriseBrowser/enableBarcodeState");
		if (getCurrentScannerAPI() === "ZebraEnterpriseBrowser" && isScannerAPIAvailable("ZebraEnterpriseBrowser") && oEnableBarcodeState !== true) {
			var zebraEBScanCallBackFn = function(jsonObject) {
				if (jsonObject['data'] == "" || jsonObject['time'] == "") {
					var onFnFail = oModel.getProperty("/callBackHandler/onFnFail");
					if (typeof onFnFail === "function") {
						var zebraEBScanFailResult = {
							text: "Zebra Scan failed",
							resultStatus: "Error"
						};
						if (oModel.getProperty("/callBackHandler/callBackFromSetPhysicalScan")) {
							zebraEBScanFailResult = new Event('scanFailEvent', new EventProvider(), zebraEBScanFailResult);
						}
						onFnFail(zebraEBScanFailResult);
					}
					Log.error("BarcodeScanner.zebraEBScanEnable: Zebra Enterprise Browser Scan Failed");
				} else {
					Log.debug("BarcodeScanner.zebraEBScanEnable: Zebra EB Scan Result: " + jsonObject.data + "; Scan Json: " + JSON.stringify(jsonObject));
					var onFnSuccess = oModel.getProperty("/callBackHandler/onFnSuccess");
					if (typeof onFnSuccess === "function") {
						var oScanningTime = "unknown";
						if (oModel.getProperty("/scanDialog/scanningStartTime") > 0) {
							var scanningStopTime = Date.now();
							oScanningTime = scanningStopTime - oModel.getProperty("/scanDialog/scanningStartTime");
						}
						var zebraEBScanSuccessResult = {
							text: jsonObject.data,
							format: jsonObject.source,
							resultStatus: "Success",
							scanningTime: oScanningTime,
							cancelled: false
						};
						if (oModel.getProperty("/callBackHandler/callBackFromSetPhysicalScan")) {
							zebraEBScanSuccessResult =  new Event('scanSuccessEvent',  new EventProvider(), zebraEBScanSuccessResult);
						}
						onFnSuccess(zebraEBScanSuccessResult);
						oModel.setProperty("/scanDialog/scanningStartTime", 0);
					}
				}
			};
			if (oModel.getProperty("/config/enableGS1Header")) {
				EB.Barcode.codeIdType = EB.Barcode.CODEIDTYPE_AIM;
			} else {
				EB.Barcode.codeIdType = EB.Barcode.CODEIDTYPE_NONE;
			}
			EB.Barcode.enable({}, zebraEBScanCallBackFn);
			oModel.setProperty("/apis/ZebraEnterpriseBrowser/enableBarcodeState", true);
			Log.debug("BarcodeScanner.zebraEBScanEnable: try to enable EB Barcode in (" + (6 - oEnableZebraBarcodeRetryCount) + ") times");
		} else if (oEnableZebraBarcodeRetryCount > 1 && oEnableBarcodeState === 'init') {
			// Because the loading of EB Barcode is async, try to enable EB Barcode API in 6 times.
			oEnableZebraBarcodeRetryCount--;
			oModel.setProperty("/apis/ZebraEnterpriseBrowser/enableZebraBarcodeRetryCount", oEnableZebraBarcodeRetryCount);
			initZebraEB();
			setTimeout(zebraEBScanEnable, 500);
		} else {
			Log.debug("BarcodeScanner.zebraEBScanEnable: The scanner API is not ZebraEnterpriseBrowser or cannot been enabled.");
		}
	}

	function checkZebraEBScanAvailable() {
		var keepCameraScan = oModel.getProperty("/scanDialog/keepCameraScan");
		var zebraEBScanAvailable = false;
		if (getCurrentScannerAPI() === "ZebraEnterpriseBrowser" && isScannerAPIAvailable("ZebraEnterpriseBrowser") && (!keepCameraScan || typeof keepCameraScan !== 'boolean')) {
			zebraEBScanAvailable = true;
		}
		return zebraEBScanAvailable;
	}

	/* =========================================================== */
	/* API methods												 */
	/* =========================================================== */

	/**
	 * Starts the barcode scanning process either showing the live input from the camera or displaying a dialog
	 * to enter the value directly if the barcode scanning feature is unavailable.
	 *
	 * The barcode scanning is done asynchronously. When it is triggered, this function returns without waiting for
	 * the scanning process to finish. The applications have to provide callback functions to react to the events of
	 * a successful scanning, an error during scanning, and the live input on the dialog.
	 *
	 * <code>fnSuccess</code> is passed an object with text, format and cancelled properties. Text is the text representation
	 * of the barcode data, format is the type of the barcode detected, and cancelled is whether or not the user cancelled
	 * the scan. <code>fnError</code> is given the error, <code>fnLiveUpdate</code> is passed the new value entered in the
	 * dialog's input field. An example:
	 *
	 * <pre>
	 * sap.ui.require(["sap/ndc/BarcodeScanner"], function(BarcodeScanner) {
	 * 	BarcodeScanner.scan(
	 *		function (mResult) {
	 *			alert("We got a barcode\n" +
	 *			 	"Result: " + mResult.text + "\n" +
	 *			 	"Format: " + mResult.format + "\n" +
	 *			 	"Cancelled: " + mResult.cancelled);
	 *		},
	 *		function (Error) {
	 *			alert("Scanning failed: " + Error);
	 *		},
	 *		function (mParams) {
	 *			alert("Value entered: " + mParams.newValue);
	 *		},
	 *		"Enter Product Barcode",
	 *		true,
	 *		30,
	 *		1,
	 *		false,
	 *		false
	 * 	);
	 * });
	 * </pre>
	 *
	 * @param {function} [fnSuccess] Function to be called when the scanning is done or cancelled
	 * @param {function} [fnFail] Function to be called when the scanning is failed
	 * @param {function} [fnLiveUpdate] Function to be called when value of the dialog's input is changed
	 * @param {string} [dialogTitle] Defines the barcode input dialog title. If unset, a predefined title will be used.
	 * @param {boolean} [preferFrontCamera] Flag, which defines whether the front or back camera should be used.
	 * @param {float} [frameRate] Defines the frame rate of the camera.
	 * @param {float} [zoom] Defines the zoom of the camera. This parameter is not supported on iOS.
	 * @param {boolean} [keepCameraScan] Flag, which defines whether the camera should be used for scanning in Zebra Enterprise Browser.
	 * @param {boolean} [disableBarcodeInputDialog] Flag, which defines whether the Barcode input dialog should be shown.
	 *
	 * @public
	 * @static
	 */
	BarcodeScanner.scan = function (fnSuccess, fnFail, fnLiveUpdate, dialogTitle, preferFrontCamera, frameRate, zoom, keepCameraScan, disableBarcodeInputDialog) {
		if (!oModel.getProperty("/bReady")) {
			Log.error("BarcodeScanner.scan: Barcode scanning is already in progress.");
			return;
		}
		Log.debug("BarcodeScanner.scan: start to scan barcode.");

		oModel.setProperty("/bReady", false);
		if (typeof fnSuccess === 'function') {
			oModel.setProperty("/callBackHandler/onFnSuccess", fnSuccess);
		} else {
			oModel.setProperty("/callBackHandler/onFnSuccess", null);
		}
		if (typeof fnFail === 'function') {
			oModel.setProperty("/callBackHandler/onFnFail", fnFail);
		} else {
			oModel.setProperty("/callBackHandler/onFnFail", null);
		}
		if (typeof fnLiveUpdate === 'function') {
			oModel.setProperty("/scanDialog/onLiveUpdate", fnLiveUpdate);
		} else {
			oModel.setProperty("/scanDialog/onLiveUpdate", null);
		}
		if (typeof dialogTitle === "string" && dialogTitle != null && dialogTitle.trim() != "") {
			oModel.setProperty("/scanDialog/title", dialogTitle);
		} else {
			oModel.setProperty("/scanDialog/title", oResourceModel.getProperty("BARCODE_DIALOG_TITLE"));
		}
		oModel.setProperty("/scanDialog/scanningStartTime", Date.now());
		oModel.setProperty("/config/preferFrontCamera", preferFrontCamera);
		// Reset frameRate
		if (oModel.getProperty("/config/defaultConstraints/video/frameRate") !== undefined) {
			delete oModel.getProperty("/config/defaultConstraints/video").frameRate;
		}
		// apply value of frameRate parameter
		if (typeof frameRate === "number" && frameRate > 0) {
			oModel.setProperty("/config/defaultConstraints/video/frameRate", frameRate);
		} else if (typeof frameRate !== 'undefined') {
			MessageToast.show(
				oResourceModel.getResourceBundle().getText('BARCODE_DIALOG_CAMERA_UPDATE_PARAMETER_ERROR_MSG', 'frameRate'),
				{
					duration: 1000
				}
			);
		}
		// Reset zoom
		if (oModel.getProperty("/config/defaultConstraints/video/zoom") !== undefined) {
			delete oModel.getProperty("/config/defaultConstraints/video").zoom;
		}
		// apply value of zoom parameter
		if (typeof zoom === "number" && zoom > 0) {
			oModel.setProperty("/config/defaultConstraints/video/zoom", zoom);
		} else if (typeof zoom !== 'undefined') {
			MessageToast.show(
				oResourceModel.getResourceBundle().getText('BARCODE_DIALOG_CAMERA_UPDATE_PARAMETER_ERROR_MSG', 'zoom'),
				{
					duration: 1000
				}
			);
		}
		oModel.setProperty("/scanDialog/keepCameraScan", keepCameraScan);
		oModel.setProperty("/scanDialog/disableBarcodeInputDialog", disableBarcodeInputDialog);
		oModel.checkUpdate(true);

		if (checkZebraEBScanAvailable()) {
			Log.debug("BarcodeScanner.scan: Zebra EB is available, use it to scan barcode.");
			scanWithZebra();
		} else if (isScannerAPIAvailable("Cordova")) {
			Log.debug("BarcodeScanner.scan: Cordova is available, use it to scan barcode.");
			scanWithCordova();
		} else {
			Log.debug("BarcodeScanner.scan: both of Zebra EB and Cordova are NOT available, use ZXingCPP to scan barcode.");
			scanWithZXingCPP();
		}
	};

	/**
	 * Closes the barcode input dialog. It can be used to close the dialog before the user presses the OK or the Cancel button
	 * (e.g. in the fnLiveUpdate callback function of the {@link sap.ndc.BarcodeScanner.scan} method.)
	 *
	 * @public
	 * @static
	 */
	BarcodeScanner.closeScanDialog = function () {
		if (oScanDialog) {
			oScanDialog.close();
			oScanDialog.fireAfterClose();
			oModel.setProperty("/scanDialog/scanningStartTime", 0);
			oModel.setProperty("/scanDialog/onLiveUpdate", null);
		}
		oModel.setProperty("/bReady", true);
		oModel.checkUpdate(true);
	};

	/**
	 * Returns the status model of the Barcode Scanner. It is a JSON model which contains below properties:
	 * <pre>
	 * {
	 *		scannerAPI: "ZXingCPP",
	 *		available: true,
	 *		deviceId: undefined,
	 *		devices: [],
	 *		apis: [
	 *			{
	 *				key: "ZebraEnterpriseBrowser",
	 *				status: "UnAvailable"
	 *			},
	 *			{
	 *				key: "Cordova",
	 *				status: "UnAvailable"
	 *			},
	 *			{
	 *				key: "ZXingCPP",
	 *				status: "Available"
	 *			}
	 *		]
	 *	}
	 * </pre>
	 * '<code>scannerAPI</code>' shows the current scanner API used to scan the Barcode.
	 * '<code>available</code>' indicating whether or not the Barcode Scanner feature is available. It can be used
	 * to bind to the <code>visible</code> property of UI controls which have to be hidden in case the feature is unavailable.
	 * '<code>deviceId</code>' lists the current used camera id of current device. Not working for iOS devices since do not support to get all the cameras.
	 * '<code>devices</code>' lists all the cameras of current device. Not working for iOS devices since do not support to get all the cameras.
	 * '<code>apis</code>' lists scanner APIs with status value. Status value can be: "Initial", "Loading", "Available" or "UnAvailable".
	 *
	 * IMPORTANT: This model just shows current status of Barcode Scanner. Any change to it will not impact Barcode Scanner.
	 *
	 * @returns {sap.ui.model.json.JSONModel} The Barcode Scanner Status Model
	 * @public
	 * @static
	 */
	BarcodeScanner.getStatusModel = function () {
		return oStatusModel;
	};

	/**
	 * Returns the scanner API info that will be used to scan the barcode.
	 *
	 * @returns {string} The Barcode Scanner API info. (e.g. ZebraEnterpriseBrowser, Cordova, ZXingCPP or unknown)
	 * @public
	 * @static
	 */
	BarcodeScanner.getScanAPIInfo = function () {
		return getCurrentScannerAPI();
	};


	/**
	 * Set the scanner API info that will be used to scan the barcode.
	 *
	 * IMPORTANT: The status of the scanner API must be <strong>"Available"</strong>(for ZXingCPP, status is <strong>NOT "UnAvailable"</strong>), or will return False. Scanner APIs with status value can be got by using {@link #getStatusModel}.
	 * By default, Barcode Scanner will select the scanner API(Available) with priority: ZebraEnterpriseBrowser > Cordova > ZXingCPP.
	 *
	 * @param {string} [scannerAPI] Defines the scanner API to scan the barcode. Scanner API can be "ZebraEnterpriseBrowser", "Cordova", "ZXingCPP".
	 * @returns {boolean} Return True if set success.
	 * @public
	 * @static
	 */
	BarcodeScanner.setScanAPIInfo = function (scannerAPI) {
		if (!scannerAPI) {
			Log.error("BarcodeScanner.setScanAPIInfo: scannerAPI is undefined.");
			return false;
		}
		if (getCurrentScannerAPI() !== scannerAPI) {
			// check if the scanner API exists
			var oScannerAPI = oModel.getProperty("/apis/" + scannerAPI);
			if (!oScannerAPI) {
				Log.error("BarcodeScanner.scan: The scanner API '" + scannerAPI + "' doesn't exist, will use current scanner API '" + oModel.getProperty("/apis/" + getCurrentScannerAPI() + "/description") + "' to scan the barcode.");
				return false;
			} else if (scannerAPI === "ZXingCPP") {
				if (isScannerAPIUnAvailable(scannerAPI)) {
					Log.error("BarcodeScanner.scan: The scanner API '" + scannerAPI + "' is unavailable, will use current scanner API '" + oModel.getProperty("/apis/" + getCurrentScannerAPI() + "/description") + "' to scan the barcode.");
					return false;
				} else {
					Log.debug("BarcodeScanner.scan: Switch to scanner API '" + scannerAPI + "' to scan the barcode.");
					setCurrentScannerAPI(scannerAPI);
					return true;
				}
			} else if (!isScannerAPIAvailable(scannerAPI)) {
				Log.error("BarcodeScanner.scan: The scanner API '" + scannerAPI + "' is unavailable, will use current scanner API '" + oModel.getProperty("/apis/" + getCurrentScannerAPI() + "/description") + "' to scan the barcode.");
				return false;
			} else {
				Log.debug("BarcodeScanner.scan: Switch to scanner API '" + scannerAPI + "' to scan the barcode.");
				setCurrentScannerAPI(scannerAPI);
				return true;
			}
		} else {
			Log.debug("BarcodeScanner.setScanAPIInfo: '" + scannerAPI + "' is already current scanner API. It need not to be changed.");
			return true;
		}
	};

	/**
	 * Set the callback function for the physical scan button.
	 *
	 * @param {function} [fnPhysicalScan] Function to be called when the scanning is done by pressing physical scan button.
	 *
	 * @public
	 * @static
	 */
	BarcodeScanner.setPhysicalScan = function (fnPhysicalScan) {
		if (typeof fnPhysicalScan === "function") {
			oModel.setProperty("/callBackHandler/callBackFromSetPhysicalScan", true);
			oModel.setProperty("/callBackHandler/onFnSuccess", fnPhysicalScan);
			oModel.setProperty("/callBackHandler/onFnFail", fnPhysicalScan);
			if (Device.os.android) {
				// reset Zebra EB after go back current page
				jQuery(document).on("visibilitychange", function() {
					if (document.visibilityState === 'visible') {
						initZebraEB();
						zebraEBScanEnable();
					}
				});
			} else {
				setScannerAPIUnAvailable("ZebraEnterpriseBrowser");
				Log.debug("BarcodeScanner.setPhysicalScan: Not Android device, Zebra Enterprise Browser plugin is unavailable!");
			}
		} else {
			Log.debug("setPhysicalScan is failed.");
		}
	};

	/**
	 * Set the configs of the control Barcode Scanner.
	 *
	 * @param {object} [options] The options are the configs that will be used to scan. It is a object which contains below key and value:
	 * 	{
	 * 		"enableGS1Header": true,  //If set to true, add the symbology identifier (GS1 specification 5.4.3.7. and 5.4.6.4.) as prefix into the result text
	 * 		"deviceId": "string" // The specific camera id to scan the Barcode. If set to "", Barcode Scanner will use default camera. This option is not working for iOS devices since do not support to get all the cameras.
	 * 	}
	 *
	 * @public
	 * @static
	 */
	BarcodeScanner.setConfig = function (options) {
		if (typeof options === "object" && Object.keys(options).length > 0) {
			var oConfig = oModel.getProperty("/config");
			for (var oKey in options) {
				if (oConfig.hasOwnProperty(oKey)) {
					oConfig[oKey] = options[oKey];
					if (checkZebraEBScanAvailable() && oKey === "enableGS1Header") {
						oModel.setProperty("/apis/ZebraEnterpriseBrowser/enableBarcodeState", false);
						EB.Barcode.disable(zebraEBScanEnable);
					}
					if (oKey === "deviceId") {
						oStatusModel.setProperty("/deviceId", options[oKey]);
					}
					Log.debug("The parameter(" + oKey + ") has been changed.");
				} else {
					Log.error("The parameter(" + oKey + ") is unavailable.");
				}
			}
			oModel.setProperty("/config", oConfig);
		} else {
			Log.error("The options are not available.");
		}
	};

	init();	//must be called to enable control if no feature vector is available.
	return BarcodeScanner;

}, /* bExport= */ true);