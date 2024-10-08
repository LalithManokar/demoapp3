/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/mdc/changehandler/SetFilterValue','sap/ui/mdc/flexibility/SortFlex','sap/ui/mdc/flexibility/ChartItem'],function(S,a,C){"use strict";return{addItem:C.addItem,removeItem:C.removeItem,"setChartType":{layers:{USER:true},changeHandler:{createChange:function(p){if(!p.control){throw new Error("Invalid control. The existing control object is mandatory");}return{selectorElement:p.control,changeSpecificData:{changeType:"setChartType",content:{chartType:p.chartType}}};},completeChangeContent:function(c,s){},applyChange:function(c,o,p){c.setRevertData(p.modifier.getProperty(o,"chartType"));p.modifier.setProperty(o,"chartType",c.getContent().chartType);},revertChange:function(c,o,p){p.modifier.setProperty(o,"chartType",c.getRevertData());c.resetRevertData();}}},"setFilterValue":{layers:{USER:true},changeHandler:S},removeSort:a.removeSort,addSort:a.addSort};},true);
