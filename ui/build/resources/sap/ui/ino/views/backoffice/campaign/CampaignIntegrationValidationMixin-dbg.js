/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

jQuery.sap.require("sap.ui.commons.MessageBox");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationValidationMixin = {
		_validateIntegrationDuplicateSysMapping: function(oSysIntegration) {
			var aCampaignIntegration = this.getModel().getProperty("/CampaignIntegration"),
				bResult = true;
			if (!aCampaignIntegration || aCampaignIntegration.length <= 0) {
				return true;
			}
			aCampaignIntegration.forEach(function(oItem) {
				if (oItem.TECHNICAL_NAME === oSysIntegration.TECHNICAL_NAME && oItem.APINAME === oSysIntegration.APINAME && oItem.SYSTEM_PACKAGE_NAME ===
					oSysIntegration.SYSTEM_PACKAGE_NAME) {
					bResult = bResult && false;
				}
			});
			return bResult;
		},
		_validateIntegrationResponseInmAttriDuplicate: function(sKey) {
			var oCurrentSysIntegration = this._getViewPropertyValue("/CurrentSysIntegration"),
				sTechName = this._getModel("viewCampIntegration").getProperty("/CurrentSysIntegrationResFields").technicalName;
			if (!sKey || !oCurrentSysIntegration || !oCurrentSysIntegration.RES_JSON_TREE || !oCurrentSysIntegration.RES_JSON_TREE.children ||
				oCurrentSysIntegration.RES_JSON_TREE.children.length <= 0) {
				return true;
			}
			return this._validateIntegrationResponseInmAttriDuplicateChildren(oCurrentSysIntegration.RES_JSON_TREE.children, sKey, sTechName);
		},
		_validateIntegrationResponseInmAttriDuplicateChildren: function(aFileds, sKey, sTechName) {
			var aFilterFields = aFileds.filter(function(oField) {
					return oField.mappingField === sKey && sTechName !== oField.technicalName;
				}),
				bResult = true,
				oController = this;
			if (aFilterFields && aFilterFields.length > 0) {
				return false;
			}
			aFileds.forEach(function(oField) {
				if (bResult && oField.children && oField.children.length > 0) {
					bResult = bResult && oController._validateIntegrationResponseInmAttriDuplicateChildren(oField.children, sKey, sTechName);
				}
			});
			return bResult;
		},
		_validateIntegrationDisplaySequence: function() {
			var aCampaignIntegration = this.getModel().getProperty("/CampaignIntegration"),
				sMsg = "",
				that = this;
			if (!aCampaignIntegration || aCampaignIntegration.length <= 0) {
				return true;
			}
			aCampaignIntegration.forEach(function(oItem) {
				sMsg += that._validateIntegrationDisplaySequenceWithOutputMsg(oItem.APINAME, oItem.CREATE_RES_JSON, that.getTextModel().getText(
					"BO_CAMPAIGN_INTEGRATION_BTN_CREATE_API"));
				sMsg += that._validateIntegrationDisplaySequenceWithOutputMsg(oItem.APINAME, oItem.FETCH_RES_JSON, that.getTextModel().getText(
					"BO_CAMPAIGN_INTEGRATION_BTN_UPDATE_API"));
			});
			if (sMsg.length > 0) {
				sap.ui.commons.MessageBox.alert(sMsg, function() {},
					that.getTextModel().getText("BO_INTEGRATION_MAPPING_FIELD_DIAPLAY_SEQUENCE_WARNING_TITLE")
				);
			}
			return sMsg.length === 0;
		},
		_validateIntegrationDisplaySequenceWithOutputMsg: function(sApiName, sItem, sKey) {
			if (!sItem) {
				return "";
			}
			var oItem = JSON.parse(sItem);
			var aMissNumber = [],
				aDuplicatePath = [];
			var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			var sMsg = "",
				that = this;
			that._validateIntegrationDisplaySequenceWithOutput(oItem.children, aMissNumber, aDuplicatePath);
			if (aMissNumber.length > 0) {
				sMsg += oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_FIELD_DISPLAY_SEQUENCE_MISS_WARNING', [aMissNumber.length > 3 ?
					(aMissNumber.splice(3) && aMissNumber.join(",") + "...") : aMissNumber.join(","), sKey, sApiName]) + "\r\n";
			}
			aDuplicatePath.forEach(function(aPath) {
				sMsg += oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_FIELD_DISPLAY_SEQUENCE_DUPLICATE_WARNING', [aPath.length > 3 ?
					(aPath.splice(3) && aPath.join(",") + "...") : aPath.join(","), sKey, sApiName]) + "\r\n";
			});
			return sMsg;
		},
		_validateIntegrationDisplaySequenceWithOutput: function(oItem, aMissNumber, aDuplicatePath) {
			var oExistsDisplayNumber = {},
				index = 1,
				nMax = 0;
			if (!oItem || oItem.length <= 0) {
				return true;
			}
			this._validateIntegrationDisplaySequenceChildren(oItem, oExistsDisplayNumber);
			Object.keys(oExistsDisplayNumber).forEach(function(sKey) {
				if (nMax < Number(sKey)) {
					nMax = Number(sKey);
				}
			});
			while (index <= nMax) {
				if (!oExistsDisplayNumber[index]) {
					aMissNumber.push(index);
				} else if (oExistsDisplayNumber[index].length > 1) {
					aDuplicatePath.push(oExistsDisplayNumber[index]);
				}
				index++;
			}
		},
		_validateIntegrationDisplaySequenceChildren: function(aFileds, oExistsDisplayNumber) {
			var that = this;
			aFileds.forEach(function(oField) {
				if (oField.displaySequence > 0) {
					oExistsDisplayNumber[oField.displaySequence] = oExistsDisplayNumber[oField.displaySequence] || [];
					oExistsDisplayNumber[oField.displaySequence].push(oField.mappingPath);
				}
				if (oField.children && oField.children.length > 0) {
					that._validateIntegrationDisplaySequenceChildren(oField.children, oExistsDisplayNumber);
				}
			});
		}
	};
}());