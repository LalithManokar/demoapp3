/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/mdc/MetadataDelegate"], function(BaseDelegate) {
	"use strict";

	/**
	 * @experimental
	 * @private
	 * @since 1.61
	 * @alias sap.ui.mdc.chart.MetadataDelegate
	 */
	var MetadataDelegate = BaseDelegate.extend("sap.ui.mdc.chart.MetadataDelegate", {
		retrieveAllMetadata: function() {
			return {};
		},
		retrieveAggregationItem: function (sAggregationName, sPropertyKey) {
			return null;
		},
		preConfiguration: function(oNode, oVisitor) {
			return oNode;
		},
		getNavigationTargets: function(oField) {
			return [];
		}
	});

	return MetadataDelegate;
});
