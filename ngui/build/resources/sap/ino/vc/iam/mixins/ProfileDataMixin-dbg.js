sap.ui.define(["sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/object/UserSettings",
    "sap/ino/commons/models/object/Attachment",
   "sap/m/MessageToast",
   "sap/ino/commons/models/core/ModelSynchronizer",
    "sap/ino/commons/models/object/PersonalizeSetting"
], function(Configuration,
	UserSettings,
	Attachment,
	MessageToast,
	ModelSynchronizer,
	PersonalizeSetting) {
	"use strict";
	var ProfileDataMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	ProfileDataMixin.getProfileDataSetting = function() {
		var iUserId = Configuration.getCurrentUser().USER_ID;
		var oUserSettings = new UserSettings(iUserId, {
			continuousUse: true,
			actions: ["updateUserLocale"],
			readSource: {
				model: this.getDefaultODataModel()
			}
		});
		this.setObjectModel(oUserSettings);
		this.bindDefaultODataModel(iUserId);
		if (this._oUserDataModel) {
			ModelSynchronizer.addAOInstanceDependency(oUserSettings, this._oUserDataModel, function(oAOInstance, oDependentModel) {
				if (oAOInstance && oAOInstance.getProperty("/Settings") && oDependentModel) {
					oDependentModel.setProperty("/IMAGE_ID", oAOInstance.getProperty("/Settings").TITLE_IMAGE_ID);
				}
			});
		}
	};

	ProfileDataMixin.formattermailLanguageText = function(sDefaultText, sCode) {
// 		var sText = this.getText(sCode);
// 		if (sText === sCode || sText === "") {
// 			return sDefaultText;
// 		}
// 		return sText;
        return sDefaultText;
	};

	ProfileDataMixin.setUserDataModel = function(oUserDataModel) {
		this._oUserDataModel = oUserDataModel;
	};

	ProfileDataMixin.getODataEntitySet = function() {
		return "Identity";
	};

	ProfileDataMixin.onFileUploaderChange = function(oEvent) {
		var oFileUploader = oEvent.getSource();
		var aFile = oEvent.getParameter("files");
		oFileUploader.setBusy(true);
		Attachment.prepareFileUploader(oFileUploader, aFile);
	};

	ProfileDataMixin.onFileUploaderComplete = function(oEvent) {
		var oResponse = Attachment.parseUploadResponse(oEvent.getParameter("responseRaw"));
		var oFileUploader = oEvent.getSource();

		if (oResponse) {
			var oObject = this.getObjectModel();
			if (oResponse.success) {
				oObject.setUserImage({
					"ATTACHMENT_ID": oResponse.attachmentId,
					"FILE_NAME": oResponse.fileName,
					"MEDIA_TYPE": oResponse.mediaType
				});
			} else {
				MessageToast.show(this.getText("SETTINGS_MSG_USER_IMAGE_FAILED"));
			}
		} else {
			MessageToast.show(this.getText("SETTINGS_MSG_USER_IMAGE_ERROR"));
		}

		oFileUploader.setBusy(false);
		oFileUploader.clear();
	};

	ProfileDataMixin.onImageSettingClear = function(oEvent) {
		var oObject = this.getObjectModel();
		oObject.clearUserImage();
		var oFileUploader = this.byId("imageSettingUploader");
		oFileUploader.setValue(null);
	};
	
	ProfileDataMixin.onImageSettingCrop = function() {
		var oImageCropping = this.byId("imageSettingCropping");
		this._cropImage(oImageCropping);
	};
	
	ProfileDataMixin.formatConsentTermsCondiftions = function(value){
	    return Configuration.getSystemSetting("sap.ino.config.TERMS_AND_CONDITIONS_ACTIVE") === '1';
	};

	ProfileDataMixin._cropImage = function(oImageCroppingCtrl) {
		var that = this;
		var oDeferred = jQuery.Deferred();
		var oFile = oImageCroppingCtrl.crop();
		if (oFile) {
			jQuery.sap.require("sap.ino.commons.models.object.Attachment");
			var Attachment = sap.ino.commons.models.object.Attachment;
			var oObject = that.getObjectModel();
			var sAttachmentId = oObject.getProperty('/Settings/TITLE_IMAGE_ID');
			Attachment.uploadFile(oFile, null, sAttachmentId, true).done(function(oResponse) {
				oObject.setUserImage({
					"ATTACHMENT_ID": oResponse.attachmentId || sAttachmentId,
					"FILE_NAME": oResponse.fileName,
					"MEDIA_TYPE": oResponse.mediaType
				});
				oDeferred.resolve({
					messages: [{
						"TYPE": "I",
						"MESSAGE": "SETTINGS_MSG_USER_IMAGE_CROP",
						"MESSAGE_TEXT": that.getText("SETTINGS_MSG_USER_IMAGE_CROP"),
						"REF_FIELD": ""
                        }]
				});
			}).fail(function() {
				MessageToast.show(that.getText("SETTINGS_MSG_USER_IMAGE_CROP_FAILED"));
				oDeferred.reject();
			});
		} else {
			oDeferred.resolve();
		}
		return oDeferred.promise();
	};

	ProfileDataMixin.onSettingsOk = function() {
		var that = this;
		var oNotificationMail = that.byId("settingMAIL");
		var _saveSettings = function() {
			//sap.ui.ino.controls.BusyIndicator.show(0);
			var oObjectModel = that.getObjectModel();
			var oLocale = that.byId("settingLOCALE");
			var oHCB = that.byId("settingHCB");
			var sHCBvalue = oHCB.getSelected() ? UserSettings.Theme.HCB : "";

			that._sHCBPropOLD = oObjectModel._oBeforeData.Settings.THEME; //oObjectModel.getProperty("/Settings/THEME");
			that._sHCBPropOLD = (that._sHCBPropOLD === null) ? "" : that._sHCBPropOLD;
			that._sLocalePropOLD = oObjectModel._oBeforeData.Settings.LOCALE;
			that._sLocalePropOLD = (that._sLocalePropOLD === null) ? "" : that._sLocalePropOLD;
			that._sConsentTermsConditionPropOLD = oObjectModel._oBeforeData.Settings.CONSENT_TERMS_CONDITIONS;
			that._sConsentTermsConditionPropOLD = (that._sConsentTermsConditionPropOLD === null) ? "" : that._sConsentTermsConditionPropOLD;
            var newModel = [{
				SECTION: "locale",
				KEY: "locale",
				VALUE: oLocale.getSelectedKey()
            }, {
				SECTION: "notification",
				KEY: "mail",
				VALUE: oNotificationMail && oNotificationMail.getSelected() ? UserSettings.Mail.Inactive : UserSettings.Mail.Active
            }, {
				SECTION: "ui",
				KEY: "theme",
				VALUE: sHCBvalue
            }];
            if(Configuration.getSystemSetting("sap.ino.config.TERMS_AND_CONDITIONS_ACTIVE") === '1'){
			    var oConsentTermsCondition = that.byId("settingTermsConditions");
                newModel.push({
    				SECTION: "system",
    				KEY: "consent_terms_condition",
    				VALUE: oConsentTermsCondition && oConsentTermsCondition.getSelected() ? 0 : 1
                });
            }
			var oRequest = oObjectModel.updateUserSettings(newModel);

			oObjectModel.modify(); // update image
			oRequest.done(function() {
				Configuration.refreshBackendConfiguration();
				if(that.isEnableNewNotification){
					that.getNewNotificationSetting();
					that.getNewFeedsSetting();
				}else{
					that.getNotificationSetting();
					that.getFeedsSetting();
				}

				that.getOwnerComponent().getModel("user").setProperty("/data/IDENTITY_IMAGE_ID", oObjectModel.getProperty(
					"/IDENTITY_IMAGE_ID"));
				MessageToast.show(that.getText("FEEDS_SETTING_SAVE_SUCCESS"));
			});
			oRequest.always(function() {
				var sHCBPropNEW = oObjectModel.getProperty("/Settings/THEME");
				sHCBPropNEW = (sHCBPropNEW === null) ? "" : sHCBPropNEW;

				var sLocalePropNEW = oObjectModel.getProperty("/Settings/LOCALE");
				sLocalePropNEW = (sLocalePropNEW === null) ? "" : sLocalePropNEW;
                if(Configuration.getSystemSetting("sap.ino.config.TERMS_AND_CONDITIONS_ACTIVE") === '1'  
                    && oObjectModel.getProperty("/Settings/CONSENT_TERMS_CONDITIONS") !== that._sConsentTermsConditionPropOLD){
                    location.reload();
                    return;
                }
				var bRestart = (sLocalePropNEW !== that._sLocalePropOLD) || (sHCBPropNEW !== that._sHCBPropOLD);
				if (bRestart) {
					that._openRestartDialog();
				}
			});
		};
		var _saveNotification = function() {
			var oDeferred = jQuery.Deferred();
			var oNotificationData = {
				KEY: [{
					CODE: null,
					MAPPING_SETTING_CODE: "KEY",
					OBJECT_TYPE_CODE: "NOTIFICATION_KEY",
					SETTING_VALUE: -1,
					SUBCATEGORY_CODE: null
				}]
			};
			if (oNotificationMail && !oNotificationMail.getSelected()) {
				oNotificationData = {
					KEY: [{
						CODE: null,
						MAPPING_SETTING_CODE: "KEY",
						OBJECT_TYPE_CODE: "NOTIFICATION_KEY",
						SETTING_VALUE: 0,
						SUBCATEGORY_CODE: null
						}]
				};
			}
			PersonalizeSetting.updateNotificationSettings({
				notification: oNotificationData
			}).done(function() {
				oDeferred.resolve();
			}).fail(function() {
				oDeferred.reject();
			});
			return oDeferred.promise();
		};
		var _saveNewNotification = function() {
			var oDeferred = jQuery.Deferred();
			var oNewNotificationData = {
				NEWKEY: [{
					ACTION_CODE: "NEWKEY",
					ACTION_TYPE_CODE: "NEWKEY",
					SETTING_VALUE: -1
				}]
			};
			if (oNotificationMail && !oNotificationMail.getSelected()) {
				oNewNotificationData = {
					NEWKEY: [{
						ACTION_CODE: "NEWKEY",
						ACTION_TYPE_CODE: "NEWKEY",
						SETTING_VALUE: 0
					}]
				};
			}
			PersonalizeSetting.updateNewNotificationSettings({
				notification: oNewNotificationData
			}).done(function() {
				oDeferred.resolve();
			}).fail(function() {
				oDeferred.reject();
			});
			return oDeferred.promise();
		};
		var _saveFeedSetting = function() {
			var oDeferred = jQuery.Deferred();
			var oFeedData = {
				"feeds": {
					"CAMPAIGN_SETTING_VALUE": false,
					"IDEA_SETTING_VALUE": false,
					"TAG_SETTING_VALUE": false
				}
			};
			if (oNotificationMail && !oNotificationMail.getSelected()) {
				oFeedData = {
					"feeds": {
						"CAMPAIGN_SETTING_VALUE": true,
						"IDEA_SETTING_VALUE": true,
						"TAG_SETTING_VALUE": true
					}
				};
			}
			PersonalizeSetting.updateFeedsSettings(oFeedData).done(function() {
				oDeferred.resolve();
			}).fail(function() {
				oDeferred.reject();
			});
			return oDeferred.promise();
		};
		var _saveNewFeedSetting = function() {
			var oDeferred = jQuery.Deferred();
			var oNewFeedData = {
				"newfeeds": {
					"FEEDS_KEY": -1,
					"CAMPAIGN_SETTING_VALUE": 0,
					"IDEA_SETTING_VALUE": 0,
					"TAG_SETTING_VALUE": 0
				}
			};
			if (oNotificationMail && !oNotificationMail.getSelected()) {
				oNewFeedData = {
					"newfeeds": {
						"FEEDS_KEY": 1,
						"CAMPAIGN_SETTING_VALUE": 1,
						"IDEA_SETTING_VALUE": 1,
						"TAG_SETTING_VALUE": 1
					}
				};
			}
			PersonalizeSetting.updateNewFeedsSettings(oNewFeedData).done(function() {
				oDeferred.resolve();
			}).fail(function() {
				oDeferred.reject();
			});
			return oDeferred.promise();
		};
		var oImageCropping = this.byId("imageSettingCropping");
		if(that.isEnableNewNotification){
			jQuery.when(this._cropImage(oImageCropping), _saveNewNotification(), _saveNewFeedSetting()).done(_saveSettings);
		}else{
			jQuery.when(this._cropImage(oImageCropping), _saveNotification(), _saveFeedSetting()).done(_saveSettings);
		}
	};

	return ProfileDataMixin;

});
