/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new SelectOption.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for...
	 * @extends sap.ui.core.Element
	 * @version 1.71.61
	 * @constructor
	 * @private
	 * @since 1.61.0
	 * @alias sap.ui.mdc.base.state.SelectOption
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectOption = Element.extend("sap.ui.mdc.base.state.SelectOption", /** @lends sap.ui.mdc.base.state.SelectOption.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Name of property
				 */
				propertyName: {
					type: "string"
				}
			}
		}
	});

	return SelectOption;

}, /* bExport= */true);
