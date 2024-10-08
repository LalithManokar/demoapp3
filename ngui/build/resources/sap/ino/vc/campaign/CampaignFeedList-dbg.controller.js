sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ino/commons/models/object/Campaign",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/application/WebAnalytics",
    "sap/ui/core/mvc/ViewType",
    "sap/ino/vc/follow/mixins/FeedsMixin"
], function (Controller, Campaign, TopLevelPageFacet, WebAnalytics, ViewType, FeedsMixin) {
    "use strict";
    
    return Controller.extend("sap.ino.vc.campaign.CampaignFeedList", jQuery.extend({}, TopLevelPageFacet, FeedsMixin, {
        
        routes : ["campaign-feeds"],
        
        onInit: function () {
            Controller.prototype.onInit.apply(this, arguments);
        },
        
        getCurrentView: function() {
			var aContent = this.getView().getContent();
			var oPage = (aContent && aContent.length > 0) ? aContent[1] : undefined;
			if (oPage) {
				if (oPage.getContent().length > 0) {
					return oPage.getContent()[0];
				}
			}
			return undefined;
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
            
            var oCurrentView = this.getCurrentView();
			if (oCurrentView && oCurrentView.getController)  {
				var oCurrentController = oCurrentView.getController();

				if (typeof oCurrentController.onRouteMatched === "function") {
					oCurrentController.onRouteMatched(oEvent);
				}
			}
			this.setHelp("CAMPAIGN_FEED");
           
        },
        
        onRefresh: function() {
            var oCurrentView = this.getCurrentView();
			if (oCurrentView && oCurrentView.getController()) {
				var oCurrentController = oCurrentView.getController();

				if (typeof oCurrentController.onRefresh === "function") {
					oCurrentController.onRefresh();
				}
			}
        },
        
        hasBackgroundImage: function(){
            return true;
        },
        
        getODataEntitySet: function () {
            return "CampaignFull";
        }
        
    }));
});