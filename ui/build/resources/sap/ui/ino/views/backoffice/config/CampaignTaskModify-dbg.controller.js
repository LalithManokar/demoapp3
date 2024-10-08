/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.MilestoneTaskStage");

sap.ui.controller("sap.ui.ino.views.backoffice.config.CampaignTaskModify", jQuery.extend({},
	sap.ui.ino.views.common.ThingInspectorAOController, {
		mMessageParameters: {
			group: "configuration_evaluation",
			save: {
				success: "MSG_CAMPAIGN_TASK_SAVE_SUCCESS"
			},
			del: {
				success: "MSG_CAMPAIGN_TASK_DELETED", // text key for delete success message
				title: "BO_CAMPAIGN_TASK_TIT_DEL", // text key for dialog title
				dialog: "BO_CAMPAIGN_TASK_INS_DEL" // text key for dialog message
			}
		},

		createModel: function(iId) {
			if (!this.oModel) {
				this.oModel = new sap.ui.ino.models.object.MilestoneTaskStage(iId > 0 ? iId : undefined, {
					actions: ["modify", "del"],
					nodes: ["Root"],
					continuousUse: true,
					concurrencyEnabled: true
				});
			}
			if (iId && iId > 0) {
				this.getView().bindElement("/StagingMilestoneTask(" + iId + ")");
			}
			return this.oModel;
		},

		onInit: function() {
			sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
			this.triggerRefreshOnClose = false;
		}
	}));