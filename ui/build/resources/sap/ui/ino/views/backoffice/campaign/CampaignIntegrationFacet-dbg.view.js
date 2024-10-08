/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationMappingCommonLayoutMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationMappingLayoutMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationRequestMappingLayoutMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationResponseMappingLayoutMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationFieldPreviewLayoutMixin");
jQuery.sap.require("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationApiFieldLayoutMixin");

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationFacet",
	jQuery.extend({}, sap.ui.ino.views.common.FacetAOView,
		sap.ui.ino.views.backoffice.campaign.CampaignIntegrationMappingCommonLayoutMixin,
		sap.ui.ino.views.backoffice.campaign.CampaignIntegrationMappingLayoutMixin,
		sap.ui.ino.views.backoffice.campaign.CampaignIntegrationRequestMappingLayoutMixin,
		sap.ui.ino.views.backoffice.campaign.CampaignIntegrationResponseMappingLayoutMixin,
		sap.ui.ino.views.backoffice.campaign.CampaignIntegrationFieldPreviewLayoutMixin,
		sap.ui.ino.views.backoffice.campaign.CampaignIntegrationApiFieldLayoutMixin, {
			getControllerName: function() {
				return "sap.ui.ino.views.backoffice.campaign.CampaignIntegrationFacet";
			},

			createFacetContent: function() {
				var oView = this;
				var oController = oView.getController();
				var bEdit = oController.isInEditMode();
				var oLayout = new sap.ui.commons.layout.MatrixLayout();
				this.createIntegrationLayout(oLayout, bEdit);
				var content = [new sap.ui.ux3.ThingGroup({
					content: oLayout,
					colspan: true
				})];
				var oApplicationModel = oController.getModel();
				if(oApplicationModel){
				    oApplicationModel.setProperty("/SegmentBtnSelectedIndex", oController._getViewPropertyValue("/SegmentBtnSelectedIndex"));
				}
				return content;
			},

			onShow: function() {
				this.getController().getModel().setProperty("/SegmentBtnSelectedIndex", this.getController()._getViewPropertyValue("/SegmentBtnSelectedIndex"));
			},

			onHide: function() {
				this.getController()._saveCurrentMappingModel();
			},

			createIntegrationLayout: function(oLayout, bEdit) {
				this._createEnableRow(oLayout, bEdit);
				this._createCampaignMappingPanel(oLayout, bEdit);
				this._createCampaignConfigApiFieldLayout(oLayout, bEdit);
				this._createCampaignFieldPreviewPanel(oLayout, bEdit);
				this._createCampaignMappingRequestPanel(oLayout, bEdit);
				this._createCampaignMappingResponsePanel(oLayout, bEdit);
			}
		}));