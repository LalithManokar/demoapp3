/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.dvl.GraphicsCoreApi.
sap.ui.define([], function() {
	"use strict";

	/**
	 * The types of APIs supported by the {@link sap.ui.vk.dvl.GraphicsCore} class.
	 *
	 * @enum {string}
	 * @readonly
	 * @public
	 */
	var GraphicsCoreApi = {
		/**
		 * The legacy DVL API implemented in the com.sap.ve.dvl library (dvl.js).
		 * @public
		 */
		LegacyDvl: "LegacyDvl"
	};

	return GraphicsCoreApi;

}, /* bExport= */ true);
