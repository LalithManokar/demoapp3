/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.object.IdentityAttributeSetting");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.iam.UserProfile", {
	onValueChanged: function(oEvent) {
		var oLocalUserProfile = oEvent.getSource().getBindingContext().getObject();
		var oNewValue;
		if (oEvent.getParameter) {
			if (oEvent.getParameter("checked") !== undefined) {
				oNewValue = oEvent.getParameter("checked") ? 1 : 0;
			}
			if (oNewValue !== undefined) {
				this.updateValue(oLocalUserProfile, oNewValue);
			}
		}
	},

	hasPendingChanges: function() {
		return this.aChangedLocalUserProfile;
	},

	updateValue: function(oLocalUserProfile, sNewValue) {
		if (this.aChangedLocalUserProfile === undefined) {
			this.aChangedLocalUserProfile = {};
		}
		this.aChangedLocalUserProfile[oLocalUserProfile.CODE] = oLocalUserProfile;
		if (this.aChangedLocalUserProfileNewValue === undefined) {
			this.aChangedLocalUserProfileNewValue = {};
		}
		this.aChangedLocalUserProfileNewValue[oLocalUserProfile.CODE] = sNewValue;

		this.getView().oSaveButton.setEnabled(true);
		this.getView().oUserProfile[oLocalUserProfile.CODE] = sNewValue;
	},

	onSavePressed: function() {
		var that = this;
		if (this.aChangedLocalUserProfile) {
			var aPromises = [];
			jQuery.each(this.aChangedLocalUserProfile, function(iIndex, oLocalUserProfile) {
				var iId = oLocalUserProfile.ID || undefined;
				var oChangedLocalUserProfile = {
					ID: iId,
					CODE: oLocalUserProfile.CODE,
					IS_PUBLIC: that.aChangedLocalUserProfileNewValue[oLocalUserProfile.CODE]
				};
				var oModify = sap.ui.ino.models.object.IdentityAttributeSetting.modify(iId, oChangedLocalUserProfile);
				aPromises.push(oModify);
				oModify.fail(function(oResponse) {
					var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, that.getView(),
						"local_user_profile");
					if (aActionMessages && aActionMessages.length > 0) {
						sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages(aActionMessages);
					}
				});
			});

			jQuery.when.apply(undefined, aPromises).done(function() {
				//synchronize reward active status
				var oView = that.getView();
				oView.oSaveButton.setEnabled(false);
				oView.bindRows();
				that.aChangedLocalUserProfile = undefined;
				that.aChangedLocalUserProfileNewValue = undefined;
				var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
				var oMessageParameters = {
					key: "MSG_LOCAL_USER_PROFILE_SAVED",
					level: sap.ui.core.MessageType.Success,
					parameters: [],
					group: "local_user_profile",
					text: oMsg.getResourceBundle().getText("MSG_LOCAL_USER_PROFILE_SAVED")
				};

				var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
				var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
				oApp.removeNotificationMessages("local_user_profile");
				oApp.addNotificationMessage(oMessage);
			});
		}
	},

	getCodeModelPrefix: function() {
		return "code>";
	}
});