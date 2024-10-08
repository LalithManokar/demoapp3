sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function (Controller, TopLevelPageFacet) {
    "use strict";
    
    return Controller.extend("sap.ino.vc.campaign.CampaignManagerList", jQuery.extend({}, TopLevelPageFacet, {
        
        routes : ["campaign-managerlist"],
        
        onInit: function () {
            Controller.prototype.onInit.apply(this, arguments);
        },
        
        onRouteMatched : function(oEvent) {
            var oArguments = oEvent.getParameter("arguments");
            var iCampaignId = parseInt(oArguments.id, 10);
            
            this.bindDefaultODataModel(iCampaignId);
        },
        
        getODataEntitySet: function () {
            return "CampaignFull";
        }
        
    }));
});