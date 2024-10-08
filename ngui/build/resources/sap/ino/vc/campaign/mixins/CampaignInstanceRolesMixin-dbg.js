sap.ui.define([], function() {
	"use strict";

	/**
	 * @class
	 * CampaignInstanceRolesMixin
	 */
	var CampaignInstanceRolesMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	CampaignInstanceRolesMixin.getCampaignInstanceRolesData = function(iId) {
		var that = this;
		var sCampaignInstanceRoles = "/CampaignFull(" + iId + ")/InstanceRoles";
		if (!this.getModel("data").getProperty(sCampaignInstanceRoles)) {
			this.getModel("data").read(sCampaignInstanceRoles, {
				async: true,
				success: function(oData) {
					that.getModel("component").setProperty(sCampaignInstanceRoles, oData);
				},
				error: function() {
					that.getModel("component").setProperty(sCampaignInstanceRoles, undefined);
				}
			});
		}
	};

	return CampaignInstanceRolesMixin;
});