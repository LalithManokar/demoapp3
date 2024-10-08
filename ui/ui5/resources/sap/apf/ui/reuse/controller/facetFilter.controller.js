/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
sap.ui.define(["sap/apf/ui/utils/facetFilterListHandler","sap/apf/ui/utils/facetFilterListConverter","sap/apf/ui/utils/facetFilterValueFormatter","sap/m/FacetFilter"],function(f,a,b,F){"use strict";function _(c){c.getView().byId("idAPFFacetFilter").removeAllLists();var v=c.getView().getViewData();var C=v.aConfiguredFilters;C.forEach(function(o){var d=new sap.apf.ui.utils.FacetFilterListHandler(v.oCoreApi,v.oUiApi,o);c.getView().byId("idAPFFacetFilter").addList(d.createFacetFilterList());});}sap.ui.controller("sap.apf.ui.reuse.controller.facetFilter",{onInit:function(){var c=this;if(sap.ui.Device.system.desktop){c.getView().addStyleClass("sapUiSizeCompact");}_(c);},onResetPress:function(){var c=this;c.getView().getViewData().oStartFilterHandler.resetVisibleStartFilters();c.getView().getViewData().oUiApi.selectionChanged(true);}});});
