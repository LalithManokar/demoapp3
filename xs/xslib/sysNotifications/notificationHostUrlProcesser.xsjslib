// notificationHostUrlProcesser.xsjslib
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

var getFrontofficeUrl = _.memoize(function(oHQ, bExternal) {
	var sResult;
	if (bExternal) {
		sResult = SystemSettings.getValue("sap.ino.config.URL_PATH_UI_FRONTOFFICE", oHQ) + '/';
		if (!sResult) {
			return sResult;
		}
		return CommonUtil.getHost(oHQ, true) + sResult;
	} else {
		sResult = SystemSettings.getValue("sap.ino.config.URL_PATH_UI_FRONTOFFICE", oHQ) + '/';
		if (!sResult) {
			return sResult;
		}
		return CommonUtil.getHost(oHQ, false) + sResult;
	}
}, function(oHQ, bExternal) {
	return bExternal;
});

function _getObjectUrl(bExternal, sType, sId, sNotificationCode, oHQ) {
	var sUrl = getFrontofficeUrl(oHQ, bExternal);
	if (sUrl === null) {
		return null;
	}
	if (sType === "IDEA") {
		if (sNotificationCode === "COMMENT_CREATED" || sNotificationCode === "COMMENT_DELETED") {
			sUrl = sUrl + "#idea/" + sId + "?section=sectionComments";
		} else if ((sNotificationCode && sNotificationCode.indexOf("EXPERT_")) > -1){
			sUrl = sUrl + "#idea/" + sId + "?section=sectionExperts";
		} else if ((sNotificationCode && sNotificationCode.indexOf("EVAL_")) > -1) {
			sUrl = sUrl + "#idea/" + sId + "?section=sectionEvaluations";
		} else if ((sNotificationCode && sNotificationCode.indexOf("IDEA_RELATION_sap.ino.config.MERGED_")) > -1) {
		    sUrl = sUrl + "#idea/" + sId + "?section=sectionRelated";
		} else {
			sUrl = sUrl + "#idea/" + sId;
		}
		return sUrl;
	} else if (sType === "CAMPAIGN") {
		return sUrl + "#campaign/" + sId;
	} 
	return sUrl;
}

function getData(oHQ, bExternal, sType, sId, sNotificationCode, sText) {
	var sUrl = _getObjectUrl(bExternal, sType, sId, sNotificationCode, oHQ);
	if (!sText) {
		return sUrl;
	}
	return "<a href=\"" + sUrl + "\">" + sText + "</a>";
}