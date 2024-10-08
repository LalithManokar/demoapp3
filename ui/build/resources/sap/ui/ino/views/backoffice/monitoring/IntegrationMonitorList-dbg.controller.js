/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.models.object.MonitorIntegration");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.model.json.JSONModel");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.monitoring.IntegrationMonitorList",
	jQuery.extend({}, sap.ui.ino.views.common.MasterDetailController, {
		getSettings: function() {
			var mSettings = {
				aRowSelectionEnabledButtons: ["BUT_DELETE"],
				mTableViews: {
					"default": {
						"default": true,
						sBindingPathTemplate: "/SearchMonitorFullParams(searchToken='{searchTerm}')/Results",
						oSorter: new sap.ui.model.Sorter("ID", true),
						aVisibleActionButtons: ["BUT_DELETE","BUT_REFRESH"],
						aVisibleColumns: ["ID", "STATUS", "MESSAGE", "OBJECT_ID", "PATH", "DIRECTION_PATH", "INTERFACE_NAME","OPERATOR_AT","OPERATOR_BY","OBJECT_PAYLOAD_JSON"]
					}
				},
				sApplicationObject: "sap.ui.ino.models.object.MonitorIntegration"
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
			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("integration_monitor_list");

			var iId = this.getSelectedId();
			if (!iId) {
				return;
			}

			var that = this;

			function deleteInstance(bResult) {
				if (bResult) {
					var oDeleteRequest = sap.ui.ino.models.object.MonitorIntegration.del(iId);
					that.executeActionRequest(oDeleteRequest, that._oDeleteButton, false);
					oDeleteRequest.done(function() {
						var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
						var oMessageParameters = {
							key: "MSG_INTEGRATION_MONITOR_DELETED",
							level: sap.ui.core.MessageType.Success,
							parameters: [],
							group: "integration_monitor_list",
							text: oMsg.getResourceBundle().getText("MSG_INTEGRATION_MONITOR_DELETED")
						};

						var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
						var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
						oApp.addNotificationMessage(oMessage);
					});
				}
			}

			var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
			sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_INTEGRATION_MONITOR_INS_DEL"),
				deleteInstance, oBundle.getText("BO_INTEGRATION_MONITOR_TIT_DEL"));
		}
	
		

	
	}));