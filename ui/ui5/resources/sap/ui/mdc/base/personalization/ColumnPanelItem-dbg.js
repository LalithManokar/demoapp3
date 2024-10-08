/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/Element'
], function (Element) {
	"use strict";

	/**
	 * Constructor for a new ColumnPanelItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The type for the <code>items</code> aggregation in the <code>ChartDialog</code> control.
	 * @extends sap.ui.core.Element
	 * @version 1.71.61
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.base.personalization.ColumnPanelItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnPanelItem = Element.extend("sap.ui.mdc.base.personalization.ColumnPanelItem", /** @lends sap.ui.mdc.base.personalization.ColumnPanelItem.prototype */
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
					 * Defines the visibility of the item.
					 */
					visible: {
						type: "boolean",
						defaultValue: false
					}
				}
			}
		});

	return ColumnPanelItem;

}, /* bExport= */true);
