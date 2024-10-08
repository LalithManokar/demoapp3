/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["./BasePanel","sap/ui/core/Fragment"],function(B,F){"use strict";var C=B.extend("sap.ui.mdc.p13n.ChartItemPanel",{library:"sap.ui.mdc",metadata:{},init:function(){B.prototype.init.apply(this,arguments);F.load({name:"sap.ui.mdc.p13n.ChartItemPanel",controller:this}).then(function(c){this.setTemplate(c);var r=sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");this.setPanelColumns([r.getText("chart.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION"),r.getText("chart.PERSONALIZATION_DIALOG_COLUMN_TYPE"),r.getText("chart.PERSONALIZATION_DIALOG_COLUMN_ROLE")]);}.bind(this));},renderer:{}});C.prototype.onChangeOfRole=function(e){var s=e.getParameter("selectedItem");if(s){var t=e.getSource().getParent();this.fireChange();this._toggleMarkedTableItem(t);this._updateEnableOfMoveButtons(t);}};return C;},true);
