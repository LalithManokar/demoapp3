sap.ui.define([
	"sap/ui/core/Control",
	"sap/suite/ui/microchart/ColumnMicroChart",
	"sap/suite/ui/microchart/AreaMicroChart",
	"sap/suite/ui/microchart/ComparisonMicroChart",
	"sap/suite/ui/microchart/HarveyBallMicroChart",
	"sap/suite/ui/microchart/RadialMicroChart"
], function (Control, ColumnMicroChart, AreaMicroChart, ComparisonMicroChart, HarveyBallMicroChart, RadialMicroChart) {
	"use strict";
	
	var mColor = ["Good", "Error", "Critical", "Neutral"];

	return Control.extend("sap.ino.controls.ReportMicroChart", {

		metadata: {
			properties: {
				chartType: {type: "string", defaultValue: "Column"}
			},
			aggregations: {
				_chart: {multiple: false, visibility: "hidden"}
			},
			events: {
			}
		},

		init: function () {
			//this.setAggregation("_chart", this._createChart());
			sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");
		},
		
		_createChart: function() {
			var oChart;

			switch (this.getProperty("chartType")) {
				case "Column":
					oChart = new ColumnMicroChart();
					break;
				case "Area":
					oChart = new AreaMicroChart({
						width: "160px",
						height: "120px"
					});
					break;
				case "Comparison":
					oChart = new ComparisonMicroChart();
					break;
				case "HarveyBall":
					oChart = new HarveyBallMicroChart({
						total: 100,
						totalScale: " ",
						showFractions: true
					});
					break;
				case "Radial":
					oChart = new RadialMicroChart();
					break;
				default:
					oChart = new ColumnMicroChart();
					break;
			}
			
			return oChart;
		},
		
		addChartItems: function(aData, oTileConfiguration) {
		    var oChart = this.getAggregation("_chart");
			var sMicroChartType = oTileConfiguration.Chart.Type;
			this.getAggregation("_chart").setTooltip(this._createChartTooltip(aData, oTileConfiguration));

			switch (sMicroChartType) {
				case "Column":
					jQuery.each(aData, function(iIndex, oResult) {
						oChart.addColumn(new sap.suite.ui.microchart.ColumnMicroChartData({
							color: mColor[iIndex % 4],
							label: oResult[oTileConfiguration.Dimensions[0]],
							value: oResult[oTileConfiguration.Measures[0]]
						}));
					});
					break;
				case "Area":
					var oAreaMicroChartItem = new sap.suite.ui.microchart.AreaMicroChartItem({
						color: "Good"
					});
					var iXLength = 100 / aData.length;
					jQuery.each(aData, function(iIndex, oResult) {
						oAreaMicroChartItem.addPoint(new sap.suite.ui.microchart.AreaMicroChartPoint({
							x: iXLength * iIndex,
							y: oResult[oTileConfiguration.Measures[0]]
						}));
					});
					oChart.addLine(oAreaMicroChartItem);
					break;
				case "Comparison":
					jQuery.each(aData, function(iIndex, oResult) {
						oChart.addData(new sap.suite.ui.microchart.ComparisonMicroChartData({
							color: mColor[iIndex % 4],
							title: oResult[oTileConfiguration.Dimensions[0]],
							value: oResult[oTileConfiguration.Measures[0]]
						}));
					});
					break;
				case "HarveyBall":
					var fTotal = 0;

					jQuery.each(aData, function(iIndex, oResult) {
						oChart.addItem(new sap.suite.ui.microchart.HarveyBallMicroChartItem({
							color: "Good",
							fractionLabel: oResult[oTileConfiguration.Dimensions[0]],
							fraction: oResult[oTileConfiguration.Measures[0]],
							fractionScale: " "
						}));

						fTotal += oResult[oTileConfiguration.Measures[0]];
					});

					if (fTotal) {
						oChart.setTotal(fTotal);
					}
					break;
				case "Radial":
					var fRadialTotal = 0;
					jQuery.each(aData, function(iIndex, oData) {
						fRadialTotal += oData[oTileConfiguration.Measures[0]];
					});

					oChart.setTotal(fRadialTotal);
					oChart.setFraction(aData[0][oTileConfiguration.Measures[0]]);
					oChart.setValueColor("Good");
					break;
				case "TopList":
					aData.sort(function(a, b) {
						return b[oTileConfiguration.Measures[0]] - a[oTileConfiguration.Measures[0]];
					});
					var iCount = aData.length < 3 ? aData.length : 3;
					for (var i = 0; i < iCount; i++) {
						oChart.addColumn(new sap.suite.ui.microchart.ColumnMicroChartData({
							color: mColor[i % 4],
							label: aData[i][oTileConfiguration.Dimensions[0]],
							value: aData[i][oTileConfiguration.Measures[0]]
						}));
					}
					break;
				default:
					jQuery.each(aData, function(iIndex, oResult) {
						oChart.addColumn(new sap.suite.ui.microchart.ColumnMicroChartData({
							color: mColor[iIndex % 4],
							label: oResult[oTileConfiguration.Dimensions[0]],
							value: oResult[oTileConfiguration.Measures[0]]
						}));
					});
					break;
			}
		},
		
		_createChartTooltip: function(aData, oTileConfiguration) {
			var sTooltip = "";

			if (oTileConfiguration.Content === "TopList") {
				aData.sort(function(a, b) {
					return b[oTileConfiguration.Measures[0]] - a[oTileConfiguration.Measures[0]];
				});
				var iCount = aData.length < 3 ? aData.length : 3;
				for (var i = 0; i < iCount; i++) {
					sTooltip += aData[i][oTileConfiguration.Dimensions[0]] + " " + aData[i][oTileConfiguration.Measures[0]];
					sTooltip += (i !== iCount - 1) ? "\n" : "";
				}
			} else {
				jQuery.each(aData, function(iIndex, oResult) {
					sTooltip += oResult[oTileConfiguration.Dimensions[0]] + " " + oResult[oTileConfiguration.Measures[0]];
					sTooltip += (iIndex !== aData.length) ? "\n" : "";
				});
			}

			return sTooltip;
		},
		
		renderer: function (oRM, oControl) {
		    oControl.setAggregation("_chart", oControl._createChart());
		    //oControl._addChartItems(oControl.getModel("odata").oData.results, oControl.getModel("object").oData);
		    
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.writeClasses();
			oRM.write(">");
			oRM.renderControl(oControl.getAggregation("_chart"));
			oRM.write("</div>");
		}
	});

});
