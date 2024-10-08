sap.ui.define(["sap/ino/vc/commons/BaseObjectModifyController","sap/ino/commons/models/object/Campaign","sap/ino/vc/commons/TopLevelPageFacet","sap/ino/commons/application/WebAnalytics","sap/ui/core/mvc/ViewType"],function(C,a,T,W,V){"use strict";return C.extend("sap.ino.vc.campaign.CampaignCommentList",jQuery.extend({},T,{routes:["campaign-comment"],onInit:function(){C.prototype.onInit.apply(this,arguments);},onRouteMatched:function(e){var t=this;var A=e.getParameter("arguments");var c=parseInt(A.id,10);this.bindDefaultODataModel(c,function(){var b=t.getDefaultODataModelEntity(c);if(b){t.updateBackgroundColor(b.COLOR_CODE);t.setBackgroundImages(b.CAMPAIGN_BACKGROUND_IMAGE_ID,b.CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID);}});var o=this.byId("campaignCommentListComment");o.data("object_id",c);o.getController()._commentMixinResetCommentModel();},hasBackgroundImage:function(){return true;},getODataEntitySet:function(){return"CampaignFull";}}));});
