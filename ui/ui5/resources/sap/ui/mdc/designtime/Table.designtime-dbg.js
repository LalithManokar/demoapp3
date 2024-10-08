/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

// Provides the Design Time Metadata for the sap.m.Table control
sap.ui.define([
	"sap/ui/mdc/TableSettings"
], function(TableSettings) {
	"use strict";

	return {
		name: "{name}",
		description: "{description}",
		aggregations: {
			// UI Adaptation crashes if one uses the altType string instead of a ManagedObject for aggregations.
			// As a workround we ingore these aggregations for now.
			type: {
				ignore: true
			},
			_content: {
				domRef: ":sap-domref",
				ignore: false,
				propagateRelevantContainer: true,
				propagateMetadata: function(oElement) {
					// Disable RTA for all other UI5 table related code
					if (oElement.isA([
						"sap.m.Column", "sap.ui.table.Column"
					])) {
						return {
							actions: {
								remove: {
									changeType: "removeMDCColumn",
									changeOnRelevantContainer: true
								}
							}
						};
					} else if (oElement.isA([
						"sap.ui.mdc.Table", "sap.ui.table.Table", "sap.m.Table", "sap.m.OverflowToolbar"
					])) {
						return {
							actions: {
								settings: {
									// TODO: check if default is ok
									"default": {
										handler: function(oControl, mPropertyBag) {
											// TODO: only show settings on the table
											var oMDCTable = oControl;
											while (oMDCTable) {
												if (oMDCTable.isA("sap.ui.mdc.Table")) {
													break;
												}
												oMDCTable = oMDCTable.getParent();
											}
											if (oMDCTable) {
												return TableSettings.showPanel(oMDCTable, "Columns", mPropertyBag.eventItem, true);
											}
										},
										changeOnRelevantContainer: true
									}
								}
							}
						};
					}
					return {
						actions: null
					};
				}

			}
		}
	};

}, /* bExport= */false);
