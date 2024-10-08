sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ino/commons/models/object/PersonalizeSetting",
	'sap/m/GroupHeaderListItem'
], function(
	JSONModel,
	MessageToast,
	PersonalizeSetting,
	GroupHeaderListItem,
	UserCommonMixin) {
	"use strict";

	/**
	 * @class
	 * Mixin for a notification setting
	 */
	var NotificationSettingMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	NotificationSettingMixin.notificationSave = function() {
		var self = this;
		var oModel = self.getView().getModel('NOTIFICATION');
		var oData = oModel.getData();
		PersonalizeSetting.updateNotificationSettings({
			notification: _convert2ServerObject(jQuery.extend(true, {}, oData.setting))
		}).done(function() {
			MessageToast.show(self.getText("NOTIFICATION_SETTING_SAVE_SUCCESS"));
			if(oModel.getProperty("/setting/KEY/0/SETTING_VALUE") !== 3){
			    self.updateUserSettingEmail(true);
			}
			self.getView().setModel(new JSONModel(oData), 'NOTIFICATION');
		});
	};
	
	NotificationSettingMixin.NewNotificationSave = function() {
		var self = this;
		var oModel = self.getView().getModel('NEWNOTIFICATION');
		var oData = oModel.getData();
		PersonalizeSetting.updateNewNotificationSettings({
			notification: _convertNew2ServerObject(jQuery.extend(true, {}, oData.setting))
		}).done(function() {
			MessageToast.show(self.getText("NOTIFICATION_SETTING_SAVE_SUCCESS"));
			if(oModel.getProperty("/setting/NEWKEY/0/SETTING_VALUE") !== 3){
			    self.updateUserSettingEmail(true);
			}
			self.getView().setModel(new JSONModel(oData), 'NEWNOTIFICATION');
		});
	};

	NotificationSettingMixin.formatEnableMappingSettingValue = function(value) {
		return value !== 3;
	};
	
	NotificationSettingMixin.formatEnableSettingValue = function(value) {
		return value === 1;
	};

	NotificationSettingMixin.formatMappingSettingCode = function(sMappingCode) {
		return this.getText("NOTIFICATION_SETTING_" + sMappingCode);
	};
	
	NotificationSettingMixin.formatNewMappingSettingCode = function(sMappingCode) {
		return this.getText("NEWNOTIFICATION_SETTING_" + sMappingCode);
	};

	NotificationSettingMixin.getGroupHeader = function(oGroup) {
		var that = this;
		return new GroupHeaderListItem({
			title: that.getText("NOTIFICATION_SETTING_SUBCATEGORYCODE_" + oGroup.key),
			upperCase: false
		});
	};
	
	NotificationSettingMixin.getNewGroupHeader = function(oGroup) {
		var that = this;
		return new GroupHeaderListItem({
			title: that.getText("NEWNOTIFICATION_SETTING_ACTIONTYPECODE_" + oGroup.key),
			upperCase: false
		});
	};

	NotificationSettingMixin.convertNotification2ClientObject = function(oOriginData) {
		if (!oOriginData) {
			return oOriginData;
		}
		if (oOriginData.KEY && oOriginData.KEY[0]) {
			if (oOriginData.KEY[0].SETTING_VALUE === -1) {
				oOriginData.KEY[0].SETTING_VALUE = 3;
			} else if (oOriginData.KEY[0].SETTING_VALUE === 7) {
				oOriginData.KEY[0].SETTING_VALUE = 2;
			}
		} else {
			oOriginData.KEY = [{}];
			oOriginData.KEY[0].SETTING_VALUE = 0;
		}
		if (oOriginData.IDEA) {
			for (var ideaIndex = 0; ideaIndex < oOriginData.IDEA.length; ideaIndex++) {
				oOriginData.IDEA[ideaIndex].order = parseInt(oOriginData.IDEA[ideaIndex].CODE.substr(15), 10);
			}
			oOriginData.IDEA = oOriginData.IDEA.sort(function(previous, next) {
				return previous.order - next.order;
			});
		}
		if (oOriginData.CAMPAIGN) {
			for (var campaignIndex = 0; campaignIndex < oOriginData.CAMPAIGN.length; campaignIndex++) {
				oOriginData.CAMPAIGN[campaignIndex].order = parseInt(oOriginData.CAMPAIGN[campaignIndex].CODE.substr(15), 10);
			}
			oOriginData.CAMPAIGN = oOriginData.CAMPAIGN.sort(function(previous, next) {
				return previous.order - next.order;
			});
		}
		return oOriginData;
	};
	
	NotificationSettingMixin.convertNewNotification2ClientObject = function(oOriginData) {
		if (!oOriginData) {
			return oOriginData;
		}
		if (oOriginData.NEWKEY && oOriginData.NEWKEY[0]) {
			if (oOriginData.NEWKEY[0].SETTING_VALUE === -1) {
				oOriginData.NEWKEY[0].SETTING_VALUE = 3;
			} else if (oOriginData.NEWKEY[0].SETTING_VALUE === 7) {
				oOriginData.NEWKEY[0].SETTING_VALUE = 2;
			}
		} else {
			oOriginData.NEWKEY = [{}];
			oOriginData.NEWKEY[0].SETTING_VALUE = 0;
		}
		return oOriginData;
	};

	function _convert2ServerObject(oOriginData) {
		if (!oOriginData) {
			return oOriginData;
		}
		if (oOriginData.KEY && oOriginData.KEY[0]) {
			if (oOriginData.KEY[0].SETTING_VALUE === 3) {
				oOriginData.KEY[0].SETTING_VALUE = -1;
			} else if (oOriginData.KEY[0].SETTING_VALUE === 2) {
				oOriginData.KEY[0].SETTING_VALUE = 7;
			}
		}
		if (oOriginData.CAMPAIGN) {
			for (var i = 0; i <= oOriginData.CAMPAIGN.length - 1; i++) {
				if (oOriginData.CAMPAIGN[i].SETTING_VALUE) {
					oOriginData.CAMPAIGN[i].SETTING_VALUE = 1;
				}
			}
		}
		if (oOriginData.IDEA) {
			for (var j = 0; j <= oOriginData.IDEA.length - 1; j++) {
				if (oOriginData.IDEA[j].SETTING_VALUE) {
					oOriginData.IDEA[j].SETTING_VALUE = 1;
				}
			}
		}
		return oOriginData;
	}
	
	function _convertNew2ServerObject(oOriginData) {
		if (!oOriginData) {
			return oOriginData;
		}
		if (oOriginData.NEWKEY && oOriginData.NEWKEY[0]) {
			if (oOriginData.NEWKEY[0].SETTING_VALUE === 3) {
				oOriginData.NEWKEY[0].SETTING_VALUE = -1;
			} else if (oOriginData.NEWKEY[0].SETTING_VALUE === 2) {
				oOriginData.NEWKEY[0].SETTING_VALUE = 7;
			}
		}
		if (oOriginData.CAMPAIGN) {
			for (var i = 0; i <= oOriginData.CAMPAIGN.length - 1; i++) {
				if (oOriginData.CAMPAIGN[i].SETTING_VALUE) {
					oOriginData.CAMPAIGN[i].SETTING_VALUE = 1;
				}
			}
		}
		if (oOriginData.IDEA) {
			for (var j = 0; j <= oOriginData.IDEA.length - 1; j++) {
				if (oOriginData.IDEA[j].SETTING_VALUE) {
					oOriginData.IDEA[j].SETTING_VALUE = 1;
				}
			}
		}
		if (oOriginData.FOLLOW) {
			for (var n = 0; n <=  oOriginData.FOLLOW.length - 1; n++) {
				if (oOriginData.FOLLOW[n].SETTING_VALUE) {
					oOriginData.FOLLOW[n].SETTING_VALUE = 1;
				}
			}
		}
		if (oOriginData.STATUS) {
			for (var m = 0; m <= oOriginData.STATUS.length - 1; m++) {
				if (oOriginData.STATUS[m].SETTING_VALUE) {
					oOriginData.STATUS[m].SETTING_VALUE = 1;
				}
			}
		}
		
		
		return oOriginData;
	}

	return NotificationSettingMixin;
});