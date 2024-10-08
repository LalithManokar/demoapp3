/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Creates a new instance of an UiState class.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version 1.71.61
	 * @constructor
	 * @private
	 * @since 1.61
	 * @alias sap.ui.mdc.base.state.UiState
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UiState = Element.extend("sap.ui.mdc.base.state.UiState", /** @lends sap.ui.mdc.base.state.UiState.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			aggregations: {
				/**
				 * Select Options
				 */
				selectOptions: {
					type: "sap.ui.mdc.base.state.SelectOption",
					multiple: true,
					singularName: "selectOption"
				}
			}
		}
	});

	return UiState;
}, /* bExport= */true);
