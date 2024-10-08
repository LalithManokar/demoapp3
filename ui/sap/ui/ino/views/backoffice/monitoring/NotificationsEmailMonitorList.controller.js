/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.models.object.MonitorNotification");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.model.json.JSONModel");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.monitoring.NotificationsEmailMonitorList",
	jQuery.extend({}, sap.ui.ino.views.common.MasterDetailController, {
		getSettings: function() {
			var mSettings = {
				aRowSelectionEnabledButtons: ["BUT_RESEND", "BUT_DELETE"],
				mTableViews: {
					"default": {
						"default": true,
						sBindingPathTemplate: "/SearchMonitorEmailParams(searchToken='{searchTerm}')/Results",
						oSorter: new sap.ui.model.Sorter("ID", true),
						filter: new sap.ui.model.Filter("MAIL_STATUS_CODE", "NE", "UNSENT"),
						aVisibleActionButtons: ["BUT_RESEND", "BUT_DELETE", "BUT_REFRESH"],
						aVisibleColumns: ["EMAIL_ACTION_CODE", "EMAIL_STATUS", "EMAIL_STATUS_REASON", "EMAIL_SEND_AT", "MAIL_RECIPIENT", "OBJECT_TYPE",
							"OBJECT_ID", "CAMPAIGN_ID", "CAMPAIGN_NAME","ROLE_CODE"]
					}
				},
				sApplicationObject: "sap.ui.ino.models.object.MonitorNotification"
			};

			return mSettings;
		},

		hasPendingChanges: function() {
			if (this.oActiveDialog) {
				return this.oActiveDialog.getContent()[0].hasPendingChanges();
			}
			return false;
		},

		handleRefresh: function() {
			this._bindTableRows();
		},

		handleDelete: function() {
			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("notification_monitor_list");

			var iId = this.getSelectedId();
			if (!iId) {
				return;
			}

			var that = this;

			function deleteInstance(bResult) {
				if (bResult) {
					var oDeleteRequest = sap.ui.ino.models.object.MonitorNotification.del(iId);
					that.executeActionRequest(oDeleteRequest, that._oDeleteButton, false);
					oDeleteRequest.done(function() {
						var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
						var oMessageParameters = {
							key: "MSG_NOTIFICATION_MONITOR_DELETED",
							level: sap.ui.core.MessageType.Success,
							parameters: [],
							group: "notification_monitor_list",
							text: oMsg.getResourceBundle().getText("MSG_NOTIFICATION_MONITOR_DELETED")
						};

						var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
						var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
						oApp.addNotificationMessage(oMessage);
					});
				}
			}

			var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
			sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_NOTIFICATION_MONITOR_INS_DEL"),
				deleteInstance, oBundle.getText("BO_NOTIFICATION_MONITOR_TIT_DEL"));
		},

		handleResend: function() {
			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("notification_monitor_list");

			var iId = this.getSelectedId();
			if (!iId) {
				return;
			}

			var that = this;

			function updateInstance(bResult) {
				if (bResult) {
					var oUpdateRequest = sap.ui.ino.models.object.MonitorNotification.updateNotificationStatus({
						"ID": iId
					});
					that.executeActionRequest(oUpdateRequest, that._oResendButton, false);
					oUpdateRequest.done(function() {
						var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
						var oMessageParameters = {
							key: "MSG_NOTIFICATION_MONITOR_UPDATED",
							level: sap.ui.core.MessageType.Success,
							parameters: [],
							group: "notification_monitor_list",
							text: oMsg.getResourceBundle().getText("MSG_NOTIFICATION_MONITOR_UPDATED")
						};

						var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
						var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
						oApp.addNotificationMessage(oMessage);
						that.refreshTableView();
					});
				}
			}

			var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
			sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_NOTIFICATION_MONITOR_INS_UPD"),
				updateInstance, oBundle.getText("BO_NOTIFICATION_MONITOR_TIT_UPD"));
		}
	}));