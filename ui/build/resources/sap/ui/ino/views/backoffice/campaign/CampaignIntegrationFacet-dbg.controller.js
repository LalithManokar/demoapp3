/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationFormatterMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationCommonActionsMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationActionsMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationValidationMixin");
jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationFacet",
	jQuery.extend({}, sap.ui.ino.views.common.FacetAOController,
		sap.ui.ino.views.backoffice.campaign.CampaignIntegrationFormatterMixin,
		sap.ui.ino.views.backoffice.campaign.CampaignIntegrationCommonActionsMixin,
		sap.ui.ino.views.backoffice.campaign.CampaignIntegrationActionsMixin,
		sap.ui.ino.views.backoffice.campaign.CampaignIntegrationValidationMixin, {
			_MAPPING_VALUE_TYPES: {
				VARIANT: "Variant",
				CONSTANT: "Constant"
			},
			_getViewPropertyValue: function(sPropertyName) {
			    if(!this._getModel("viewCampIntegration")){
			        return undefined;
			    }
				return this._getModel("viewCampIntegration").getProperty(sPropertyName);
			},
			_setViewPropertyValue: function(sPropertyName, value) {
				return this._getModel("viewCampIntegration").setProperty(sPropertyName, value);
			},
			_setViewModel: function(sModel, sModelName) {
				this.getThingInspectorController().getView().getInspector().setModel(sModel, sModelName);
			},
			_getModel: function(sModelName) {
				return this.getThingInspectorController().getView().getInspector().getModel(sModelName);
			}
		}));