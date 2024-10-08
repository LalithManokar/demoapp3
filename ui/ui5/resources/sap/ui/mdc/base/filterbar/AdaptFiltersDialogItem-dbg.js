/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new AdaptFiltersDialogItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class tbd
	 * @extends sap.ui.core.Element
	 * @version 1.71.61
	 * @constructor
	 * @abstract
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.base.filterbar.AdaptFiltersDialogItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AdaptFiltersDialogItem = Element.extend("sap.ui.mdc.base.filterbar.AdaptFiltersDialogItem", /** @lends sap.ui.mdc.base.filterbar.AdaptFiltersDialogItem.prototype */
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
					 * Defines if the item is mandatory
					 */
					required: {
						type: "boolean"
					},
					/**
					 * Defines visibility of the item.
					 */
					visible: {
						type: "boolean",
						defaultValue: false
					},
					/**
					 * Defines the position of the columns.
					 */
					relativePosition: {
						type: "int"
					}
				},
				defaultAggregation: "controls",
				aggregations: {
					/**
					 * Defines the controls.
					 */
					controls: {
						type: "sap.ui.core.Control",
						multiple: true,
						singularName: "control"
					}
				}
			}
		});

	return AdaptFiltersDialogItem;

}, /* bExport= */true);
