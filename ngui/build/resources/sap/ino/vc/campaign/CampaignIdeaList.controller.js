sap.ui.define(["sap/ino/vc/idea/List.controller","sap/ino/vc/commons/TopLevelPageFacet","sap/ui/Device","sap/ino/commons/application/Configuration","sap/ui/model/json/JSONModel","sap/ino/commons/models/aof/PropertyModel","sap/ino/vc/campaign/mixins/CampaignInstanceRolesMixin"],function(I,T,D,C,J,P,a){"use strict";return I.extend("sap.ino.vc.campaign.CampaignIdeaList",jQuery.extend({},a,T,{routes:["campaign-idealist","campaign-idealistvariant"],onInit:function(){I.prototype.onInit.apply(this,arguments);this.setViewProperty("/HIDE_CAMPAIGN_FILTER",true);},onRouteMatched:function(e){this.setGlobalFilter([]);var A=e.mParameters.arguments;var q=A["?query"]||{};q.campaign=A.id;q.variant=A.variant;var t=this;var i;var s;var v=this.getView();var f=function(){t.updateBackgroundColor(v.getBindingContext("data").getProperty("COLOR_CODE"));i=v.getBindingContext("data").getProperty("CAMPAIGN_BACKGROUND_IMAGE_ID");s=v.getBindingContext("data").getProperty("CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID");t.setBackgroundImages(i,s);t.show((this.getRoute()==="campaign-idealist")?"idealist":"idealistvariant",q);t.getCampaignInstanceRolesData(t._iCampaignId);};var S=function(E){var p=E.getSource();var V=t.getModel("list").getProperty("/Variants/Values");p.destroy();};this._iCampaignId=parseInt(A.id,10);if(C.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")){var o=new P("sap.ino.xs.object.campaign.Campaign",this._iCampaignId,{nodes:["Root"]},false,S);}this.bindCampaignODataModel(this._iCampaignId,f);},onAfterShow:function(){this._bPreviouslyFullscreen=this.getFullScreen();if(!this._bPreviouslyFullscreen){this.setFullScreen(true);}},onBeforeHide:function(){this.setFullScreen(this._bPreviouslyFullscreen);},hasBackgroundImage:function(){return true;},onVariantPress:function(v){if(!D.system.desktop){return;}var q=this.getQuery();this.removeInvalidFilters(q);delete q.campaign;if(v){this.navigateTo(this.getRoute(true),{id:this._iCampaignId,variant:v,query:q},true,true);}else{this.navigateTo(this.getRoute(false),{id:this._iCampaignId,query:q},true,true);}},navigateIntern:function(q,r){var v=this.getViewProperty("/List/VARIANT");this.navigateTo(this.getCurrentRoute(),{"variant":v,"query":q,"id":this._iCampaignId},r,true);},bindTagCloud:function(){var b=this.getBindingParameter();var p=C.getTagcloudServiceURL(b.CampaignId,b.TagIds,b.SearchTerm,b.VariantFilter,!this.includeDrafts(),undefined,b.Filters);var c=this;if(this._lastTagServicePath!==p){var t=new J(p);var o=this.getText("IDEA_LIST_MIT_FILTER_TAG_OTHER");t.attachRequestCompleted(null,function(){var r=t.getData().RANKED_TAG||[];var d=t.getData().TAG_GROUP;var e=c.groupByTagGroup(r,c.getViewProperty("/List/TAGS"),o);jQuery.each(e,function(f,g){if(g.GROUP_NAME==="Other"){d.push(g);}});c.setTagCloudProperty(e,t.getData().WITHOUT_GROUP!=="X");t.setData({"RANKED_TAG":e,"TAG_GROUP":d},false);this.setFilterModel(t,"tag");},this);}this._lastTagServicePath=p;},bindCampaignODataModel:function(i,c){var t=this;var e="CampaignFull";if(i>0){this.getView().bindElement({path:"data>/"+e+"("+i+")",events:{dataRequested:function(){jQuery.each(t.getBusyControls(),function(b,d){if(jQuery.type(d.setBusy)==="function"){d.setBusy(true);}});},dataReceived:function(){jQuery.each(t.getBusyControls(),function(b,d){if(jQuery.type(d.setBusy)==="function"){d.setBusy(false);}});if(typeof c==="function"){c.apply(t);}}}});if(typeof c==="function"){var o=this.getView().getBindingContext("data");if(o&&o.getPath()===("/"+e+"("+i+")")){c.apply(t);}}}}}));});
