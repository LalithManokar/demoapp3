/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.ResponsibilityStage");

sap.ui.controller("sap.ui.ino.views.backoffice.config.ResponsibilityListModify", jQuery.extend({},
	sap.ui.ino.views.common.ThingInspectorAOController, {
		mMessageParameters: {
			group: "configuration_responsibilitylist",
			save: {
				success: "MSG_RESPONSIBILITY_LIST_SAVED"
			},
			del: {
				success: "MSG_RESPONSIBILITY_LIST_DELETED", // text key for delete success message
				title: "BO_RESPONSIBILITY_LIST_TIT_DELETED", // text key for dialog title
				dialog: "BO_RESPONSIBILITY_LIST_INS_DELETED" // text key for dialog message
			}
		},
		createModel: function(iId) {
			if (this.oModel === undefined || this.oModel === null) {
				this.oModel = new sap.ui.ino.models.object.ResponsibilityStage(iId > 0 ? iId : undefined, {
					actions: ["modify", "del"],
					nodes: ["Root", "RespValues","Tags","Coaches","Experts"],
					continuousUse: true,
					concurrencyEnabled: true
				});
			}

			if (iId && iId > 0) {
				this.getView().bindElement("/StagingSubresponsibility(" + iId + ")");
			}

			return this.oModel;
		},

		onInit: function() {
			sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
			this.triggerRefreshOnClose = false;
		},
		shouldTriggerRefreshOnClose: function() {
			return this.triggerRefreshOnClose;
		},

		scrollToTop: function() {
			var oView = this.getView();
			jQuery(oView.oDialog.getDomRef()).find(".sapUiDlgCont").animate({
				scrollTop: 0
			});
		}

	}));