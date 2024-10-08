/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/Element'
], function (Element) {
	"use strict";

	/**
	 * Constructor for a new ChartPanelItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The type for the <code>items</code> aggregation in the <code>ChartDialog</code> control.
	 * @extends sap.ui.core.Element
	 * @version 1.71.61
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.base.personalization.ChartPanelItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ChartPanelItem = Element.extend("sap.ui.mdc.base.personalization.ChartPanelItem", /** @lends sap.ui.mdc.base.personalization.ChartPanelItem.prototype */
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
					 * The key of the role corresponding to the <code>availableRoles</code> aggregation.
					 */
					roleKey: {
						type: "string",
						invalidate: true
					},
					/**
					 * Defines the visibility of the item.
					 */
					visible: {
						type: "boolean",
						defaultValue: false
					},
					/**
					 * The type to be displayed for the item.
					 */
					type: {
						type: "string"
					}
				},
				defaultAggregation: "availableRoles",
				aggregations: {
					/**
					 * Defines the available roles of an item, such as Category or Axis.
					 */
					availableRoles: {
						type: "sap.ui.core.Item",
						multiple: true,
						singularName: "availableRole",
						invalidate: true
					}
				}
			}
		});

	return ChartPanelItem;

}, /* bExport= */true);
