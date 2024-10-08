/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/Element'
], function (Element) {
	"use strict";

	/**
	 * Constructor for a new FilterPanelItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The type for the <code>items</code> aggregation in the <code>FilterPanel</code> control.
	 * @extends sap.ui.core.Element
	 * @version 1.71.61
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.base.personalization.FilterPanelItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FilterPanelItem = Element.extend("sap.ui.mdc.base.personalization.FilterPanelItem", /** @lends sap.ui.mdc.base.personalization.FilterPanelItem.prototype */
		{
			metadata: {
				library: "sap.ui.mdc",
				properties: {
					/**
					 * The unique key of the item.
					 */
					key: {
						type: "string"
					},
					/**
					 * The text to be displayed for the item.
					 */
					text: {
						type: "string"
					},
					/**
					 * The tooltip to be displayed for the item.
					 */
					tooltip: {
						type: "string"
					},
					/**
					 * Defines whether the item is marked as mandatory.
					 */
					required: {
						type: "boolean",
						defaultValue: false
					}
				},
				defaultAggregation: "controls",
				aggregations: {
					/**
					 * Defines the controls to be displayed for the item.
					 */
					controls: {
						type: "sap.ui.core.Control",
						multiple: true,
						singularName: "control"
					}
				}
			}
		});

	return FilterPanelItem;

}, /* bExport= */true);
