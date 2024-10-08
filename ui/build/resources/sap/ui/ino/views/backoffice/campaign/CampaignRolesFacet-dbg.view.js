/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.PeopleFacetView");
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignRolesFacet", jQuery.extend({},
	sap.ui.ino.views.common.PeopleFacetView, {

		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.campaign.CampaignRolesFacet";
		},

		createFacetContent: function() {
			var oController = this.getController();
			var bCampaignMgrForCampaignPrivilege = (sap.ui.ino.application.Configuration.hasCurrentUserPrivilege(
				"sap.ino.xs.rest.admin.application::execute") || sap.ui.ino.application.Configuration.hasCurrentUserPrivilege(
				"sap.ino.ui::campaign_manager"));
			var bCampaignMgrEditRespPrivilege = oController.getModel().getPropertyModel().getProperty(
				"/nodes/Root/customProperties/campaignMgrEditRespPrivilege");

			return this.createPeopleTabStrip("BO_CAMPAIGN_FACET_ROLES", {
				mailSettings: {
					key: "/ID",
					type: "campaign"
				}
			}, [{
				childPath: "Managers",
				identifier: "CAMP_MANAGER",
				text: "BO_CAMPAIGN_FACET_ROLES_FLD_CAMP_MANAGERS",
				settings: {
					edit: true,
					// Campaign managers should not be able to remove themselves as this causes technical issues (e.g. campaign cannot be read any more)
					selfDeletion: sap.ui.ino.application.Configuration.hasCurrentUserPrivilege("sap.ino.xs.rest.admin.application::campaign"),
					enableAddUserGroup: bCampaignMgrForCampaignPrivilege
				}
                }, {
				childPath: "Coaches",
				identifier: "COACH",
				text: "BO_CAMPAIGN_FACET_ROLES_FLD_COACHES",
				settings: {
					edit: true,
					enableEditResp: bCampaignMgrEditRespPrivilege,
					enableAddUserGroup: bCampaignMgrForCampaignPrivilege
				}
                }, {
				childPath: "Experts",
				identifier: "EXPERT",
				text: "BO_CAMPAIGN_FACET_ROLES_FLD_EXPERTS",
				settings: {
					edit: true,
					enableEditResp: bCampaignMgrEditRespPrivilege,
					enableAddUserGroup: bCampaignMgrForCampaignPrivilege
				}
                }, {
				childPath: "Participants",
				identifier: "PARTICIPATE",
				text: "BO_CAMPAIGN_FACET_ROLES_FLD_PARTICIPATES",
				settings: {
					edit: true,
					enableAddUserGroup: bCampaignMgrForCampaignPrivilege
				}
                }, {
				childPath: "Registers",
				identifier: "REGISTRATION",
				text: "BO_CAMPAIGN_FACET_ROLES_FLD_REGISTRATION",
				settings: {
					edit: true,
					enableAddUserGroup: bCampaignMgrForCampaignPrivilege
				}
                }]);
		}
	}));