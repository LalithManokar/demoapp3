/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
sap.ui.define([
    "sap/apf/ui/representations/BaseVizFrameChartRepresentation",
    "sap/apf/core/constants"
], function(BaseVizFrameChartRepresentation, constants) {
    "use strict";

	var donutChart = function(oApi, oParameters) {
		sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this, [ oApi, oParameters ]);
		this.type = sap.apf.ui.utils.CONSTANTS.representationTypes.DONUT_CHART;
		this.chartType = sap.apf.ui.utils.CONSTANTS.vizFrameChartTypes.DONUT;
	};

	donutChart.prototype = Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);
	//Set the "constructor" property to refer to donutChart
	//sap.apf.ui.representations.donutChart.prototype.constructor = sap.apf.ui.representations.donutChart;
	donutChart.prototype.getAxisFeedItemId = function(sKind) {
		var oSupportedTypes = sap.apf.core.constants.representationMetadata.kind;
		var axisfeedItemId;
		switch (sKind) {
			case oSupportedTypes.SECTORCOLOR:
				axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.COLOR;
				break;
			case oSupportedTypes.SECTORSIZE:
				axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.SIZE;
				break;
			default:
				break;
		}
		return axisfeedItemId;
	};
	return donutChart;
}, true);