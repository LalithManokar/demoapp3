sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ino/commons/models/object/PersonalizeSetting"
], function(
	JSONModel,
	MessageToast,
	PersonalizeSetting) {
	"use strict";

	/**
	 * @class
	 * Mixin for a feeds setting
	 */
	var FeedsSettingMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	FeedsSettingMixin.feedsSave = function() {
		var self = this;
		var oModel = self.getView().getModel('FEED');
		var oData = oModel.getData();
		PersonalizeSetting.updateFeedsSettings({
			feeds: jQuery.extend(true, {}, oData.setting)
		}).done(function() {
			MessageToast.show(self.getText("FEEDS_SETTING_SAVE_SUCCESS"));
			if(oModel.getProperty("/setting/CAMPAIGN_SETTING_VALUE") || oModel.getProperty("/setting/IDEA_SETTING_VALUE") || oModel.getProperty("/setting/TAG_SETTING_VALUE")){
			    self.updateUserSettingEmail(true);
			}
			self.getView().setModel(new JSONModel(oData), 'FEED');
		});
	};

	FeedsSettingMixin.convertFeeds2ClientObject = function(oOriginData) {
		if (!oOriginData.hasOwnProperty("CAMPAIGN_SETTING_VALUE")) {
			oOriginData.CAMPAIGN_SETTING_VALUE = 1;
		}
		if (!oOriginData.hasOwnProperty("IDEA_SETTING_VALUE")) {
			oOriginData.IDEA_SETTING_VALUE = 1;
		}
		if (!oOriginData.hasOwnProperty("TAG_SETTING_VALUE")) {
			oOriginData.TAG_SETTING_VALUE = 1;
		}
		return oOriginData;
	};

	FeedsSettingMixin.newFeedsSave = function() {
		var self = this;
		var oModel = self.getView().getModel('NEWFEED');
		var oData = oModel.getData();
		PersonalizeSetting.updateNewFeedsSettings({
			newfeeds: _convert2ServerfeedObject(jQuery.extend(true, {}, oData.setting))
		}).done(function() {
			MessageToast.show(self.getText("FEEDS_SETTING_SAVE_SUCCESS"));
			if((oModel.getProperty("/setting/CAMPAIGN_SETTING_VALUE") || oModel.getProperty("/setting/IDEA_SETTING_VALUE") || oModel.getProperty("/setting/TAG_SETTING_VALUE")) && oModel.getProperty("/setting/FEEDS_KEY") !== 1){
			    self.updateUserSettingEmail(true);
			}
			self.getView().setModel(new JSONModel(oData), 'NEWFEED');
		});
	};

	FeedsSettingMixin.convertNewFeeds2ClientObject = function(oOriginData) {

		if (!oOriginData) {
			return oOriginData;
		}
		if (oOriginData.FEEDS_KEY) {
			if (oOriginData.FEEDS_KEY === 1) {
				oOriginData.FEEDS_KEY = 0;
			} else if (oOriginData.FEEDS_KEY === -1) {
				oOriginData.FEEDS_KEY = 1;
			}
		} else {
			oOriginData.FEEDS_KEY = 0;
		}

		if (!oOriginData.hasOwnProperty("CAMPAIGN_SETTING_VALUE")) {
			oOriginData.CAMPAIGN_SETTING_VALUE = 1;
		}
		if (!oOriginData.hasOwnProperty("IDEA_SETTING_VALUE")) {
			oOriginData.IDEA_SETTING_VALUE = 1;
		}
		if (!oOriginData.hasOwnProperty("TAG_SETTING_VALUE")) {
			oOriginData.TAG_SETTING_VALUE = 1;
		}
		return oOriginData;
	};
	
	FeedsSettingMixin.formatEnableMappingSettingFeedsKeyValue = function(value) {
		return value !== 1;
	};
	
	FeedsSettingMixin.formatFeedEnableSettingValue = function(value) {
		return value === 1;
	};
	
	function _convert2ServerfeedObject(oOriginData) {
		if (!oOriginData) {
			return oOriginData;
		}
		if (oOriginData.FEEDS_KEY || oOriginData.FEEDS_KEY === 0) {
			if (oOriginData.FEEDS_KEY === 0) {
				oOriginData.FEEDS_KEY = 1;
			} else if (oOriginData.FEEDS_KEY === 1) {
				oOriginData.FEEDS_KEY = -1;
			}
		}
		
		if (oOriginData.CAMPAIGN_SETTING_VALUE) {
			oOriginData.CAMPAIGN_SETTING_VALUE = 1;
		}else{
		    oOriginData.CAMPAIGN_SETTING_VALUE = 0;
		}
		
		if (oOriginData.IDEA_SETTING_VALUE) {
			oOriginData.IDEA_SETTING_VALUE = 1;
		}else{
		    oOriginData.IDEA_SETTING_VALUE = 0;
		}
		
		if (oOriginData.TAG_SETTING_VALUE) {
			oOriginData.TAG_SETTING_VALUE = 1;
		}else{
		    oOriginData.TAG_SETTING_VALUE = 0;
		}
		
		return oOriginData;
	}

	return FeedsSettingMixin;
});
