/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
sap.ui.define(["sap/apf/ui/representations/BaseVizFrameChartRepresentation","sap/apf/core/constants"],function(B,c){"use strict";var d=function(a,p){sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this,[a,p]);this.type=sap.apf.ui.utils.CONSTANTS.representationTypes.DONUT_CHART;this.chartType=sap.apf.ui.utils.CONSTANTS.vizFrameChartTypes.DONUT;};d.prototype=Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);d.prototype.getAxisFeedItemId=function(k){var s=sap.apf.core.constants.representationMetadata.kind;var a;switch(k){case s.SECTORCOLOR:a=sap.apf.core.constants.vizFrame.feedItemTypes.COLOR;break;case s.SECTORSIZE:a=sap.apf.core.constants.vizFrame.feedItemTypes.SIZE;break;default:break;}return a;};return d;},true);
