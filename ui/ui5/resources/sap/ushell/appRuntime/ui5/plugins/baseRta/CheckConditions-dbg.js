/*!
 * Copyright (c) 2009-2017 SAP SE, All Rights Reserved
 */

sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils"
], function (
	UriParameters,
	AppLifeCycleUtils
) {
	"use strict";

	var CheckConditions = {

		// determine manifest out of found component
		_getAppDescriptor: function (oComponent) {
			if (oComponent && oComponent.getMetadata) {
				var oComponentMetaData = oComponent.getMetadata();
				if (oComponentMetaData && oComponentMetaData.getManifest) {
					return oComponentMetaData.getManifest();
				}
			}
			return {};
		},

		/**
		 * Checks if RTA needs to be restarted, e.g after 'Reset to default'.
		 * The sap.ui.fl library also reacts on the session storage entry and may start RTA
		 * as well as remove the entry before this function is called.
		 * @param {string} sLayer - Object with information about the current application
		 * @returns {boolean} Returns <code>true</code> if RTA restart is required.
		 * @private
		 */
		checkRestartRTA: function (sLayer) {
			var oUriParams = new UriParameters(window.location.href);
			var sUriLayer = oUriParams.get("sap-ui-layer");
			// if a layer is given in the URI it has priority over the config
			sLayer = sUriLayer || sLayer;

			var bRestart = !!window.sessionStorage.getItem("sap.ui.rta.restart." + sLayer);
			if (bRestart) {
				window.sessionStorage.removeItem("sap.ui.rta.restart." + sLayer);
			}
			return bRestart;
		},

		/**
		 * Checks if adaptation is enabled via the flex enabled flag into app descriptor.
		 * @returns {boolean} Returns <code>true</code> if flex is enabled.
		 * @private
		 */
		checkFlexEnabledOnStart: function () {
			var oCurrentRunningApp = AppLifeCycleUtils.getCurrentRunningApplication(),
				oRootComponent = oCurrentRunningApp.componentInstance,
				mAppDescriptor = this._getAppDescriptor(oRootComponent),
				vFlexEnabled = mAppDescriptor["sap.ui5"] && mAppDescriptor["sap.ui5"].flexEnabled;
			return vFlexEnabled !== false;
		},

		/**
		 * Check if we are in a SAPUI5 application.
		 * @returns {Boolean} Returns <code>true</code> if we are in a SAPUI5 application.
		 * @private
		 */
		checkUI5App: function () {
			var oCurrentApplication = AppLifeCycleUtils.getCurrentRunningApplication();
			var bIsUI5App = oCurrentApplication && oCurrentApplication.applicationType === "UI5";
			return bIsUI5App;
		}
	};

	return CheckConditions;
}, true);
