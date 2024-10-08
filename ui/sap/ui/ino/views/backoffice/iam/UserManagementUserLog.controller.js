/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.models.formatter.DateFormatter");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.models.object.IdentityLog");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.views.common.TableExport");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");

sap.ui.controller("sap.ui.ino.views.backoffice.iam.UserManagementUserLog", jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {
	bindUserLogTable: function() {
		var that = this;
		this.getView().oUserLogTable.bindRows({
			path: "/Identity(" + that.getModel().getProperty("/ID") + ")/IdentityLog",
			sorter: new sap.ui.model.Sorter("CHANGED_AT", true)
		});
	},

	onExport: function(oEvent) {
		var oMenuItem = oEvent.getParameter("item");
		var sFormat = oMenuItem.getCustomData()[0].getValue();
		var sAuthor = sap.ui.ino.application.ApplicationBase.getApplication().getCurrentUserName();
		sap.ui.ino.views.common.TableExport.exportAdvanced(this.getView().oUserLogTable, sFormat, void 0, this.getView()._oExportButton,
			sAuthor);
	},

	onSelectionChanged: function(oEvent) {
		var that = this;
		if (that.getModel().getProperty("/IS_VALID")) {
			that.getView().oDeleteButton.setEnabled(false);
		} else {
			that.getView().oDeleteButton.setEnabled(true);
		}
	},

	onDelete: function(oEvent) {
		var oController = this;
		var oView = oController.getView();
		var oSelectedRowContext = oView.getSelectedRowContext();
		var userLogID = oSelectedRowContext && oSelectedRowContext.getProperty('ID');
		var userLogDelection = sap.ui.ino.models.object.IdentityLog.del(userLogID);
		var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
		var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
		userLogDelection.done(function() {
			var oMessageParameters = {
				key: "MSG_USER_LOG_DELETED_SUCCESS",
				level: sap.ui.core.MessageType.Success,
				parameters: [],
				group: "configuration_user_managment",
				text: oMsg.getText("MSG_USER_LOG_DELETED_SUCCESS")
			};
			var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
			oApp.addNotificationMessage(oMessage);
			oController.bindUserLogTable();
			oController.getView().oDeleteButton.setEnabled(false);
		}).fail(function() {
			var oMessageParameters = {
				key: "MSG_USER_LOG_DELETED_FAIL",
				level: sap.ui.core.MessageType.Error,
				parameters: [],
				group: "configuration_user_managment",
				text: oMsg.getText("MSG_USER_LOG_DELETED_FAIL")
			};
			var oMessage = new sap.ui.ino.application.Message(oMessageParameters);

			oApp.addNotificationMessage(oMessage);
		});
	},
	fomatterValue: function(dDval, sSval, sIval) {
		if (dDval) {
			return sap.ui.ino.models.formatter.DateFormatter.formatInfinityWithTime(dDval);
		} else if (sSval) {
			return sSval;
		} else {
			return sIval;
		}
	}
}));