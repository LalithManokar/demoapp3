// notificationNotifyAuthorTextmoduleProcesser.xsjslib
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function _getHistoryObjectInfo(oHQ, oNotification, sLang) {
	return CommonUtil.splitIdeaStatusHistoryObjectInfo(oHQ, oNotification, sLang);
}

function isSpecialCode(oNotification) {
	return oNotification.ACTION_CODE === CommonUtil.NOTIFY_AUTHOR || oNotification.ACTION_CODE === CommonUtil.CHANGE_STATUS || oNotification.ACTION_CODE ===
		CommonUtil.CHANGE_DECISION;
}

function _isStatusChange(oNotification, oHistoryInfo) {
	return oNotification.ACTION_CODE === CommonUtil.CHANGE_STATUS;
}

function _isPhaseChange(oNotification, oHistoryInfo) {
	return oHistoryInfo.SUB_ACTION_TYPE === "PHASE";
}

function _isDecisionChange(oNotification, oHistoryInfo) {
	return oNotification.ACTION_CODE === CommonUtil.CHANGE_DECISION;
}

function _getCodeOfStatus(oHQ, oNotification, aNotificationsSettings, oHistoryInfo) {
	var sStatusTransitionCode = oHistoryInfo.TRANSITION_CODE;
	var aStatusModelTran = _.filter(aNotificationsSettings.OT_STATUS_MODULE, function(oStatusModule) {
		return oStatusModule.STATUS_ACTION_CODE === sStatusTransitionCode && oStatusModule.CAMPAIGN_ID === oNotification.CAMPAIGN_ID;
	});
	if (!aStatusModelTran || aStatusModelTran.length <= 0) {
		return undefined;
	}
	var aStatusTran = _.filter(aNotificationsSettings.OT_STATUS_MODEL_TRAN, function(oStatusTran) {
		return oStatusTran.CODE === sStatusTransitionCode;
	});
	if (!aStatusTran || aStatusTran.length <= 0 || !aStatusTran[0].INCLUDE_RESPONSE) {
		oNotification.MAIL_STATUS_CODE = CommonUtil.SKIPPED;
		oNotification.MAIL_STATUS_REASON = 'the system do not allow to send email via status model setting';
		return undefined;
	}
	return aStatusModelTran[0].TEXT_MODULE_CODE;
}

function isNotifyAuthor(oNotification) {
	return oNotification.ACTION_CODE === CommonUtil.NOTIFY_AUTHOR;
}

function getSpecialKey(oHQ, oNotification, sLang) {
	if (!isNotifyAuthor(oNotification)) {
		return CommonUtil.DEFAULT_TXT_CONTENT;
	}
	var oHistoryInfo = _getHistoryObjectInfo(oHQ, oNotification, sLang);
	if (_isStatusChange(oNotification, oHistoryInfo)) {
		return oHistoryInfo.SUB_ACTION_TYPE + oHistoryInfo.TRANSITION_CODE;
	}
	return oHistoryInfo.SUB_ACTION_TYPE;
}

function getActionCodeFromHistory(oHQ, oNotification, aNotificationsSettings, sLang) {
	var oHistoryInfo = _getHistoryObjectInfo(oHQ, oNotification, sLang),
		sAction = CommonUtil.CHANGE_IDEA_PHASE;
	if (_isStatusChange(oNotification, oHistoryInfo)) {
		sAction = CommonUtil.CHANGE_STATUS;
	}
	if (_isDecisionChange(oNotification, oHistoryInfo)) {
		sAction = CommonUtil.CHANGE_DECISION;
	}
	return sAction;
}

function getTxtModuleCode(oHQ, oNotification, aNotificationsSettings, sLang) {
	var oHistoryInfo = _getHistoryObjectInfo(oHQ, oNotification, sLang),
		sAction = CommonUtil.CHANGE_IDEA_PHASE;
	if (_isStatusChange(oNotification, oHistoryInfo) || isNotifyAuthor(oNotification, oHistoryInfo)) {
		return _getCodeOfStatus(oHQ, oNotification, aNotificationsSettings, oHistoryInfo);
	}
	if (_isDecisionChange(oNotification, oHistoryInfo)) {
		sAction = CommonUtil.CHANGE_DECISION;
	}
	var aCampSetting = _.filter(aNotificationsSettings.OT_CAMP_SETTINGS, function(oCampSetting) {
		return oCampSetting.ACTION_CODE === sAction && oCampSetting.CAMPAIGN_ID === oNotification.CAMPAIGN_ID;
	});
	if (!aCampSetting || aCampSetting.length <= 0) {
		oNotification.MAIL_STATUS_CODE = CommonUtil.SKIPPED;
		oNotification.MAIL_STATUS_REASON = 'the system do not allow to send email via campaign setting(' + sAction + ')';
		return undefined;
	}
	return aCampSetting[0].TEXT_MODULE_CODE;
}