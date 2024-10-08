/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/Element'
], function (Element) {
	"use strict";

	/**
	 * Constructor for a new SortPanelItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The type for the <code>items</code> aggregation in the <code>SortPanel</code> control.
	 * @extends sap.ui.core.Element
	 * @version 1.71.61
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.base.personalization.SortPanelItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SortPanelItem = Element.extend("sap.ui.mdc.base.personalization.SortPanelItem", /** @lends sap.ui.mdc.base.personalization.SortPanelItem.prototype */
		{
			metadata: {
				library: "sap.ui.mdc",
				properties: {
					/**
					 * The unique name of the item.
					 */
					name: {
						type: "string"
					},
					/**
					 * The label to be displayed for the item.
					 */
					label: {
						type: "string"
					},
					/**
					 * The tooltip to be displayed for the item.
					 */
					tooltip: {
						type: "string"
					},
					/**
					 * The sort order to be displayed for the item.
					 */
					sortOrder: {
						type: "string"
					},
					/**
					 * Defines the selection of the item.
					 */
					selected: {
						type: "boolean",
						defaultValue: false
					}
				}
			}
		});

	return SortPanelItem;

}, /* bExport= */true);
