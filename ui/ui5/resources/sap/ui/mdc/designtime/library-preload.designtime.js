//@ui5-bundle sap/ui/mdc/designtime/library-preload.designtime.js
/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.predefine('sap/ui/mdc/designtime/FilterBar.designtime',[],function(){"use strict";return{name:"{name}",description:"{description}",aggregations:{_content:{domRef:":sap-domref",ignore:false,propagateRelevantContainer:true,propagateMetadata:function(e){if(e.isA("sap.ui.mdc.FilterBar")){return{actions:{addFilter:{changeType:"addFilter",changeOnRelevantContainer:true},removeFilter:{changeType:"removeFilter",changeOnRelevantContainer:true},setFilterPosition:{changeType:"setFilterPosition",changeOnRelevantContainer:true},addCondition:{changeType:"addCondition",changeOnRelevantContainer:true},removeCondition:{changeType:"removeCondition",changeOnRelevantContainer:true}}};}else if(e.isA("sap.ui.mdc.FilterField")){return{actions:{settings:{handler:function(c,p){var m=p.contextElement.getParent().getParent();m.setMetadataDelegate("sap/ui/mdc/odata/v4/FilterBarDelegate");return m.showFiltersDialog();},changeOnRelevantContainer:true}}};}return{actions:null};}}}};},false);
sap.ui.predefine('sap/ui/mdc/designtime/Table.designtime',["sap/ui/mdc/TableSettings"],function(T){"use strict";return{name:"{name}",description:"{description}",aggregations:{type:{ignore:true},_content:{domRef:":sap-domref",ignore:false,propagateRelevantContainer:true,propagateMetadata:function(e){if(e.isA(["sap.m.Column","sap.ui.table.Column"])){return{actions:{remove:{changeType:"removeMDCColumn",changeOnRelevantContainer:true}}};}else if(e.isA(["sap.ui.mdc.Table","sap.ui.table.Table","sap.m.Table","sap.m.OverflowToolbar"])){return{actions:{settings:{"default":{handler:function(c,p){var m=c;while(m){if(m.isA("sap.ui.mdc.Table")){break;}m=m.getParent();}if(m){return T.showPanel(m,"Columns",p.eventItem,true);}},changeOnRelevantContainer:true}}}};}return{actions:null};}}}};},false);
sap.ui.predefine('sap/ui/mdc/designtime/field/FieldInfo.designtime',[],function(){"use strict";return{aggregations:{contentHandler:{ignore:true}},tool:{start:function(f){if(f.getContentHandler()){f.getContentHandler().setEnablePersonalization(false);}},stop:function(f){if(f.getContentHandler()){f.getContentHandler().setEnablePersonalization(true);}}}};},false);
sap.ui.predefine('sap/ui/mdc/designtime/link/Panel.designtime',[],function(){"use strict";return{tool:{start:function(p){p.setEnablePersonalization(false);},stop:function(p){p.setEnablePersonalization(true);}}};},false);
sap.ui.predefine('sap/ui/mdc/designtime/link/PanelItem.designtime',[],function(){"use strict";return{domRef:function(p){var $=jQuery.find(".mdcbaseinfoPanelListItem");var a=$.filter(function(P){return jQuery(P).control(0).getParent().getKey()===p.getId();});return a[0];},name:{singular:"p13nDialog.PANEL_ITEM_NAME",plural:"p13nDialog.PANEL_ITEM_NAME_PLURAL"},actions:{remove:function(p){if(p.getIsMain()){return null;}return{changeType:"hideItem"};},reveal:function(p){if(p.getIsMain()){return null;}return{changeType:"revealItem"};}},isVisible:function(p){return p.getVisible();}};},false);
/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.predefine('sap/ui/mdc/designtime/library.designtime',[],function(){"use strict";return{};});
//# sourceMappingURL=library-preload.designtime.js.map