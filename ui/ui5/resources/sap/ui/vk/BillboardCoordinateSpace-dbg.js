/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.BillboardCoordinateSpace.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Billboard coordinate space for {@link sap.ui.vk.threejs.Billboard}.
	 * @enum {string}
	 * @readonly
	 * @public
	 */
	var BillboardCoordinateSpace = {
		Viewport: "Viewport", // billboard only
		Screen: "Screen",     // billboard only
		World: "World"        // callout only
	};

	return BillboardCoordinateSpace;

}, /* bExport= */ true);
