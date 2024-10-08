sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ino/commons/models/object/Campaign",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/application/WebAnalytics",
    "sap/ui/core/mvc/ViewType"
], function (Controller, Campaign, TopLevelPageFacet, WebAnalytics, ViewType) {
    "use strict";
    
    return Controller.extend("sap.ino.vc.campaign.CampaignCommentList", jQuery.extend({}, TopLevelPageFacet, {
        
        routes : ["campaign-comment"],
        
        onInit: function () {
            Controller.prototype.onInit.apply(this, arguments);
        },
        
        onRouteMatched : function(oEvent) {
            var that = this;
            var oArguments = oEvent.getParameter("arguments");
            var iCampaignId = parseInt(oArguments.id, 10);
            
            this.bindDefaultODataModel(iCampaignId, function() {
                var oCampaign = that.getDefaultODataModelEntity(iCampaignId);
                if (oCampaign) {
                    that.updateBackgroundColor(oCampaign.COLOR_CODE);
                    that.setBackgroundImages(oCampaign.CAMPAIGN_BACKGROUND_IMAGE_ID, oCampaign.CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID);
                }
            });
            
            var oCommentView = this.byId("campaignCommentListComment");
            oCommentView.data("object_id", iCampaignId);
            oCommentView.getController()._commentMixinResetCommentModel();
        },
        
        hasBackgroundImage: function(){
            return true;
        },
        
        getODataEntitySet: function () {
            return "CampaignFull";
        }
        
    }));
});