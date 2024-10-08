/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.models.object.SystemIntegration");
var Configuration = sap.ui.ino.application.Configuration;

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationCommonActionsMixin = {
		_initIntegrationViewModel: function() {
			var that = this;
			var sOdataPath = "/" + Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE");
			var oSysIntegrationModel = new sap.ui.model.json.JSONModel(Configuration.getBackendRootURL() + sOdataPath +
				"/SystemIntegration");
			this._setModel(oSysIntegrationModel, "sysIntegration");
			oSysIntegrationModel.attachRequestCompleted(oSysIntegrationModel, function() {
				var oList = oSysIntegrationModel.getProperty("/d/results");
				oList.unshift({
					ID: "",
					APINAME: "",
					TECHNICAL_NAME: "",
					STATUS: "active"
				});
			}, this);

			// get destinations
			var oDeffered = sap.ui.ino.models.object.SystemIntegration.getAllDestinations();
			// get INM mapping fields
			var oDeffered2 = sap.ui.ino.models.object.SystemIntegration.getAllMappingField();
			oDeffered2.done(function(oResp) {
				oResp.RESULT.unshift({
					FIELD_CODE: '',
					TEXT_CODE: '',
					TYPE_CODE: "REQUEST_MAPPING"
				}, {
					FIELD_CODE: '',
					TEXT_CODE: '',
					TYPE_CODE: "RESPONSE_MAPPING"
				});
				that._setModel(new sap.ui.model.json.JSONModel(oResp.RESULT), "inmFields");
				that._setModel(new sap.ui.model.json.JSONModel(oResp.RESULT.filter(function(oItem) {
					return oItem.TYPE_CODE === "REQUEST_MAPPING";
				})), "inmCurrentReqFields");
				that._setModel(new sap.ui.model.json.JSONModel(oResp.RESULT.filter(function(oItem) {
					return oItem.TYPE_CODE === "RESPONSE_MAPPING";
				})), "inmCurrentResFields");
				that._setModel(new sap.ui.model.json.JSONModel(oResp.RESULT.filter(function(oItem) {
					return oItem.TYPE_CODE === "RESPONSE_MAPPING" || oItem.TYPE_CODE === "NON_MAPPING_FIELD";
				})), "inmAllCodeFields");
			});
			oDeffered.done(function(oResp) {
				oResp.RESULT.unshift({
					"destPackage": "",
					"destName": "",
					"destHost": "",
					"destPort": null,
					"destPathPrefix": "",
					"destFullName": ""
				});
				that._setModel(new sap.ui.model.json.JSONModel(oResp.RESULT), "destList");
			});

			this._setModel(new sap.ui.model.json.JSONModel({
				"NewSysIntegration": -1,
				"CampaignMappingSelectedIndex": -1,
				"SegmentBtnSelectedIndex": 0,
				"CurrentSysIntegration": null,
				"CurrentSysDesitination": null,
				"CampaignMappingReqDetailVisible": false,
				"CampaignMappingResDetailVisible": false,
				"CurrentReeMappingFieldSelIndex": -1,
				"CurrentResMappingFieldSelIndex": -1,
				"CampaignApiFieldLayoutSelectedIndex": -1
			}), "viewCampIntegration");
		},

		_setModel: function(oModel, sModelName) {
			this.getView().getInspector().setModel(oModel, sModelName);
		},

		_saveCurrentMappingModel: function() {
			var rowIndex = this.getModel().getProperty("/CampaignMappingSelectedIndex"),
				currentSysIntegration = this.getModel().getProperty("/CampaignIntegration")[rowIndex],
				segBtnSelectedIndex = this.getModel().getProperty("/SegmentBtnSelectedIndex"),
				sPrefixField = segBtnSelectedIndex > 0 ? "FETCH_" : "CREATE_";
			if (rowIndex > -1 && currentSysIntegration && segBtnSelectedIndex < 2) {
				if (currentSysIntegration.REQ_JSON_TREE) {
					this.getModel().setProperty("/CampaignIntegration/" + rowIndex + "/" + sPrefixField + "REQ_JSON", JSON.stringify(
						currentSysIntegration.REQ_JSON_TREE));
				}
				if (currentSysIntegration.RES_JSON_TREE) {
					this.getModel().setProperty("/CampaignIntegration/" + rowIndex + "/" + sPrefixField + "RES_JSON", JSON.stringify(
						currentSysIntegration.RES_JSON_TREE));
				}
			}
		}
	};
}());