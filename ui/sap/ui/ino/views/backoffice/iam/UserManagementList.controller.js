/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.object.User");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.iam.UserManagementList", jQuery.extend({},
	sap.ui.ino.views.common.MasterDetailController, {

		createWriteModel: function() {
			return null; 
		},

		getSettings: function() {
			var mSettings = {
				sBindingPathTemplate: "/SearchIdentity(searchToken='{searchTerm}')/Results",
				aRowSelectionEnabledButtons: ["BUT_EDIT", "BUT_DELETE"],
				mTableViews: {
					"default": {
						"default": true,
						oSorter: new sap.ui.model.Sorter("tolower(LAST_NAME)"),
						aFilters: [new sap.ui.model.Filter("TYPE_CODE", "EQ", 'USER')],
						aVisibleColumns: ["CLIPBOARD", "NAME", "FIRST_NAME", "LAST_NAME", "USER_NAME", "SOURCE_TYPE_CODE", "EMAIL", "IS_EXTERNAL",
							"VALID_TO","LAST_LOGIN"],
						aVisibleActionButtons: ["BUT_NEW_USER", "BUT_EDIT", "BUT_DELETE"],
						sType: "users"
					}
				},
				sApplicationObject: "sap.ui.ino.models.object.User"
			};

			return mSettings;
		},

		onSelectionChanged: function() {
			sap.ui.ino.views.common.MasterDetailController.onSelectionChanged.apply(this, arguments);

			var oView = this.getView();
			var oSelectedRowContext = oView.getSelectedRowContext();
			if (oSelectedRowContext) {
				var iId = oSelectedRowContext.getObject().ID;
				var oPropertyModel = new sap.ui.ino.models.core.PropertyModel(
					"sap.ino.xs.object.iam.User", iId, {
						actions: ["create", "update", "del"]
					}, true);

				var bUpdate = oPropertyModel.getProperty("/actions/update/enabled");
				var bDelete = oPropertyModel.getProperty("/actions/del/enabled") && Configuration.hasCurrentUserPrivilege(
					"sap.ino.xs.rest.admin.application::execute");
				var aMessages, oMsg;
				oView.oEditButton.setTooltip(undefined);

				if (oView.oEditButton.getEnabled() !== bUpdate) {
					oView.oEditButton.setEnabled(bUpdate);
				}
				if (oView.oDeleteButton.getEnabled() !== bDelete) {
					oView.oDeleteButton.setEnabled(bDelete);
				}

				if (!bUpdate) {
					aMessages = oPropertyModel.getProperty("/actions/update/messages");
					if (aMessages && aMessages.length > 0) {
						oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
						oView.oEditButton.setTooltip(oMsg.getText(aMessages[0].MESSAGE));
					}
				}
				if (!bDelete) {
					aMessages = oPropertyModel.getProperty("/actions/del/messages");
					if (aMessages && aMessages.length > 0) {
						oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
						oView.oEditButton.setTooltip(oMsg.getText(aMessages[0].MESSAGE));
					}
				}

			} else {
				oView.oEditButton.setEnabled(false);
				oView.oEditButton.setTooltip(undefined);
			}
		},

		onDelete: function() {
		    var oView = this.getView();
			function deleteInstance(bResult) {

				if (bResult) {

					var oSelectedRowContext = oView.getSelectedRowContext();
					var userID = oSelectedRowContext && oSelectedRowContext.getProperty('ID');
					var userDelection = sap.ui.ino.models.object.User.del(userID);
					var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
					var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
					userDelection.done(function() {
						var oMessageParameters = {
							key: "MSG_USER_DELETED_SUCCESS",
							level: sap.ui.core.MessageType.Success,
							parameters: [],
							group: "configuration_user_managment",
							text: oMsg.getText("MSG_USER_DELETED_SUCCESS")
						};

						var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
						oApp.addNotificationMessage(oMessage);
					}).fail(function() {
						var oMessageParameters = {
							key: "MSG_USER_DELETED_FAIL",
							level: sap.ui.core.MessageType.Error,
							parameters: [],
							group: "configuration_user_managment",
							text: oMsg.getText("MSG_USER_DELETED_FAIL")
						};
						var oMessage = new sap.ui.ino.application.Message(oMessageParameters);

						oApp.addNotificationMessage(oMessage);
					});
				}
			}
			var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
			sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_USERMANAGEMENT_ADMINISTRATION_INS_DEL"),
				deleteInstance, oBundle.getText("BO_USERMANAGEMENT_ADMINISTRATION_TIT_DELETE"));
		}
	}));