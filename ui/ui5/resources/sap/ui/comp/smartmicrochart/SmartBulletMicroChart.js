/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/comp/library","sap/ui/core/Control","sap/suite/ui/microchart/library","sap/suite/ui/microchart/BulletMicroChart","sap/suite/ui/microchart/BulletMicroChartData","sap/m/library","sap/ui/comp/smartmicrochart/SmartMicroChartBase","./SmartMicroChartRenderer"],function(l,C,M,B,a,b,S){"use strict";var V=b.ValueColor;var c=S.extend("sap.ui.comp.smartmicrochart.SmartBulletMicroChart",{metadata:{library:"sap.ui.comp",designtime:"sap/ui/comp/designtime/smartmicrochart/SmartBulletMicroChart.designtime",properties:{enableAutoBinding:{type:"boolean",group:"Misc",defaultValue:false}}},renderer:"sap.ui.comp.smartmicrochart.SmartMicroChartRenderer"});c._CRITICAL_COLOR=V.Critical;c._ERROR_COLOR=V.Error;c.prototype._CHART_TYPE=["Bullet"];c.prototype.init=function(){this._bIsInitialized=false;this._bMetaModelLoadAttached=false;this.setProperty("chartType","Bullet",true);this.setAggregation("_chart",new B({"showValueMarker":true}),true);};c.prototype.setShowLabel=function(s){if(this.getShowLabel()!==s){this.setProperty("showLabel",s,true);var o=this.getAggregation("_chart");o.setProperty("showActualValue",s,true);o.setProperty("showTargetValue",s,true);o.setProperty("showDeltaValue",s,true);o.setProperty("showValueMarker",s,true);this.invalidate();}return this;};c.prototype.onBeforeRendering=function(){var o=this.getAggregation("_chart");o.setSize(this.getSize(),true);o.setWidth(this.getWidth(),true);o.setHeight(this.getHeight(),true);};c.prototype._createAndBindInnerChart=function(){this._bindValueProperties();this._bindActualValue();this._bindChartThresholds();this._updateAssociations.call(this);this._setMode();};c.prototype._setMode=function(){if(this._hasMember(this,"_oDataPointAnnotations.Visualization.EnumMember")){if(this._oDataPointAnnotations.Visualization.EnumMember===S._DELTABULLET){this.getAggregation("_chart").setMode(M.BulletMicroChartModeType.Delta);}}};c.prototype._bindValueProperties=function(){var m,f,i=this.getAggregation("_chart");if(this._hasMember(this,"_oDataPointAnnotations.TargetValue.Path")){i.bindProperty("targetValue",{path:this._oDataPointAnnotations.TargetValue.Path,type:"sap.ui.model.odata.type.Decimal"});var F=this._getLabelNumberFormatter.call(this,this._oDataPointAnnotations.TargetValue.Path);i.bindProperty("targetValueLabel",{path:this._oDataPointAnnotations.TargetValue.Path,formatter:F.format.bind(F)});}if(this._hasMember(this,"_oDataPointAnnotations.ForecastValue.Path")){i.bindProperty("forecastValue",{path:this._oDataPointAnnotations.ForecastValue.Path,type:"sap.ui.model.odata.type.Decimal"});}if(this._oDataPointAnnotations.MaximumValue){if(this._oDataPointAnnotations.MaximumValue.hasOwnProperty("Path")){i.bindProperty("maxValue",{path:this._oDataPointAnnotations.MaximumValue.Path,type:"sap.ui.model.odata.type.Decimal"});}else if(this._oDataPointAnnotations.MaximumValue.hasOwnProperty("Decimal")){m=parseFloat(this._oDataPointAnnotations.MaximumValue.Decimal);i.setMaxValue(m,true);}}if(this._oDataPointAnnotations.MinimumValue){if(this._oDataPointAnnotations.MinimumValue.hasOwnProperty("Path")){i.bindProperty("minValue",{path:this._oDataPointAnnotations.MinimumValue.Path,type:"sap.ui.model.odata.type.Decimal"});}else if(this._oDataPointAnnotations.MinimumValue.hasOwnProperty("Decimal")){f=parseFloat(this._oDataPointAnnotations.MinimumValue.Decimal);i.setMinValue(f,true);}}};c.prototype._bindActualValue=function(){var i=this.getAggregation("_chart"),f=this._getLabelNumberFormatter.call(this,this._oDataPointAnnotations.Value.Path);var o=new a({value:{path:this._oDataPointAnnotations.Value.Path,type:"sap.ui.model.odata.type.Decimal"},color:{parts:[this._oDataPointAnnotations.Value&&this._oDataPointAnnotations.Value.Path||"",this._oDataPointAnnotations.Criticality&&this._oDataPointAnnotations.Criticality.Path||""],formatter:this._getValueColor.bind(this)}});i.setAggregation("actual",o,true);i.bindProperty("actualValueLabel",{path:this._oDataPointAnnotations.Value.Path,formatter:f.format.bind(f)});};c.prototype._bindChartThresholds=function(){var d,o;if(this._hasMember(this._oDataPointAnnotations,"CriticalityCalculation.ImprovementDirection.EnumMember")){o=this._oDataPointAnnotations.CriticalityCalculation;d=o.ImprovementDirection.EnumMember;if(d!==S._MINIMIZE&&o.DeviationRangeLowValue&&o.DeviationRangeLowValue.Path){this._bindThresholdAggregation(o.DeviationRangeLowValue.Path,c._ERROR_COLOR);}if(d!==S._MINIMIZE&&o.ToleranceRangeLowValue&&o.ToleranceRangeLowValue.Path){this._bindThresholdAggregation(o.ToleranceRangeLowValue.Path,c._CRITICAL_COLOR);}if(d!==S._MAXIMIZE&&o.ToleranceRangeHighValue&&o.ToleranceRangeHighValue.Path){this._bindThresholdAggregation(o.ToleranceRangeHighValue.Path,c._CRITICAL_COLOR);}if(d!==S._MAXIMIZE&&o.DeviationRangeHighValue&&o.DeviationRangeHighValue.Path){this._bindThresholdAggregation(o.DeviationRangeHighValue.Path,c._ERROR_COLOR);}}};c.prototype._bindThresholdAggregation=function(p,s){var t=new a({value:{path:p,type:"sap.ui.model.odata.type.Decimal"},color:s});this.getAggregation("_chart").addAggregation("thresholds",t,true);};return c;});
