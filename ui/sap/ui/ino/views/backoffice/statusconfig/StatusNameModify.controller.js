/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");

jQuery.sap.require("sap.ui.ino.models.object.StatusNameStage");

sap.ui.controller("sap.ui.ino.views.backoffice.statusconfig.StatusNameModify", jQuery.extend({},
	sap.ui.ino.views.common.ThingInspectorAOController, {

		mMessageParameters: {
			group: "configuration_status_name",
			save: {
				success: "MSG_STATUS_NAME_SAVED"
			},
			del: {
				success: "MSG_STATUS_NAME_DELETED", // text key for delete success message
				title: "BO_STATUS_NAME_TIT_DEL", // text key for dialog title
				dialog: "BO_STATUS_NAME_INS_DEL" // text key for dialog message
			}
		},

		createModel: function(iId) {
			if (!this.oModel) {
				this.oModel = new sap.ui.ino.models.object.StatusNameStage(iId > 0 ? iId : undefined, {
					actions: ["modify", "create", "del", "update"],
					nodes: ["Root"],
					continuousUse: true,
					concurrencyEnabled: true
				});
			}

			if (iId && iId > 0) {
				this.getView().bindElement("/StagingStatusNameCode(" + iId + ")");
			}
			if (iId < 0) {
				this.oModel.setProperty("/STATUS_TYPE", "IN_PROCESS");
			}
			return this.oModel;
		},

		onInit: function() {
			sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
			this.triggerRefreshOnClose = false;
		}
	}));