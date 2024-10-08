/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.IdeaFormStage");

sap.ui.controller("sap.ui.ino.views.backoffice.config.IdeaFormModify", jQuery.extend({},
	sap.ui.ino.views.common.ThingInspectorAOController, {
		mMessageParameters: {
			group: "configuration_ideafrom",
			save: {
				success: "MSG_IDEA_FORM_ADMINISTRATION_SAVED"
			},
			del: {
				success: "MSG_IDEA_FORM_ADMINISTRATION_DELETED", // text key for delete success message
				title: "BO_IDEA_FORM_ADMINISTRATION_TIT_DELETE", // text key for dialog title
				dialog: "BO_IDEA_FORM_ADMINISTRATION_INS_DEL" // text key for dialog message
			}
		},
		createModel: function(iId) {
			if (this.oModel === undefined || this.oModel === null){
				this.oModel = new sap.ui.ino.models.object.IdeaFormStage(iId > 0 ? iId : undefined, {
					actions: ["modify", "del"],
					nodes: ["Root", "Fields"],
					continuousUse: true,
					concurrencyEnabled: true
				});
			}

			if (iId && iId > 0) {
				this.getView().bindElement("/StagingIdeaForm(" + iId + ")");
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