/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");

jQuery.sap.require("sap.ui.ino.models.object.StatusActionStage");

sap.ui.controller("sap.ui.ino.views.backoffice.statusconfig.StatusActionModify", jQuery.extend({},
	sap.ui.ino.views.common.ThingInspectorAOController, {

		mMessageParameters: {
			group: "configuration_status_action",
			save: {
				success: "MSG_STATUS_ACTION_SAVED"
			},
			del: {
				success: "MSG_STATUS_ACTION_DELETED", // text key for delete success message
				title: "BO_STATUS_ACTION_TIT_DEL", // text key for dialog title
				dialog: "BO_STATUS_ACTION_INS_DEL" // text key for dialog message
			}
		},

		createModel: function(iId) {
			if (!this.oModel) {
				this.oModel = new sap.ui.ino.models.object.StatusActionStage(iId > 0 ? iId : undefined, {
					actions: ["modify", "create", "del", "update"],
					nodes: ["Root"],
					continuousUse: true,
					concurrencyEnabled: true
				});
			}

			// this binding to the unnamed global model is used for read-only facets like comments, evaluations
			// where data is not contained in the Application Object model
			if (iId && iId > 0) {
				this.getView().bindElement("/StagingStatusActionCode(" + iId + ")");
			}

			return this.oModel;
		},

		onInit: function() {
			sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
			this.triggerRefreshOnClose = false;
		}
	}));