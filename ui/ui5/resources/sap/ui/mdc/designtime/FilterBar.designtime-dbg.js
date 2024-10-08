/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */

// Provides the Design Time Metadata for the sap.ui.mdc.FilterBar control
sap.ui.define([], function() {
	"use strict";

	return {
		name: "{name}",
		description: "{description}",
		aggregations: {
			_content: {
				domRef: ":sap-domref",
				ignore: false,
				propagateRelevantContainer: true,
				propagateMetadata: function(oElement) {

					// Disable RTA for all other controls
					if (oElement.isA("sap.ui.mdc.FilterBar")) {
						return {
							actions: {
								addFilter: {
									changeType: "addFilter",
									changeOnRelevantContainer: true
								},
								removeFilter: {
									changeType: "removeFilter",
									changeOnRelevantContainer: true
								},
								setFilterPosition: {
									changeType: "setFilterPosition",
									changeOnRelevantContainer: true
								},
								addCondition: {
									changeType: "addCondition",
									changeOnRelevantContainer: true
								},
								removeCondition: {
									changeType: "removeCondition",
									changeOnRelevantContainer: true
								}
							}
						};

					} else if (oElement.isA("sap.ui.mdc.FilterField")) {
						return {
							actions: {
								settings: {
									handler: function(oControl, mPropertyBag) {
										// TODO: test only -> to be fixed!
										var oMDCFilterBar = mPropertyBag.contextElement.getParent().getParent();
										oMDCFilterBar.setMetadataDelegate("sap/ui/mdc/odata/v4/FilterBarDelegate");
										return oMDCFilterBar.showFiltersDialog();
									},
									changeOnRelevantContainer: true
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
