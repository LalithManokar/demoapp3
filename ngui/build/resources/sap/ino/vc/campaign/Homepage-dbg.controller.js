sap.ui.define([
    "sap/ino/vc/commons/BaseHomepageController",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/application/WebAnalytics",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ui/model/json/JSONModel",
    "sap/ino/vc/campaign/mixins/CampaignInstanceRolesMixin"
], function(BaseController, TopLevelPageFacet, Configuration, WebAnalytics, PropertyModel, JSONModel, CampaignInstanceRolesMixin) {
	"use strict";

	return BaseController.extend("sap.ino.vc.campaign.Homepage", jQuery.extend({}, CampaignInstanceRolesMixin, TopLevelPageFacet, {
		routes: ["campaign"],

		// use the provided base controller function
		onRouteMatched: function(oEvent) {
			var oArgs = oEvent.getParameter("arguments");
			this.iCampaignId = parseInt(oArgs.id, 0);

			if (this.iCampaignId > 0) {
				WebAnalytics.logCampaignView(this.iCampaignId);
			   var sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/update_object_view_count.xsjs";
		       var oBody = {OBJECT_TYPE:"CAMPAIGN",OBJECT_ID:this.iCampaignId,USER_NAME:Configuration.getCurrentUser().USER_NAME};
		       var oAjaxPromise = jQuery.ajax({
            			url: sURL,
            			headers: {
            				"X-CSRF-Token": Configuration.getXSRFToken()
            			},
            			data:  JSON.stringify(oBody),
            			dataType:"json",
            			type: "POST",
            			contentType: "application/json; charset=UTF-8",
            			async: true
            		});				
            		oAjaxPromise.done();
				
			}

			BaseController.prototype.onRouteMatched.apply(this, arguments);
			this.setHelp("CAMPAIGN_DISPLAY", "CAMPAIGN_DISPLAY_ADDITIONAL");
			
		},

		onBeforeDisplayViewShow: function() {
			var oView = this.getView();
			if (oView.getBindingContext("data")) {
				var iImageId = oView.getBindingContext("data").getProperty("CAMPAIGN_BACKGROUND_IMAGE_ID");
				var iSmallImageId = oView.getBindingContext("data").getProperty("CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID");

				this.updateBackgroundColor(oView.getBindingContext("data").getProperty("COLOR_CODE"));
				this.setBackgroundImages(iImageId, iSmallImageId);
			}
		},

		getDisplayView: function(iId) {
			var sDisplayView;
			var bShowBackoffice = this.getModel("component").getProperty("/SHOW_BACKOFFICE");
			var bHasBackofficePrivilege = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");
			var bRegistrationPrivilege = this.getModel("component").getProperty("/REGISTRABLE");
			var bCommunityPrivilege = this.getModel("component").getProperty("/COMMUNITY");

			if (!bHasBackofficePrivilege) {
				// Only determine campaign individual backoffice privileges when the static privilege is there
				// otherwise this is done for *all* users and will cause 403 HTTP responses
				bShowBackoffice = false;
				// set a dummy model so that bindings still work
				this.setModel(new JSONModel({}), "property");
			} else {
				//add for individual campaign privilege check, if iID is undefined, this function is triggered by toggle button
				if (iId) {
					var oCampaignProperty = new PropertyModel("sap.ino.xs.object.campaign.Campaign", iId, {
						nodes: ["Root"]
					}, true);
					this.setModel(oCampaignProperty, "property");
					var bCampaignPrivilege = oCampaignProperty.getProperty("/nodes/Root/customProperties/backofficeCampaignPrivilege");
					bShowBackoffice = bShowBackoffice && bCampaignPrivilege;
				}
			}
			this.getCampaignInstanceRolesData(iId);
			if (bShowBackoffice) {
				sDisplayView = "sap.ino.vc.campaign.BackOfficeHome";
			} else if (bCommunityPrivilege) {
				sDisplayView = "sap.ino.vc.campaign.CommunityHome";
			} else if (bRegistrationPrivilege) {
				sDisplayView = "sap.ino.vc.campaign.RegistrationHome";
			} else {
				sDisplayView = "sap.ino.vc.campaign.CommunityHome";
			}

			return sDisplayView;
		},

		hasBackgroundImage: function() {
			return true;
		},

		getLayoutPrefix: function() {
			return "sapInoCampaignHomepage";
		},

		getODataEntitySet: function() {
			return "CampaignFull";
		},

		// use the provided base controller function
		onBeforeHide: function() {
			BaseController.prototype.onBeforeHide.apply(this, arguments);
		},

		openCampaignSettings: function(iCampaignId) {
			this.navigateToByURLInNewWindow(Configuration.getCampaignSettingsURL(iCampaignId));
		}
	}));
});