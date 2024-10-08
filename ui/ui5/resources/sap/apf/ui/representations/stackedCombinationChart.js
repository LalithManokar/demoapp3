/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2018 SAP SE. All rights reserved
*/
sap.ui.define(["sap/apf/core/constants","sap/apf/ui/utils/constants","sap/apf/ui/representations/BaseVizFrameChartRepresentation"],function(c,u,B){"use strict";var S=function(a,p){sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this,[a,p]);this.type=u.representationTypes.STACKED_COMBINATION_CHART;this.chartType=u.vizFrameChartTypes.STACKED_COMBINATION;};S.prototype=Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);S.prototype.getAxisFeedItemId=function(k){var s=c.representationMetadata.kind;var a;switch(k){case s.XAXIS:a=c.vizFrame.feedItemTypes.CATEGORYAXIS;break;case s.LEGEND:a=c.vizFrame.feedItemTypes.COLOR;break;case s.YAXIS:a=c.vizFrame.feedItemTypes.VALUEAXIS;break;default:break;}return a;};sap.apf.ui.representations.stackedCombinationChart=S;return S;},true);
