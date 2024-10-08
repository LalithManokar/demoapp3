/*!
 * Copyright (c) 2009-2017 SAP SE, All Rights Reserved
 */

sap.ui.define([
	"sap/base/util/ObjectPath"
], function (
	ObjectPath
) {
	"use strict";


	var AppLifeCycleUtils = {

		getAppLifeCycleService: function () {
			var oContainer = AppLifeCycleUtils.getContainer();
			return oContainer.getService("AppLifeCycle");
		},

		getContainer: function () {
			var oContainer = ObjectPath.get("sap.ushell.Container");
			if (!oContainer) {
				throw new Error(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			}
			return oContainer;
		},

		/**
		 * Gets the current root application.
		 * @returns {object} Returns the currently running application
		 * @private
		 */
		getCurrentRunningApplication: function () {
			var oAppLifeCycleService = AppLifeCycleUtils.getAppLifeCycleService();
			return oAppLifeCycleService.getCurrentApplication();
		}
	};

	return AppLifeCycleUtils;
});
