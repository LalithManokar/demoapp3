/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.StatusModelStage");

sap.ui.controller("sap.ui.ino.views.backoffice.statusconfig.StatusModelModify", jQuery.extend({},
	sap.ui.ino.views.common.ThingInspectorAOController, {

		mMessageParameters: {
			group: "configuration_status",
			save: {
				success: "MSG_STATUS_MODEL_SAVED"
			},
            del : {
            success : "MSG_STATUS_MODEL_DELETED", // text key for delete success message
            title : "BO_STATUS_MODEL_TIT_DEL", // text key for dialog title
            dialog : "BO_STATUS_MODEL_INS_DEL" // text key for dialog message
        }

		},

		createModel: function(iId) {
			if (!this.oModel) {
				this.oModel = new sap.ui.ino.models.object.StatusModelStage(iId > 0 ? iId : undefined, {
					actions: ["modify", "del"],
					nodes: ["Root", "Transitions"],
					continuousUse: true,
					concurrencyEnabled: true
				});
			}
			// this binding to the unnamed global model is used for read-only facets like comments, evaluations
			// where data is not contained in the Application Object model
			if (iId && iId > 0) {
				this.getView().bindElement("/StagingStatusModelCode(" + iId + ")");
			}
			return this.oModel;
		},

		onInit: function() {
			sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
			this.triggerRefreshOnClose = false;
		},

		onSave: function() {
			this.getView().resetBindingLookup();
			return sap.ui.ino.views.common.ThingInspectorAOController.onSave.apply(this, arguments);
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