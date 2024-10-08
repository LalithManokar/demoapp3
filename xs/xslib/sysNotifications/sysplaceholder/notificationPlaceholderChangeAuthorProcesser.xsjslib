// notificationPlaceholderChangeAuthorProcesser.xsjslib
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function _splitHistoryObjectInfo(oNotification) {
	if (!oNotification.HISTORY_OBJECT_INFO) {
		return -1;
	}
	var aResult = oNotification.HISTORY_OBJECT_INFO.split("_PRE_AUTHOR_ID");
	if (aResult.length !== 2) {
		return -1;
	}
	if (Number.isNaN(Number(aResult[0]))) {
		return -1;
	}
	return Number(aResult[0]);
}

function process(oHQ, oNotification, oResult) {
	var nPreAuthor = _splitHistoryObjectInfo(oNotification);
	CommonUtil.replacePlaceHolder(oResult, CommonUtil.getIdentity(oHQ, nPreAuthor), "PREVIOUS_AUTHOR_");
	CommonUtil.replacePlaceHolder(oResult, CommonUtil.getIdentity(oHQ, oNotification.OWNER_ID), "NEW_AUTHOR_");
}