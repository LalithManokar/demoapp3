sap.ui.define(["sap/ino/vc/commons/BaseVariantListController","sap/ino/controls/OrientationType","sap/ui/Device","sap/ui/model/Sorter","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/json/JSONModel","sap/ino/commons/application/Configuration","sap/ino/vc/commons/TopLevelPageFacet","sap/ino/commons/formatters/ObjectListFormatter","sap/ino/vc/commons/mixins/TagGroupMixin","sap/ino/vc/commons/mixins/FollowMixin","sap/ino/vc/campaign/mixins/RegistrationMixin","sap/ino/vc/commons/mixins/ExtensibilityMixin","sap/ui/core/mvc/ViewType"],function(B,O,D,S,F,a,J,C,T,b,c,d,R,E,V){"use strict";var o={ASC:"ASC",DESC:"DESC"};var s={NONE:'',SEARCH_SCORE:"SEARCH_SCORE",NAME:"tolower(NAME)",REGISTER_TO:"REGISTER_TO",SUBMIT_TO:"SUBMIT_TO",VALID_TO:"VALID_TO",CREATED_AT:"CREATED_AT",CHANGED_AT:"CHANGED_AT"};var v={ALL:"all",ACTIVE:"active",OPEN:'open',FUTURE:"future",PAST:"past",MANAGE:"manage",DRAFT:"draft",PUBLISH:"publish",SUBMITTABLE:"submittable",REGISTERED:"registered"};var f={NONE:undefined,ACTIVE:"activeCampaigns",OPEN:"openCampaigns",FUTURE:"futureCampaigns",PAST:"pastCampaigns",MANAGE:"managedCampaigns",DRAFT:"draftCampaigns",PUBLISH:"publishCampaigns",SUBMITTABLE:"submittableCampaigns",REGISTERED:"registeredCampaigns"};var l={CAMPAIGN:"campaignlist",CAMPAIGN_VARIANT:"campaignlistvariant"};var L={NULL:"",YES:"1",NO:"0"};var m={ADJUSTMENT_TITLE:"IDEA_LIST_TIT_ADJUSTMENT",NAME:"CAMPAIGN_LIST_TIT_NAME",MANAGEDNAME:"CAMPAIGN_LIST_TIT_MANAGEDNAME",Filter:{},QuickSorter:[{TEXT:"SORT_MIT_MOST_RECENT",ACTION:s.CREATED_AT,DEFAULT_ORDER:o.DESC},{TEXT:"SORT_MIT_LATEST_CHANGE",ACTION:s.CHANGED_AT,DEFAULT_ORDER:o.DESC}],Sorter:{Values:[{TEXT:"SORT_MIT_CAMPAIGN_END",ACTION:s.VALID_TO,DEFAULT_ORDER:o.ASC},{TEXT:"SORT_MIT_REGISTER_TO",ACTION:s.REGISTER_TO,DEFAULT_ORDER:o.ASC},{TEXT:"SORT_MIT_SUBMIT_TO",ACTION:s.SUBMIT_TO,DEFAULT_ORDER:o.ASC},{TEXT:"SORT_MIT_TITLE",ACTION:s.NAME,DEFAULT_ORDER:o.ASC}],Limit:2},Order:{Values:[{TEXT:"ORDER_MIT_ASC",ACTION:o.ASC},{TEXT:"ORDER_MIT_DESC",ACTION:o.DESC}]},Variants:{DEFAULT_VARIANT:v.ALL,TITLE:"CAMPAIGN_LIST_TIT_VARIANTS",Values:[{TEXT:"CAMPAIGN_LIST_MIT_ALL",ACTION:v.ALL,FILTER:f.NONE,INCLUDE_DRAFT:false,DEFAULT_SORT:s.NAME,COUNT:"0",VISIBLE:true},{TEXT:"CAMPAIGN_LIST_MIT_ACTIVE",ACTION:v.ACTIVE,FILTER:f.ACTIVE,INCLUDE_DRAFT:false,DEFAULT_SORT:s.SUBMIT_TO,HIERARCHY_LEVEL:"1",COUNT:"0",VISIBLE:true},{TEXT:"CAMPAIGN_LIST_MIT_OPEN",ACTION:v.OPEN,FILTER:f.OPEN,INCLUDE_DRAFT:false,DEFAULT_SORT:s.SUBMIT_TO,HIERARCHY_LEVEL:"1",COUNT:"0",VISIBLE:true},{TEXT:"CAMPAIGN_LIST_MIT_FUTURE",ACTION:v.FUTURE,FILTER:f.FUTURE,INCLUDE_DRAFT:false,DEFAULT_SORT:s.SUBMIT_TO,HIERARCHY_LEVEL:"1",COUNT:"0",VISIBLE:true},{TEXT:"CAMPAIGN_LIST_MIT_CLOSED",ACTION:v.PAST,FILTER:f.PAST,INCLUDE_DRAFT:false,DEFAULT_SORT:s.SUBMIT_TO,HIERARCHY_LEVEL:"1",COUNT:"0",VISIBLE:true},{TEXT:"CAMPAIGN_LIST_MIT_REGISTERED",ACTION:v.REGISTERED,FILTER:f.REGISTERED,INCLUDE_DRAFT:false,DEFAULT_SORT:s.REGISTER_TO,HIERARCHY_LEVEL:"1",COUNT:"0",VISIBLE:true},{TEXT:"CAMPAIGN_LIST_MIT_MANAGE",ACTION:v.MANAGE,FILTER:f.MANAGE,INCLUDE_DRAFT:true,DEFAULT_SORT:s.SUBMIT_TO,VISIBLE:true,COUNT:"0",MANAGE:true},{TEXT:"CAMPAIGN_LIST_MIT_DRAFT",ACTION:v.DRAFT,FILTER:f.DRAFT,INCLUDE_DRAFT:true,DEFAULT_SORT:s.SUBMIT_TO,VISIBLE:true,HIERARCHY_LEVEL:"1",COUNT:"0",MANAGE:true},{TEXT:"CAMPAIGN_LIST_MIT_PUBLISH",ACTION:v.PUBLISH,FILTER:f.PUBLISH,INCLUDE_DRAFT:false,DEFAULT_SORT:s.VALID_TO,VISIBLE:true,HIERARCHY_LEVEL:"1",COUNT:"0",MANAGE:true},{TEXT:"CAMPAIGN_LIST_MIT_OPEN",ACTION:v.SUBMITTABLE,FILTER:f.SUBMITTABLE,INCLUDE_DRAFT:false,DEFAULT_SORT:s.SUBMIT_TO,COUNT:"0",VISIBLE:true,HIERARCHY_LEVEL:"1",MANAGE:true}]}};var e=B.extend("sap.ino.vc.campaign.List",jQuery.extend({},T,c,d,R,{routes:["campaignlist","campaignlistvariant"],initialFocus:"mainFilterButton",list:m,formatter:b,view:{NAME:"CAMPAIGN_LIST",List:{SORT:s.NAME,ORDER:undefined,MANAGE:false,VARIANT:v.ALL,TAGS:[],Default:{SORT:s.NAME,ORDER:undefined,VARIANT:v.ALL},"RESP_CODE":"","HAS_BLOG":"","IS_SHOW_MORE_FILTER":false,"IS_FILTER_SUBPAGE":true,"TAGCLOUD":true,"TAGCLOUD_EXPABLE":true,"TAGCLOUD_EXP":false,"TAGCLOUD_BAR_VISIBLE":false},ORIENTATION:C.getPersonalize().CAMPAIGN_VIEW?O.PORTRAIT:O.LANDSCAPE},onInit:function(){B.prototype.onInit.apply(this,arguments);this.oViewModel=this.getModel("view")||new J({});this.oViewModel.setData(this.view,true);this.getList().addStyleClass(this.getPortraitStyle());this.getList().setWrapping(true);this.getList().attachUpdateFinished(this.onUpdateFinished,this);},onRouteMatched:function(g,h){var q;var i;if(g&&g.getParameter){var A=g.getParameter("arguments");this._sRoute=g.getParameter("name");q=A["?query"];i=A.variant;}else{this._sRoute=g;q=h;i=h.variant;}if(this.getVariant(i)&&C.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")){var j=this.getVariant(i).MANAGE?true:false;this.getModel("component").setProperty("/SHOW_BACKOFFICE",j);}var k=this.getModel("component").getProperty("/SHOW_BACKOFFICE");var n=C.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")&&k?v.MANAGE:this.getListProperty("/Variants/DEFAULT_VARIANT");this.setViewProperty("/List/VARIANT",i||n);i=this.getViewProperty("/List/VARIANT");var p,Q;var r=jQuery.extend(true,{},this.getVariant(i));this.checkSort(q,r.DEFAULT_SORT);this.changeDefaultSortOfVariant(r,q);var t=this.getList().isBound("items");if(!q||!q.sort){var u=r.DEFAULT_SORT;var w=this.getSort(u)[0].DEFAULT_ORDER;q=q||{};q.sort=q.sort||u;q.sort=q.sort+" "+(q.order||w);}var x=this.hasStateChanged(this._sRoute,i,q,D.orientation.portrait);if(!t||x){this.setVariantVisibility();this.setParameters(q,r);p=this.getSort(this.getViewProperty("/List/SORT"));Q=this.getQuickSort(this.getViewProperty("/List/QUICKSORT"));this.setSorter(Q.concat(p));this.updateFilter();var y=this.getViewProperty("/ORIENTATION");this.onOrientationChange(D.system.desktop?y:D.orientation);this.setSortIcon(this.byId("panelFilterFragment--sortreverse"),this.getViewProperty("/List/ORDER"));this.bindList();this.initialSorterItems();if(this.isFilterVisible()){this.bindTagCloud();}}this._bInnerViewNavigation=true;if(this.bGlobalSearchContext){return;}var z=q.search||"";var G=this.getViewProperty("/List/RESP_CODE")||'';var H=this.getViewProperty("/List/HAS_BLOG")||'';var I=this.getViewProperty("/List/TAGS");var K={};var M=[];I.forEach(function(W,X){if(!K[W.ROOTGROUPID]){K[W.ROOTGROUPID]=[];K[W.ROOTGROUPID].push(W.ID);M.push(W.ROOTGROUPID);}else{K[W.ROOTGROUPID].push(W.ID);}});var N={searchToken:window.decodeURIComponent(z),resp_code:G,has_camp_blog:H,tagTokens:K[M[0]]?K[M[0]].join(","):"",tagTokens1:K[M[1]]?K[M[1]].join(","):"",tagTokens2:K[M[2]]?K[M[2]].join(","):"",tagTokens3:K[M[3]]?K[M[3]].join(","):"",tagTokens4:K[M[4]]?K[M[4]].join(","):""};var P=this.getModel("list").getProperty("/Variants/Values");var U=this.getModel("list");C.getCampaignFilterCount(N,U,P);this.setHelp("CAMPAIGN_LIST");},onAfterShow:function(){},onBeforeHide:function(){},setVariantVisibility:function(){var g=this.getModel("list").getProperty("/Variants/Values");for(var i=0;i<g.length;i+=1){var h=g[i];var I=h.MANAGE||false;var j=(!I)||(I&&C.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access"));this.getModel("list").setProperty("/Variants/Values/"+i+"/VISIBLE",j);}},getPortraitStyle:function(){return"sapInoCampaignListCardItems";},getList:function(){return this.byId("objectlist");},getBindingParameter:function(){var g,h;g=this.getViewProperty("/List/VARIANT");h=this.getCurrentVariant().FILTER;var i=this.getViewProperty("/List/SEARCH");var t=this.getViewProperty("/List/TAGS");var j=jQuery.map(t,function(p){return p.ID;});var k={};var n=[];t.forEach(function(p,q){if(!k[p.ROOTGROUPID]){k[p.ROOTGROUPID]=[];k[p.ROOTGROUPID].push(p.ID);n.push(p.ROOTGROUPID);}else{k[p.ROOTGROUPID].push(p.ID);}});return{Variant:g,VariantFilter:h,SearchTerm:i,TagIds:j,tagGroup:k,tagGroupKey:n};},getBindingPath:function(q){var i=this._check4ManagingList()?1:0;if(!q||q==={}||(q.search===undefined&&q.tags===undefined&&q.variant===undefined)){return{Path:"CampaignFull"};}return{Path:"CampaignSearchParams(searchToken='"+(q.search||"")+"',"+"tagsToken='"+(q.tagGroup[q.tagGroupKey[0]]?q.tagGroup[q.tagGroupKey[0]].join(","):"")+"',"+"tagsToken1='"+(q.tagGroup[q.tagGroupKey[1]]?q.tagGroup[q.tagGroupKey[1]].join(","):"")+"',"+"tagsToken2='"+(q.tagGroup[q.tagGroupKey[2]]?q.tagGroup[q.tagGroupKey[2]].join(","):"")+"',"+"tagsToken3='"+(q.tagGroup[q.tagGroupKey[3]]?q.tagGroup[q.tagGroupKey[3]].join(","):"")+"',"+"tagsToken4='"+(q.tagGroup[q.tagGroupKey[4]]?q.tagGroup[q.tagGroupKey[4]].join(","):"")+"',"+"filterName='"+(q.variant||"")+"',"+"filterBackoffice="+(i||"0")+")/Results"};},bindList:function(){this.saveState();var g=this.getBindingParameter();var h=this.getBindingPath({search:g.SearchTerm,tags:g.TagIds,tagGroup:g.tagGroup,tagGroupKey:g.tagGroupKey,variant:g.VariantFilter});this.setPath("data>/"+h.Path);B.prototype.bindList.apply(this);},includeDrafts:function(){return this.getCurrentVariant().INCLUDE_DRAFT;},bindTagCloud:function(){var g=this.getBindingParameter();var p=C.getBackendRootURL()+"/sap/ino/xs/rest/common/tagcloud_campaigns.xsjs";var P=[];if(!this.includeDrafts()){P.push("EXCL_STATUS=sap.ino.config.CAMP_DRAFT");}if(g&&g.TagIds){jQuery.each(g.TagIds,function(k,i){P.push("TAG="+i);});}if(g.SearchTerm&&g.SearchTerm.length>0){P.push("SEARCHTERM="+g.SearchTerm);}if(g.VariantFilter){P.push("FILTERNAME="+g.VariantFilter);}if(this.getViewProperty("/List/RESP_CODE")){P.push("RESP_VALUE_CODE="+this.getViewProperty("/List/RESP_CODE"));}if(this.getViewProperty("/List/HAS_BLOG")){P.push("HAS_BLOG="+this.getViewProperty("/List/HAS_BLOG"));}p=p+"?";if(P.length>0){p=p+"&"+P.join("&");}if(this._lastTagServicePath===p){return;}this._attachRequestCompleted(p);this._lastTagServicePath=p;},_attachRequestCompleted:function(p){var g=this;var h=g.getText("CAMPAIGN_LIST_FLD_TAG_GROUP_OTHER");var t=new sap.ui.model.json.JSONModel(p);t.attachRequestCompleted(null,function(){var r=t.getData().RANKED_TAG;var i=t.getData().TAG_GROUP;var j=g.groupByTagGroup(r,g.getViewProperty("/List/TAGS"),h);jQuery.each(j,function(k,n){if(n.GROUP_NAME==="Other"){i.push(n);}});g.setTagCloudProperty(j,t.getData().WITHOUT_GROUP!=="X");t.setData({"RANKED_TAG":j,"TAG_GROUP":i},false);g.setFilterModel(t,"tag");},t);},getItemTemplate:function(){var r;var i=this._check4ManagingList();if(i){r="Managed_Protrait";}if(i){if(this.getViewProperty("/ORIENTATION")===O.LANDSCAPE){r="Managed_Landscape";}}else if((!D.system.desktop&&D.orientation.landscape)||(D.system.desktop&&this.getViewProperty("/ORIENTATION")===O.LANDSCAPE)){r="Landscape";}else{r="Portrait";}var t;switch(r){case"Managed_Landscape":t=this.getFragment("sap.ino.vc.campaign.fragments.CampaignListItem");break;case"Landscape":t=this.getFragment("sap.ino.vc.campaign.fragments.FlatListItem");break;case"Portrait":t=this.getFragment("sap.ino.vc.campaign.fragments.CardListItem");break;case"Managed_Protrait":t=this.getFragment("sap.ino.vc.campaign.fragments.ManagedCardListItem");break;default:break;}return t;},onOrientationChange:function(g){var i=this._check4ManagingList();if(this.getList()){if(i){if(this.getPortraitStyle){this.getList().addStyleClass(this.getPortraitStyle());}if(this.getLandscapeStyle){this.getList().removeStyleClass(this.getLandscapeStyle());}}}if(this.getList()){if(i||g===O.LANDSCAPE||g.landscape){if(g===O.LANDSCAPE){if(this.getPortraitStyle){this.getList().removeStyleClass(this.getPortraitStyle());}if(this.getLandscapeStyle){this.getList().addStyleClass(this.getLandscapeStyle());}}}else{if(this.getPortraitStyle){this.getList().addStyleClass(this.getPortraitStyle());}if(this.getLandscapeStyle){this.getList().removeStyleClass(this.getLandscapeStyle());}}this.getList().setWrapping(!(g===O.LANDSCAPE));}},setParameters:function(q,g){B.prototype.setParameters.apply(this,arguments);this.setViewProperty("/List/MANAGE",g.MANAGE);this.setViewProperty("/List/TAGCLOUD",true);q=q||{};var r=q.respCode;var h=q.hasBlog;this.setViewProperty("/List/RESP_CODE",r);this.setViewProperty("/List/HAS_BLOG",h);this.removeSubFilterPageContent();this.addSubFilterPageContent(this.getAdditionalFilter());},onVariantPress:function(g,h){B.prototype.onVariantPress.apply(this,[g,h,"campaignlistvariant","campaignlist"]);},updateFilter:function(){var g=[];this.setFilter([]);if(!this.getCurrentVariant().INCLUDE_DRAFT&&!this.isCampaignDraftFilterExisted()){g.push(new F("STATUS_CODE",a.NE,"sap.ino.config.CAMP_DRAFT"));}var r=this.getViewProperty("/List/RESP_CODE");if(r){g.push(new F("RESP_CODE",a.EQ,r));}var h=this.getViewProperty("/List/HAS_BLOG");switch(h){case"1":g.push(new F("BLOG_COUNTS",a.GE,1));break;case"0":g.push(new F("BLOG_COUNTS",a.EQ,null));break;default:break;}if(g.length>0){this.addFilter(new F({filters:g,and:true}));}},isCampaignDraftFilterExisted:function(){var g=this.getFilter();var h;for(var i=0;i<g.length;i++){h=g[i];if(h.aFilters&&h.aFilters.length>0){if(h.aFilters[0].oValue1==="sap.ino.config.CAMP_DRAFT"&&h.aFilters[0].sOperator===a.NE&&h.aFilters[0].sPath==="STATUS_CODE"){return true;}}}return false;},onItemPress:function(g){var i=g.getSource();var h=i.getBindingContext("data");if(h){this.navigateTo("campaign",{id:h.getProperty("ID")});}},onCardItemPress:function(g){var i=g.getSource();var h=i.getAggregation("content")[0];h.getFocusDomRef().focus();},onCreateIdea:function(g){this.navigateTo("idea-create",{query:{campaign:g.getParameter("campaignId")}});},onSetFilterBarVisible:function(){this.bindTagCloud();},onApplyFilter:function(){var g=this.getFilterDialog();if(JSON.stringify(this.getViewModelBackup())===JSON.stringify(this.getViewProperty("/"))){g.close();return;}var q=this.getQuery();var h=this.getViewProperty("/List/VARIANT");var r=this.getRoute();var p={query:q};p.variant=h;this.navigateTo(this.getRoute(true),p,true,true);g.close();},formatObjectListVariantsVisible:function(i,I){return true;},_check4ManagingList:function(){var g=C.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");if(g){var h=this.getViewProperty("/List/VARIANT");var i=this.getListProperty("/Variants/Values");var j=jQuery.grep(i,function(k){return k.ACTION===h;});j=(j&&j.length>0)?j[0]:{};return j.MANAGE||false;}return false;},onCampaignsListItemPress:function(g){var i=g.getSource();var h=i.getBindingContext("data");if(h){this.navigateTo("campaign",{id:h.getProperty("ID")});}},onOpenCampaignSettings:function(g){var h=g.getSource();var i=h.getBindingContext("data");this.navigateToByURLInNewWindow(C.getCampaignSettingsURL(i.getProperty("ID")));},createState:function(r,g,q,p){var h=B.prototype.createState.apply(this,arguments);h.query.status=q.status;h.query.respCode=q.respCode;h.query.hasBlog=q.hasBlog;return h;},getQuery:function(){var q={};var g=this.getViewProperty("/List/SORT");var r=this.getViewProperty("/List/RESP_CODE");var h=this.getViewProperty("/List/HAS_BLOG");var t=this.getViewProperty("/List/TAGS");var i=this.getViewProperty('/List/QUICKSORT');var j=this.getViewProperty('/List/SEARCH');if(g){q.sort=g;}if(r){q.respCode=r;}if(h){q.hasBlog=h;}if(t&&t.length>0){q.tags=JSON.stringify(t);}if(i){q.quickSort=i;}if(j){q.search=j;}return q;},addSubFilterPageContent:function(g){var n=this.getFilterNavContainer();var p=n.getPages();p[0].getContent()[0].addItem(g);},removeSubFilterPageContent:function(){var n=this.getFilterNavContainer();var p=n.getPages();var g=p[0].getContent()[0];if(g.getItems().length>2){g.getItems()[2].destroy(true);}},onFilterRespListChange:function(g){var h=g.getSource().getSelectedItem();if(h.getSelectedItem){h=h.getSelectedItem();}var k=h.getProperty("key");this.setViewProperty("/List/RESP_CODE",k);this.navigateIntern(this.getQuery(),true,true);},onFilterHasBlogChange:function(g){var h=g.getSource().getSelectedItem();if(h.getSelectedItem){h=h.getSelectedItem();}var k=h.getProperty("key");this.setViewProperty("/List/HAS_BLOG",k);this.navigateIntern(this.getQuery(),true,true);},getAdditionalFilter:function(){var g;g=this.createFragment("sap.ino.vc.campaign.fragments.FilterItems",this.createIdForFilterElement());return g;},onMoreFilterChange:function(g){var n=this.getFilterNavContainer();var p=n.getPages();var h=p[0].getContent()[0];if(h.getItems().length>2){var _=function(i){this.getFilterElementById("filterItems").setBusy(false);}.bind(this,h);this.setViewProperty("/List/IS_SHOW_MORE_FILTER",true);g.getSource().setVisible(false);this.getFilterElementById("filterItems").setBusyIndicatorDelay(0).setBusy(true);setTimeout(function(i){this.bindFilters(i);}.bind(this,_),0);}},bindFilters:function(g){var t=this;var h=this.getModel("view");var r=C.getBackendRootURL()+"/sap/ino/xs/rest/common/campaign_filter_resp_values.xsjs";var p={CAMPAIGN_ID:this.getBindingParameter().CampaignId===undefined?undefined:parseInt(this.getBindingParameter().CampaignId,10)};var H=[];H.push({code:L.NULL,text:""});H.push({code:L.YES,text:t.getText("CAMPAIGN_LIST_MIT_FILTER_YES")});H.push({code:L.NO,text:t.getText("CAMPAIGN_LIST_MIT_FILTER_NO")});h.setProperty("/HAS_BLOG",H);jQuery.ajax({url:r,headers:{"X-CSRF-Token":"Fetch"},data:p,type:"GET",contentType:"application/json; charset=UTF-8",async:false,success:function(i){var j=i.RespValues;if(j&&j.length>0){j.sort(function(P,n){return P.DEFAULT_TEXT.localeCompare(n.DEFAULT_TEXT);});}var k=[{CODE:"",DEFAULT_LONG_TEXT:"",DEFAULT_TEXT:""}].concat(j);h.setProperty("/resp",k);if(g&&typeof g==="function"){g();}}});},resetFilter:function(){var r=this.getRoute();this.setViewProperty("/List/RESP_CODE","");this.setViewProperty("/List/HAS_BLOG","");B.prototype.resetFilter.apply(this,arguments);},onFilterReset:function(){this.setViewProperty("/List/TAGS",[]);this.setViewProperty("/List/IS_TAGS_SELECTION",false);this.setViewProperty("/List/IS_SHOW_MORE_FILTER",false);this.resetFilter();if(!D.system.desktop){return;}this.navigateIntern(this.getQuery(),true);},changeDefaultSortOfVariant:function(g,q){if(q&&q.search&&(g.ACTION==="manage"||g.ACTION==="all")){g.DEFAULT_SORT="SEARCH_SCORE";}else if(g.ACTION==="manage"||g.ACTION==="all"){jQuery.each(this.list.Variants.Values,function(i,h){if(h.ACTION===g.ACTION){g.DEFAULT_SORT=h.DEFAULT_SORT;return false;}});}},onOfficeToggle:function(){var g=this.getModel("component").getProperty("/SHOW_BACKOFFICE");g=!g;this.getModel("component").setProperty("/SHOW_BACKOFFICE",g);var h={query:{},variant:''};if(g){h.variant=v.MANAGE;}else{h.variant=v.ALL;}if(this.getViewProperty("/List/SEARCH")){h.query.search=this.getViewProperty("/List/SEARCH");h.query.sort=this.getViewProperty("/List/SORT");}this.navigateTo("campaignlistvariant",h,true,true);}}));e.list=m;e.listContext=l;return e;});
