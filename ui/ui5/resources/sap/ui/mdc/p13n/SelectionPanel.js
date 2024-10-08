/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["./BasePanel","sap/ui/core/Fragment"],function(B,F){"use strict";var S=B.extend("sap.ui.mdc.p13n.SelectionPanel",{library:"sap.ui.mdc",metadata:{},init:function(){B.prototype.init.apply(this,arguments);F.load({name:"sap.ui.mdc.p13n.SelectionPanel",controller:this}).then(function(s){this.setTemplate(s);var r=sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");this.setPanelColumns(r.getText("fieldsui.COLUMNS"));}.bind(this));},renderer:{}});return S;},true);
