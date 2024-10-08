/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["./BasePanel","sap/ui/core/Fragment"],function(B,F){"use strict";var S=B.extend("sap.ui.mdc.p13n.SortPanel",{library:"sap.ui.mdc",metadata:{},init:function(){B.prototype.init.apply(this,arguments);F.load({name:"sap.ui.mdc.p13n.SortPanel",controller:this}).then(function(s){this.setTemplate(s);var r=sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");this.setPanelColumns([r.getText("sort.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION"),r.getText("sort.PERSONALIZATION_DIALOG_COLUMN_SORTORDER")]);}.bind(this));},renderer:{}});S.prototype.onChangeOfSortOrder=function(e){var s=e.getParameter("selectedItem");if(s){this.fireChange();}};return S;},true);
