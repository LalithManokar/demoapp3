/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.object.IdentityLogSetting");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.iam.UserLogSetting", {
	onValueChanged: function(oEvent) {
		var oLocalUserLogSetting = oEvent.getSource().getBindingContext().getObject();
		var oNewValue;
		if (oEvent.getParameter) {
			if (oEvent.getParameter("checked") !== undefined) {
				oNewValue = oEvent.getParameter("checked") ? 1 : 0;
			}
			if (oNewValue !== undefined) {
				this.updateValue(oLocalUserLogSetting, oNewValue);
			}
		}
	},

	hasPendingChanges: function() {
		return this.aChangedLocalUserLogSetting;
	},

	updateValue: function(oLocalUserLogSetting, sNewValue) {
		if (this.aChangedLocalUserLogSetting === undefined) {
			this.aChangedLocalUserLogSetting = {};
		}
		this.aChangedLocalUserLogSetting[oLocalUserLogSetting.CODE] = oLocalUserLogSetting;
		if (this.aChangedLocalUserLogSettingNewValue === undefined) {
			this.aChangedLocalUserLogSettingNewValue = {};
		}
		this.aChangedLocalUserLogSettingNewValue[oLocalUserLogSetting.CODE] = sNewValue;

		this.getView().oSaveButton.setEnabled(true);
		this.getView().oUserLogSetting[oLocalUserLogSetting.CODE] = sNewValue;
	},

	onSavePressed: function() {
		var that = this;
		if (this.aChangedLocalUserLogSetting) {
			var aPromises = [];
			jQuery.each(this.aChangedLocalUserLogSetting, function(iIndex, oLocalUserLogSetting) {
				var iId = oLocalUserLogSetting.ID || undefined;
				var oChangedLocalUserLogSetting = {
					ID: iId,
					CODE: oLocalUserLogSetting.CODE,
					IS_LOG: that.aChangedLocalUserLogSettingNewValue[oLocalUserLogSetting.CODE]
				};
				var oModify = sap.ui.ino.models.object.IdentityLogSetting.modify(iId, oChangedLocalUserLogSetting);
				aPromises.push(oModify);
				oModify.fail(function(oResponse) {
					var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, that.getView(),
						"local_userlogsetting");
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
				that.aChangedLocalUserLogSetting = undefined;
				that.aChangedLocalUserLogSettingNewValue = undefined;
				var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
				var oMessageParameters = {
					key: "MSG_LOCAL_USERLOGSETTING_SAVED",
					level: sap.ui.core.MessageType.Success,
					parameters: [],
					group: "local_userlogsetting",
					text: oMsg.getResourceBundle().getText("MSG_LOCAL_USERLOGSETTING_SAVED")
				};

				var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
				var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
				oApp.removeNotificationMessages("local_userlogsetting");
				oApp.addNotificationMessage(oMessage);
			});
		}
	},

	getCodeModelPrefix: function() {
		return "code>";
	}
});