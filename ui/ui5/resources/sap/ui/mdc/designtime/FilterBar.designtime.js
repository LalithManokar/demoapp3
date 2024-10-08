/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";return{name:"{name}",description:"{description}",aggregations:{_content:{domRef:":sap-domref",ignore:false,propagateRelevantContainer:true,propagateMetadata:function(e){if(e.isA("sap.ui.mdc.FilterBar")){return{actions:{addFilter:{changeType:"addFilter",changeOnRelevantContainer:true},removeFilter:{changeType:"removeFilter",changeOnRelevantContainer:true},setFilterPosition:{changeType:"setFilterPosition",changeOnRelevantContainer:true},addCondition:{changeType:"addCondition",changeOnRelevantContainer:true},removeCondition:{changeType:"removeCondition",changeOnRelevantContainer:true}}};}else if(e.isA("sap.ui.mdc.FilterField")){return{actions:{settings:{handler:function(c,p){var m=p.contextElement.getParent().getParent();m.setMetadataDelegate("sap/ui/mdc/odata/v4/FilterBarDelegate");return m.showFiltersDialog();},changeOnRelevantContainer:true}}};}return{actions:null};}}}};},false);
