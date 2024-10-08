/*!
 * @copyright@
 */

jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");

jQuery.sap.declare("sap.ui.ino.views.backoffice.campaign.CampaignMilestoneValidationMixin");

(function() {
	var _GROUP_MILESTONEVALIDATIONS_NAME = "milestonevalidations";

	function _validateRequireField(aTasks) {
		var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
		var oMsgModel = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
		if (!aTasks || aTasks.length <= 0) {
			return true;
		}
		var bResult = true;
		jQuery.each(aTasks, function(index, oTask) {
			if (!oTask.TASK_NAME || !oTask.START_DATE || !oTask.END_DATE || !oTask.TASK_CODE) {
				bResult = false;
				return false;
			}
			jQuery.each(oTask.Milestones, function(indexMilestone, oMilestone) {
				if (!oMilestone.MILESTONE_NAME || !oMilestone.MILESTONE_DATE) {
					bResult = false;
					return false;
				}
			});
		});
		if (!bResult) {
			var oMsg = new sap.ui.ino.application.Message({
				group: _GROUP_MILESTONEVALIDATIONS_NAME,
				level: sap.ui.core.MessageType.Error,
				text: oMsgModel.getResourceBundle().getText("MSG_CAMPAIGN_MILESTONE_NAME_MISSING")
			});
			oApp.addNotificationMessage(oMsg);
		}
		return bResult;
	}

	function _validateCount(aTasks) {
		var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
		var oMsgModel = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
		var MAX_TASK_COUNT = 5,
			MAX_MILESTONE_COUNT = 9,
			MAX_MILESTONE_TOTAL = 15;
		if (!aTasks || aTasks.length <= 0) {
			return true;
		}
		var nTaskCount = 0,
			nMaxMilestoneCount = 0,
			nMilestoneTotal = 0;
		jQuery.each(aTasks, function(index, oTask) {
			if (oTask.IS_TASK_DISPLAY) {
				nTaskCount++;
				var nCurrentMilestoneCount = 0;
				jQuery.each(oTask.Milestones, function(indexMilestone, oMilestone) {
					if (oMilestone.IS_MILESTONE_DISPLAY) {
						nCurrentMilestoneCount++;
						nMilestoneTotal++;
					}
				});
				if (nCurrentMilestoneCount > MAX_MILESTONE_COUNT) {
					var oMsgMilestoneCount = new sap.ui.ino.application.Message({
						group: _GROUP_MILESTONEVALIDATIONS_NAME,
						level: sap.ui.core.MessageType.Error,
						text: oMsgModel.getResourceBundle().getText("MSG_CAMPAIGN_TASK_MILESTONE_INVALID_COUNT", oTask.TASK_NAME)
					});
					oApp.addNotificationMessage(oMsgMilestoneCount);
				}
				if (nCurrentMilestoneCount > nMaxMilestoneCount) {
					nMaxMilestoneCount = nCurrentMilestoneCount;
				}
			}
		});
		if (nTaskCount > MAX_TASK_COUNT) {
			var oMsgTasksCount = new sap.ui.ino.application.Message({
				group: _GROUP_MILESTONEVALIDATIONS_NAME,
				level: sap.ui.core.MessageType.Error,
				text: oMsgModel.getResourceBundle().getText("MSG_CAMPAIGN_TASK_INVALID_COUNT")
			});
			oApp.addNotificationMessage(oMsgTasksCount);
		}
		if (nMilestoneTotal > MAX_MILESTONE_TOTAL) {
			var oMsgMilestoneTotal = new sap.ui.ino.application.Message({
				group: _GROUP_MILESTONEVALIDATIONS_NAME,
				level: sap.ui.core.MessageType.Error,
				text: oMsgModel.getResourceBundle().getText("MSG_CAMPAIGN_MILESTONE_INVALID_COUNT")
			});
			oApp.addNotificationMessage(oMsgMilestoneTotal);
		}
		return nTaskCount <= MAX_TASK_COUNT && nMaxMilestoneCount <= MAX_MILESTONE_COUNT && nMilestoneTotal <= MAX_MILESTONE_TOTAL;
	}

	function _validateDate(aTasks, dValidFrom, dValidTo) {
		var dStartDate = new Date(dValidFrom.getFullYear(), dValidFrom.getMonth(), dValidFrom.getDate());
		var dEndDate = new Date(dValidTo.getFullYear(), dValidTo.getMonth(), dValidTo.getDate());
		var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
		var oMsgModel = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
		if (!aTasks || aTasks.length <= 0) {
			return true;
		}
		var bResult = true;
		jQuery.each(aTasks, function(index, oTask) {
			if (oTask.IS_TASK_DISPLAY) {
				if (oTask.START_DATE >= oTask.END_DATE) {
					var oMsgTaskDate = new sap.ui.ino.application.Message({
						group: _GROUP_MILESTONEVALIDATIONS_NAME,
						level: sap.ui.core.MessageType.Error,
						text: oMsgModel.getResourceBundle().getText("MSG_TASK_INVALID_DATE", oTask.TASK_NAME)
					});
					oApp.addNotificationMessage(oMsgTaskDate);
					bResult = false;
				}
				if (oTask.START_DATE < dStartDate || oTask.END_DATE > dEndDate) {
					var oMsgTask = new sap.ui.ino.application.Message({
						group: _GROUP_MILESTONEVALIDATIONS_NAME,
						level: sap.ui.core.MessageType.Error,
						text: oMsgModel.getResourceBundle().getText("MSG_CAMPAIGN_TASK_INVALID_DATE", oTask.TASK_NAME)
					});
					oApp.addNotificationMessage(oMsgTask);
					bResult = false;
				}
				jQuery.each(oTask.Milestones, function(indexMilestone, oMilestone) {
					if (oMilestone.IS_MILESTONE_DISPLAY) {
						if (oMilestone.MILESTONE_DATE < oTask.START_DATE || oMilestone.MILESTONE_DATE > oTask.END_DATE) {
							var oMsgMilestone = new sap.ui.ino.application.Message({
								group: _GROUP_MILESTONEVALIDATIONS_NAME,
								level: sap.ui.core.MessageType.Error,
								text: oMsgModel.getResourceBundle().getText("MSG_CAMPAIGN_MILESTONE_INVALID_DATE", oMilestone.MILESTONE_NAME)
							});
							oApp.addNotificationMessage(oMsgMilestone);
							bResult = false;
						}
					}
				});
			}
		});
		return bResult;
	}

	sap.ui.ino.views.backoffice.campaign.CampaignMilestoneValidationMixin = {
		validateRequireField: _validateRequireField,
		validateCount: _validateCount,
		validateDate: _validateDate
	};
}());