// notificationPlaceholderIdeaStatusProcesser.xsjslib
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const hostUrlProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationHostUrlProcesser");

function _handleHistory(oHQ, oNotification, oResult, sLang) {
	//Get Follow Up Date
	var sFollowUpDate = "";
	if (oNotification.HISTORY_OBJECT_INFO) {
		var aFollowUpDate = oNotification.HISTORY_OBJECT_INFO.split("_FOLLOW_UP_DATE");
		if (aFollowUpDate.length > 1) {
			sFollowUpDate = aFollowUpDate[0];
		}
	}
	oResult.sContent = oResult.sContent.replace(CommonUtil.RegularExpression.IDEA_FOLLOW_UP_DATE, !sFollowUpDate ? "" : CommonUtil.formatDate(new Date(sFollowUpDate)));
}

function process(oHQ, oNotification, oResult, sLang) {
	_handleHistory(oHQ, oNotification, oResult, sLang);
}