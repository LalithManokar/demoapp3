/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.User");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");

sap.ui.controller("sap.ui.ino.views.backoffice.iam.UserManagementInstance", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOController, {

	createModel: function(iId) {
		if (!this.oModel) {
			this.oModel = new sap.ui.ino.models.object.User(iId > 0 ? iId : undefined, {
				actions: ["create", "update", "modify", "del"],
				nodes: ["Root"],
				continuousUse: true,
				readSource: {
					includeNodes: [{
							name: "UserDiscloseDataViewLog",
							parentNode: "Root",
							primaryKey: "ID"
					},
						{
							name: "UserDiscloseData",
							parentNode: "Root",
							primaryKey: "ID"
					}]
				}
			});
		}
		return this.oModel;
	},

	mMessageParameters: {
		group: "user",
		save: {
			success: "MSG_USER_SAVED_SUCCESS"
		},
		resetPwd: {
			success: "MSG_USER_RESETPWD_SUCCESS"
		},
		del: {
				success: "MSG_USER_DELETED_SUCCESS", // text key for delete success message
				title: "BO_USERMANAGEMENT_ADMINISTRATION_TIT_DELETE", // text key for dialog title
				dialog: "BO_USERMANAGEMENT_ADMINISTRATION_INS_DEL" // text key for dialog message
			}  
	},
	getODataPath: function() {
		// can be redefined if OData Model is needed;
		return "/Identity";
	},
	onSave: function() {
		var that = this;
		if (this.getModel() && this.getModel().isNew() && this.getModel().getData().EMAIL !== "") {
			this.mMessageParameters.save.success = "MSG_IDENTITY_USER_CREATE_MAIL_SEND_SUCCESS";
		} else {
			this.mMessageParameters.save.success = "MSG_USER_SAVED";
		}
		var oPromise = this.onModelAction(this.getModel().saveAndRoleAssignment, "save", true, false);
		oPromise.done(function(oResponseData) {
			if (oResponseData && oResponseData.MESSAGES && oResponseData.MESSAGES.length > 0 && oResponseData.MESSAGES[0].REF_ID === "USER_PWD") {
				sap.ui.ino.controls.MessageBox.alert(that.getTextModel().getText("IDENTITY_USER_CREATED_PWD_WARNING",
						oResponseData.MESSAGES[0].PARAMETERS[0]),
					null,
					that.getTextModel().getText("BO_LOCAL_SYSTEM_SETTING_TIT_INFO")
				);
			}
		});
	},

	resetPassword: function() {
		var that = this;
		sap.ui.commons.MessageBox.confirm(
			that.getTextModel().getText("IDENTITY_USER_RESETPWD_WARNING"),
			function(bConfirmed) {
				if (bConfirmed) {
					var oPromise = that.onModelAction(that.getModel().resetPwd, "resetPwd", true, true);
					oPromise.done(function(oResponseData) {
						if (oResponseData && oResponseData.MESSAGES && oResponseData.MESSAGES.length > 0 && oResponseData.MESSAGES[0].REF_ID ===
							"USER_PWD") {
							sap.ui.ino.controls.MessageBox.alert(that.getTextModel().getText("IDENTITY_USER_RESET_PWD_WARNING_INFO"
							    , oResponseData.MESSAGES[0].PARAMETERS[0]),
								null,
								that.getTextModel().getText("BO_LOCAL_SYSTEM_SETTING_TIT_WARNING")
							);
						}
					});
				}
			},
			that.getTextModel().getText("BO_LOCAL_SYSTEM_SETTING_TIT_WARNING")
		);
	}
}));