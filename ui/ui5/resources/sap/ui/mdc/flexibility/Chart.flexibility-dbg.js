/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/mdc/changehandler/SetFilterValue', 'sap/ui/mdc/flexibility/SortFlex', 'sap/ui/mdc/flexibility/ChartItem'
], function (SetFilterValue, Sort, ChartItem) {
	"use strict";
	/**
	 * Chart-control-specific change handler that enables the storing of changes in the layered repository of the flexibility services.
	 *
	 * @alias sap.ui.mdc.flexibility.Chart
	 * @author SAP SE
	 * @version 1.71.61
	 */
	return {
		addItem: ChartItem.addItem,
		removeItem: ChartItem.removeItem,
		"setChartType": {
			layers: {
				USER: true
			},
			changeHandler: {
				createChange: function (mPropertyBag) {
					if (!mPropertyBag.control) {
						throw new Error("Invalid control. The existing control object is mandatory");
					}
					return {
						selectorElement: mPropertyBag.control,
						changeSpecificData: {
							changeType: "setChartType",
							content: {
								chartType: mPropertyBag.chartType
							}
						}
					};
				},
				completeChangeContent: function (oChange, mSpecificChangeInfo) {
				},
				applyChange: function (oChange, oChart, mPropertyBag) {
					// First store the old value for revert
					oChange.setRevertData(mPropertyBag.modifier.getProperty(oChart, "chartType"));
					// Then set the new value
					mPropertyBag.modifier.setProperty(oChart, "chartType", oChange.getContent().chartType);
				},
				revertChange: function (oChange, oChart, mPropertyBag) {
					mPropertyBag.modifier.setProperty(oChart, "chartType", oChange.getRevertData());
					oChange.resetRevertData();
				}
			}
		},
		"setFilterValue": {
			layers: {
				USER: true
			},
			changeHandler: SetFilterValue
		},
		removeSort: Sort.removeSort,
		addSort: Sort.addSort

	};
}, /* bExport= */true);
