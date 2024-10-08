/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.tools.CoordinateSystem.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Sets the coordinate system type.
	 * @enum {string}
	 * @readonly
	 * @public
	 */
	var CoordinateSystem = {
		/**
		 * Local coordinate system
		 * @public
		 */
		Local: "Local",
		/**
		 * World coordinate system
		 * @public
		 */
		World: "World",
		/**
		 * Screen coordinate system
		 * @public
		 */
		Screen: "Screen",
		/**
		 * Custom coordinate system, defined by anchor point tool
		 * @public
		 */
		Custom: "Custom"
	};

	return CoordinateSystem;

}, /* bExport= */ true);
