sap.ui.define(["./BaseBlockController","sap/ui/Device","sap/ui/model/json/JSONModel","sap/ino/commons/formatters/BaseListFormatter","sap/ino/controls/OrientationType","sap/ui/core/ResizeHandler","./mixins/IdentityQuickviewMixin","./mixins/ClipboardMixin","./mixins/IdentityCardSendMailMixin","sap/ino/commons/application/Configuration"],function(B,D,J,b,O,R,I,C,c,d){"use strict";return B.extend("sap.ino.vc.commons.BaseListController",jQuery.extend({},I,C,c,{formatter:b,onInit:function(){B.prototype.onInit.apply(this,arguments);this._oListConfigModel=new J(this.list||{});this.getView().setModel(this._oListConfigModel,"list");this._oFilterBar=this.byId("filterBar");if(D.system.desktop){var p=this.byId("pullToRefresh");if(p){var P=p.getParent();P.removeContent(p);}}this._sResizeRegId=this.attachListControlResized(this.getList());this.setFullScreen(d.getPersonalize().SCREEN_SIZE);},onExit:function(){this.detachListControlResized(this._sResizeRegId);},_onBaseOrientationChange:function(e){this._onOrientationHandler();},_onOrientationHandler:function(e){this.bindList();},onOrientationChange:function(e){if(e===O.LANDSCAPE){if(this.getPortraitStyle){this.getList().removeStyleClass(this.getPortraitStyle());}if(this.getLandscapeStyle){this.getList().addStyleClass(this.getLandscapeStyle());}}else{if(this.getPortraitStyle){this.getList().addStyleClass(this.getPortraitStyle());}if(this.getLandscapeStyle){this.getList().removeStyleClass(this.getLandscapeStyle());}}this.getList().setWrapping(e!==O.LANDSCAPE);},_onManualOrientationChange:function(){var o=this.getViewProperty("/ORIENTATION");o=(o===O.PORTRAIT?O.LANDSCAPE:O.PORTRAIT);this.setViewProperty("/ORIENTATION",o);this._onOrientationHandler(o);this.onOrientationChange(o);},onObjectListUpdateStarted:function(E){var i=sap.ui.getCore().getCurrentFocusedControlId();if(i&&i.indexOf("__clone")>-1){var l=E.getSource(),a;if(l&&l.getItems){a=l.getItems().map(function(e){return e.getId().substring(e.getId().lastIndexOf("__clone"));}).indexOf(i.substring(i.lastIndexOf("__clone")));this._iBeforeUpdateControlIdx=a;this._iBeforeUpdateControlId=i.substring(0,i.lastIndexOf("__clone"));}}},onObjectListUpdateFinished:function(e){if(!sap.ui.getCore().getCurrentFocusedControlId()&&this._iBeforeUpdateControlIdx>-1){var i=this.getList().getItems();if(i&&i.length>this._iBeforeUpdateControlIdx){var o=i[this._iBeforeUpdateControlIdx];var s=o.getId().substring(o.getId().lastIndexOf("__clone"));var a=this._iBeforeUpdateControlId+s;var f=sap.ui.getCore().getElementById(a);if(f){f.focus();}}}this._iBeforeUpdateControlId=undefined;this._iBeforeUpdateControlIdx=undefined;},onObjectListGrowFinished:function(e){if(e.getParameter("actual")>30){var n=this.getList().getItems().slice(e.getParameter("actual")-30);this.onMassIdeaSelect(n,this.getViewProperty("/List/SELECT_ALL"),true);}},_onResize:function(e){var t=e.control;var w=e.size.width;var o=e.oldsize?e.oldsize.width:-1;if(w!==o){t.removeStyleClass("sapInoListWidthXXXS");t.removeStyleClass("sapInoListWidthXXS");t.removeStyleClass("sapInoListWidthXS");t.removeStyleClass("sapInoListWidthS");t.removeStyleClass("sapInoListWidthM");t.removeStyleClass("sapInoListWidthL");t.removeStyleClass("sapInoListWidthXL");t.removeStyleClass("sapInoListWidthXXL");t.removeStyleClass("sapInoListWidthXXXL");t.removeStyleClass("sapInoListWidthXXXXL");if(w<500){t.addStyleClass("sapInoListWidthXXXS");}else if(w<600){t.addStyleClass("sapInoListWidthXXS");}else if(w<700){t.addStyleClass("sapInoListWidthXS");}else if(w<800){t.addStyleClass("sapInoListWidthS");}else if(w<900){t.addStyleClass("sapInoListWidthM");}else if(w<1000){t.addStyleClass("sapInoListWidthL");}else if(w<1100){t.addStyleClass("sapInoListWidthXL");}else if(w<1200){t.addStyleClass("sapInoListWidthXXL");}else if(w<1300){t.addStyleClass("sapInoListWidthXXXL");}else{t.addStyleClass("sapInoListWidthXXXXL");}}},_updateListAccessibility:function(){var l=this.getList();l.$().find(".sapMListUl").attr("role","list");var i=l.$().find("li");jQuery.each(i,function(a,o){var $=jQuery(o);$.attr("role","group");var L=$.find(".sapInoItemAriaLabel");if(L&&L.length>0){$.attr("aria-labelledby",L[0].id);}var e=$.find(".sapMLIBContent");if(e&&e.length>0){e.attr("role","listitem");}});},getScrollContainer:function(){return this._oScrollContainer;},getFilterBar:function(){return this._oFilterBar;},getListLayout:function(){return this.byId("objectListLayout");},getFilterButton:function(){return this.byId("filterButton");},getFilterPanel:function(){return this.byId("filterPanel");},getFilterDialog:function(){return this.byId("filterDialog");},getSortPanel:function(){return this.byId('sortPanel');},isFilterVisible:function(){var f=this.getFilterPanel();if(f){return f.hasStyleClass("sapInoFilterSidePanelVisible");}else{return false;}},onShowFilterBar:function(e){this.showFilterBar(true);if(this.getModel("filterItemModel")){this.getModel("filterItemModel").setProperty("/isShowFilterSideFilterButtonGroup",e.getSource().getPressed&&e.getSource().getPressed());}},showFilterBar:function(s){if(!D.system.desktop){var f=this.getFilterDialog();if(f.isOpen()&&!s){f.close();}else if(!f.isOpen()&&s){f.open();if(this.onSetFilterBarVisible){this.onSetFilterBarVisible();}}}else{var o=this.getListLayout();var F=this.getFilterPanel();var S=this.getSortPanel();if(!o||!F){return;}if(this.isFilterVisible()||s===false){o.removeStyleClass("sapInoObjectListLayoutFit");F.removeStyleClass("sapInoFilterSidePanelVisible");if(S){o.removeStyleClass('sapInoObjectListLayoutTop');S.removeStyleClass("sapInoSortPanelLayoutFit");}}else{o.addStyleClass("sapInoObjectListLayoutFit");F.addStyleClass("sapInoFilterSidePanelVisible");if(S){o.addStyleClass('sapInoObjectListLayoutTop');S.addStyleClass("sapInoSortPanelLayoutFit");}if(this.onSetFilterBarVisible){this.onSetFilterBarVisible();}}}},onApplyFilter:function(){var f=this.getFilterDialog();if(JSON.stringify(this.getViewModelBackup())===JSON.stringify(this.getViewProperty("/"))&&JSON.stringify(this.getFilterItemModelBackup())===JSON.stringify(this.getModel("filterItemModel"))){f.close();return;}var q=this.getQuery();this.navigateIntern(q,true);f.close();},onCancelFilter:function(){var f=this.getFilterDialog();this.setViewProperty("/List/SORT",this.ViewModelBackup.List.SORT);this.setViewProperty("/List/ORDER",this.ViewModelBackup.List.ORDER);this.setViewProperty("/List/SEARCH",this.ViewModelBackup.List.SEARCH);this.setViewProperty("/List/TAGS",this.ViewModelBackup.List.TAGS);this.setViewProperty("/List/VARIANT",this.ViewModelBackup.List.VARIANT);this.setViewProperty("/List/STATUS","");this.setViewProperty("/List/PHASE","");this.setViewProperty("/List/CAMPAIGN",undefined);this.setViewProperty("/List/DUE",undefined);this.setViewProperty("/List/AUTHORS",[]);this.setViewProperty("/List/COACHES",[]);this.setViewProperty("/List/EXTENSION",{});this.setViewProperty("/List/RESP_VALUE_CODE","");f.close();},getFilterElementById:function(i){return this.byId(i);},createIdForFilterElement:function(i){if(i){return this.createId(i);}else{return this.getView().getId();}},setFilterModel:function(m,n){this.setModel(m,n);},getFilterNavContainer:function(){if(!this._oNavContainer){if(!D.system.desktop){this._oNavContainer=this.byId("dialogFilterFragment--navContainer");}else{this._oNavContainer=this.byId("panelFilterFragment--navContainer");}}return this._oNavContainer;},onFilterPageChange:function(){var n=this.getFilterNavContainer();var o=n.getCurrentPage();var P=n.getPages();var N=jQuery.grep(P,function(p){return p.sId!==o.sId;});if(N&&N.length>0){var a=N[0];if(a!==P[0]){n.to(a.sId,"slide");}else{n.backToPage(a.sId,"slide");}}},onMoreFilterChange:function(e){var n=this.getFilterNavContainer();var p=n.getPages();var f=p[0].getContent()[0];if(f.getItems().length>3){this.setViewProperty("/List/IS_SHOW_MORE_FILTER",true);e.getSource().setVisible(false);f.$().find('*[tabindex="0"]')[f.getItems().length-1].focus();}},addSubFilterPageContent:function(v){this.setViewProperty("/List/IS_FILTER_SUBPAGE",true);var n=this.getFilterNavContainer();var p=n.getPages();var s=p[1];s.addContent(v);},removeSubFilterPage:function(){this.setViewProperty("/List/IS_FILTER_SUBPAGE",false);var n=this.getFilterNavContainer();var p=n.getPages();var s=p[1];s.removeAllContent();},createViewModelBackup:function(){this.ViewModelBackup=jQuery.extend(true,{},this.getViewProperty("/"));this.FilterItemModelBackup=jQuery.extend(true,{},this.getModel("filterItemModel"));},getViewModelBackup:function(){return this.ViewModelBackup;},getFilterItemModelBackup:function(){return this.FilterItemModelBackup;},restoreViewModelBackup:function(){if(this.oViewModelBackup!==undefined){this.setViewProperty("/",this.ViewModelBackup);this.ViewModelBackup=undefined;}if(this.FilterItemModelBackup!==undefined){this.setModel("filterItemModel",this.FilterItemModelBackup);this.FilterItemModelBackup=undefined;}},resetViewModelBackup:function(){this.ViewModelBackup=undefined;this.FilterItemModelBackup=undefined;},getModel:function(n){return this.getView().getModel(n);},setListProperty:function(p,v){return this.getModel("list").setProperty(p,v);},getListProperty:function(p){return this.getModel("list").getProperty(p);},getList:function(){},getItemTemplate:function(){},addListToolbarContent:function(o){var l=this.getList();var t=l?(l.getHeaderToolbar&&l.getHeaderToolbar()):undefined;var a=t?(t.getContent&&t.insertContent&&t.getContent()):undefined;if(jQuery.isArray(a)){var i=a.length-1;for(var e=a.length-1;e>=0;e--){var m=a[e].getMetadata&&a[e].getMetadata();var n=m?(m.getName&&m.getName()):undefined;if(n==="sap.m.ToolbarSpacer"){i=e+1;break;}}t.insertContent(o,i);}else{}},getPath:function(){return this._sPath;},setPath:function(p){this._sPath=p;},addSorterConfig:function(s,E){var p="/Sorter/Values";var v=this.getListProperty(p);if(!v){return;}var a=function(S){if(jQuery.grep(v,function(e){return e.ACTION===S.ACTION;}).length===0){if(E){v.push(S);}else{v.unshift(S);}}};if(jQuery.isArray(s)){s.forEach(function(S){a(S);});}else{a(s);}this.setListProperty(p,v);},removeSorterConfig:function(s){var p="/Sorter/Values";var v=this.getListProperty(p);if(!v||v.length===0){return;}var r=function(S){v=jQuery.grep(v,function(l){return l.ACTION!==S.ACTION;});};if(jQuery.isArray(s)){s.forEach(function(S){r(S);});}else{r(s);}this.setListProperty(p,v);},getSorter:function(){return this._oSorter;},setSorter:function(s){this._oSorter=s;},getFilter:function(){var g=this.getGlobalFilter();var f=this._aFilter||[];return f.concat(g);},setFilter:function(f){if(jQuery.type(f)==="array"){this._aFilter=f;}else{this._aFilter=f?[f]:[];}},addFilter:function(f){if(!this._aFilter){this._aFilter=[];}this._aFilter.push(f);},getGlobalFilter:function(){return this._aGlobalFilter||[];},setGlobalFilter:function(f){if(jQuery.type(f)==="array"){this._aGlobalFilter=f;}else{this._aGlobalFilter=f?[f]:[];}},addGlobalFilter:function(f){if(!this._aGlobalFilter){this._aGlobalFilter=[];}this._aGlobalFilter.push(f);},getGroupHeaderFactory:function(){return this._oGroupHeaderFactory;},setGroupHeaderFactory:function(g){this._oGroupHeaderFactory=g;},bindList:function(f){var t=this;var l=this.getList().bindItems({path:this.getPath(),template:this.getItemTemplate(),sorter:this.getSorter(),filters:this.getFilter(),groupHeaderFactory:this.getGroupHeaderFactory(),events:{dataRequested:function(){jQuery.each(t.getBusyControls(),function(i,o){if(jQuery.type(o.setBusy)==="function"){o.setBusy(true);}});},dataReceived:function(){jQuery.each(t.getBusyControls(),function(i,o){if(jQuery.type(o.setBusy)==="function"){o.setBusy(false);}});if(jQuery.type(f)==="function"){f.apply(this);}}}});},onListExport:function(){},onRefresh:function(){this.bindList();},onUpdateFinished:function(){var r=this.byId("pullToRefresh");if(r&&typeof r.hide==="function"){r.hide();}this._updateListAccessibility();},navigateIntern:function(q,r,o){if(o){if(!D.system.desktop){return;}}var v=this.getViewProperty("/List/VARIANT");this.navigateTo(this.getCurrentRoute(),{"variant":v,"query":q},r,true);},_getListDefinitionEntry:function(v,k,l){var V=this.getListProperty(l);if(!V){return undefined;}var a=jQuery.grep(V,function(o){return o[k]===v;});if(a&&a.length>0){return a[0];}return undefined;},getSort:function(a){return this._getListDefinitionEntry(a,"ACTION","/Sorter/Values");},getStatus:function(k){return this._getListDefinitionEntry(k,"KEY","/Filter/Status");},onTagItemSelected:function(e){e.oSource=e.getSource().getContent()[0];this.onTagSelected(e);},onTagSelected:function(e){var s=e.getSource();if(!s.getEnabled()){return;}var t={ID:s.data("id"),NAME:encodeURIComponent(s.getText()),GROUP_ID:s.data("groupid")};var T=this.getViewProperty("/List/TAGS");T.push(t);this.setViewProperty("/List/TAGS",T);this.setViewProperty("/List/IS_TAGS_SELECTION",T.length>0);if(!D.system.desktop){this.bindTagCloud();return;}this.navigateIntern(this.getQuery(),true);},onTagTreeSelectedDone:function(e){var s=e.getSource();var t=[];var u=[];var f={"bFind":false};t=this.setSelectedTagGroup(t,this._oPopover.getModel().oData);this.updateTagHierarchy(t,this._oPopover.getModel().oData,f);u=this.setUnSelectedTagGroup(u,this._oPopover.getModel().oData);var r=this._oPopover.getModel().oData.tagGroupID?this._oPopover.getModel().oData.tagGroupID:'other';var T=this.getViewProperty("/List/TAGS")||[];T=T.concat(t);T=this.uniqTagGroup(T)||[];T=this.excludeUnSelectedTags(T,u)||[];T.forEach(function(i){i.NAME=decodeURIComponent(i.NAME);i.NAME=encodeURIComponent(i.NAME);if(!i.ROOTGROUPID){i.ROOTGROUPID=r;}});this.setViewProperty("/List/TAGS",T);this.setViewProperty("/List/IS_TAGS_SELECTION",T.length>0);if(!D.system.desktop){this.bindTagCloud();return;}this._oPopover.close();this.navigateIntern(this.getQuery(),true);},excludeUnSelectedTags:function(a,e){if(a.length>0){e.forEach(function(A){var E=false;var n;a.forEach(function(o,i){if(!E){E=o.ID===A.ID?true:false;if(E){n=i;}}});if(E){a.splice(n);E=false;}});}return a;},onTagSelectionChange:function(e){var a=e.getSource().getBindingContext();var p=a.getPath();this.validateChild(this._oPopover.getModel(),p);p=p.substring(0,p.lastIndexOf('/'));this.validateParent(this._oPopover.getModel(),p);},setVibilityTagIcon:function(a){if(a==="TAG_GROUP"){return true;}else{return false;}},setVibilityTag:function(a){if(a){return true;}else{return false;}},uniqTagGroup:function(e){var t=[];for(var i=0;i<e.length;i++){var n=true;for(var a=0;a<t.length;a++){if(n){n=t[a].ID===e[i].ID?false:true;}}if(n){t.push(e[i]);}}return t;},setSelectedTagGroup:function(t,a){var T;var e=this;if(a.children){a.children.forEach(function(o){if(o.children){e.setSelectedTagGroup(t,o);}else if(o.checked==="Checked"){T={ID:o.TAG_ID,NAME:o.NAME,GROUP_ID:o.TAG_GROUP_ID};t.push(T);}});}else if(a instanceof Array){a.forEach(function(o){if(o.checked==="Checked"){T={ID:o.ID,NAME:o.NAME,GROUP_ID:o.TAG_GROUP_ID};t.push(T);}});}else{if(a.checked==="Checked"){T={ID:a.TAG_ID,NAME:a.NAME,GROUP_ID:a.TAG_GROUP_ID};t.push(T);}}return this.uniqTagGroup(t);},setUnSelectedTagGroup:function(t,a){var T;var e=this;if(a.children){a.children.forEach(function(o){if(o.children){e.setUnSelectedTagGroup(t,o);}else if(o.checked==="Unchecked"){T={ID:o.TAG_ID,NAME:o.NAME,GROUP_ID:o.TAG_GROUP_ID};t.push(T);}});}else if(a instanceof Array){a.forEach(function(o){if(o.checked==="Unchecked"){T={ID:o.ID,NAME:o.NAME,GROUP_ID:o.TAG_GROUP_ID};t.push(T);}});}else{if(a.checked==="Unchecked"){T={ID:a.TAG_ID,NAME:a.NAME,GROUP_ID:a.TAG_GROUP_ID};t.push(T);}}return this.uniqTagGroup(t);},setChildState:function(o,s){var t=this;this.getChildren(o).forEach(function(x){x.checked=s;t.setChildState(x,s);});},validateChild:function(m,p){var a=m.getProperty(p);this.setChildState(a,a.checked);},getChildren:function(o){if(o.children){return o.children;}else{return[];}},validateParent:function(m,p){if(p==='/children'||p===''){return;}var o=m.getProperty(p);var s='Unchecked';var a=this.getChildren(o);var e=a.filter(function(x){return x.checked==='Checked';}).length;if(e===a.length){o.checked='Checked';}else{var u=a.filter(function(x){return x.checked==='Unchecked';}).length;if(u===a.length){o.checked='Unchecked';}else{o.checked='Mixed';}}m.setProperty(p,o);p=p.substring(0,p.lastIndexOf('/'));if(p!=='/children'){this.validateParent(m,p);}},updateTagHierarchy:function(t,a,f){var e=this;if(a.children){a.children.forEach(function(o){if(o.children){e.updateTagHierarchy(t,o,f);if(o.checked==="Checked"&&f.bFind){o.checked="Unchecked";}}else{var n=false;t.forEach(function(T){if(!n){n=o.TAG_ID!==T.ID?false:true;}});if(!n){o.checked="Unchecked";f.bFind=true;n=false;}else{o.checked="Checked";n=false;}}});}else if(a instanceof Array){a.forEach(function(o){var n=false;t.forEach(function(T){if(!n){n=o.ID!==T.ID?false:true;}});if(!n){o.checked="Unchecked";}else{o.checked="Checked";n=false;}});}else{var n=false;t.forEach(function(T){if(!n){n=a.TAG_ID!==T.ID?false:true;}});if(!n){a.checked="Unchecked";f.bFind=true;n=false;}else{a.checked="Checked";n=false;}}return a;},updateTagHierarchyForFisrt:function(t,a){var e=this;if(a.children){a.children.forEach(function(o){if(o.children){e.updateTagHierarchyForFisrt(t,o);}else{var n=false;t.forEach(function(T){if(!n){n=o.TAG_ID!==T.ID?false:true;}});if(n){o.checked="Checked";n=false;}}});}else{var n=false;t.forEach(function(T){if(!n){n=a.TAG_ID!==T.ID?false:true;}});if(n){a.checked="Checked";n=false;}}return a;},onTagGroupSelected:function(e){var s=e.getSource();var m="TagGroup-"+e.getSource().getCustomData()[0].getValue();var G=e.getSource().getCustomData()[1].getValue();if(!this._oPopover){this._oPopover=sap.ui.xmlfragment("sap.ino.vc.commons.fragments.TagGroupPopover",this);this.getView().addDependent(this._oPopover);}var t=this.getViewProperty("/List/TAGS");var r={GROUP_ID:e.getSource().getCustomData()[0].getValue(),TagList:this.getView().getModel("tag").getProperty("/RANKED_TAG")};var _=this._oPopover;var T;var a=this;var o=jQuery.ajax({url:d.getBackendRootURL()+"/sap/ino/xs/rest/common/tagGroupQuery.xsjs",type:"POST",dataType:"json",contentType:"application/json",data:JSON.stringify(r),async:false});o.done(function(f){T=new J(f);if(a.getView().getModel(m)){var F={"bFind":false};f=a.updateTagHierarchy(t,f,F);a.getView().getModel(m).setData(f);}else{a.updateTagHierarchyForFisrt(t,T.oData);a.getView().setModel(T,m);}});this.getView().getModel(m).setProperty("/RootGroupName",G);_.setModel(this.getView().getModel(m));this._oPopover.openBy(e.getSource());},_deselectTag:function(k){var t=this.getViewProperty("/List/TAGS");t=t.filter(function(a){return a.ID!==k;});this.setViewProperty("/List/TAGS",t);this.setViewProperty("/List/IS_TAGS_SELECTION",t.length>0);var q=this.getQuery();if(t.length===0){q.tags=undefined;setTimeout(function(){},0);}if(!D.system.desktop){this.bindTagCloud();return;}this.navigateIntern(q,true);},onTagItemDeselectPress:function(e){var k=parseInt(e.getParameter("listItem").getContent()[0].getKey(),10);if(!isNaN(k)){this._deselectTag(k);}},onTagItemDelete:function(e){var k=parseInt(e.getSource().getProperty("key"),10);if(!isNaN(k)){this._deselectTag(k);}}}));});
