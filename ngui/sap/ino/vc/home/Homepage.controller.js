sap.ui.define([
    "sap/ino/vc/commons/BaseHomepageController",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/application/Configuration"
    
], function (BaseController, TopLevelPageFacet, Configuration) {
    "use strict";

    return BaseController.extend("sap.ino.vc.home.Homepage", jQuery.extend({}, TopLevelPageFacet, {
    	routes : ["home"],
    	
    	// use the provided base controller function
        onRouteMatched : function (oEvent) {
            BaseController.prototype.onRouteMatched.apply(this, arguments);
        },
         
        onBeforeDisplayViewShow : function() {
            
        },
        
        getDisplayView : function() {
            var sDisplayView;
        	var bShowBackoffice = this.getModel("component").getProperty("/SHOW_BACKOFFICE");
        	
        	if(bShowBackoffice){
        	    sDisplayView = "sap.ino.vc.home.BackOfficeHome";
        	    this.setHelp("HOME_BACK");
        	}
        	else{
        	    sDisplayView = "sap.ino.vc.home.CommunityHome";
        	    this.setHelp("HOME_COMM","HOME_COMM_ADDITIONAL");
        	} 
        	
        	return sDisplayView;
        },
        
        getLayoutPrefix : function() {
            return "sapInoHomeHomepage";
        },
        
        getODataEntitySet: function () {
            return undefined ;
        },
        
        // use the provided base controller function
        onBeforeHide : function() {
            if(BaseController.prototype.onBeforeHide){
            BaseController.prototype.onBeforeHide.apply(this, arguments);}
        },
        
        onBackofficeSettings : function() {
            this.navigateToByURLInNewWindow(Configuration.getBackendRootURL() + "/" +
                Configuration.getSystemSetting("sap.ino.config.URL_PATH_UI_BACKOFFICE"));
        },
        
        openCampaignSettings : function(iCampaignId) {
            this.navigateToByURLInNewWindow(Configuration.getCampaignSettingsURL(iCampaignId));
        }
    }));
});