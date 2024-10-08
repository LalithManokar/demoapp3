sap.ui.define([
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/UserSettings",
    "sap/ino/commons/models/object/PersonalizeSetting"
], function(
    Configuration,
	JSONModel,
	UserSettings,
	PersonalizeSetting) {
	"use strict";

	/**
	 * @class
	 * Mixin for a notification setting
	 */
	var UserCommonMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	UserCommonMixin.updateUserSettingEmail = function(bEmailActive) {
		var oObjectModel = this.getObjectModel();
		oObjectModel.updateUserSettings([{
			SECTION: "notification",
			KEY: "mail",
			VALUE: !bEmailActive ? UserSettings.Mail.Inactive : UserSettings.Mail.Active
        }]).done(function(){
			Configuration.refreshBackendConfiguration();
        });
	};

	UserCommonMixin.getNotificationSetting = function() {
		var self = this;
		PersonalizeSetting.getNotificationSettings().done(function(data) {
			var settingData = {
				setting: self.convertNotification2ClientObject(jQuery.extend(true, {}, data.RESULT))
			};
			self.getView().setModel(new JSONModel(settingData), 'NOTIFICATION');
		});
	};
	
	UserCommonMixin.getNewNotificationSetting = function() {
		var self = this;
		PersonalizeSetting.getNewNotificationSettings().done(function(data) {
			var settingData = {
				setting: self.convertNewNotification2ClientObject(jQuery.extend(true, {}, data.RESULT))
			};
			self.getView().setModel(new JSONModel(settingData), 'NEWNOTIFICATION');
		});
	};

	UserCommonMixin.getFeedsSetting = function() {
		var self = this;
		PersonalizeSetting.getFeedsSettings().done(function(data) {
			var settingData = {
				setting: self.convertFeeds2ClientObject(jQuery.extend(true, {}, data.RESULT))
			};
			self.getView().setModel(new JSONModel(settingData), 'FEED');
		});
	};
	
	UserCommonMixin.getNewFeedsSetting = function() {
		var self = this;
		PersonalizeSetting.getNewFeedsSettings().done(function(data) {
			var settingData = {
				setting: self.convertNewFeeds2ClientObject(jQuery.extend(true, {}, data.RESULT))
			};
			self.getView().setModel(new JSONModel(settingData), 'NEWFEED');
		});
	};

	return UserCommonMixin;
});