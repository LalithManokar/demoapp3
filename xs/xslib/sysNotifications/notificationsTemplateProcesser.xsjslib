//notificationsTemplateProcesser.xsjslib

const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const NotificationPlaceholderProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationPlaceholderProcesser");
const NotificationNotifyAuthorTextmoduleProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationNotifyAuthorTextmoduleProcesser");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function _getText(aNotificationsSettings, sCode, sLang) {
	if (!sCode) {
		return CommonUtil.EMPTY_CONTENT;
	}
	var sTxtContent = CommonUtil.EMPTY_CONTENT;
	var aTxtContent = _.filter(aNotificationsSettings.OT_MAIL_TEMPLATE, function(oTxt) {
		return oTxt.MAIL_TEMPLATE_CODE === sCode && oTxt.LANG === sLang;
	});
	if (!aTxtContent || aTxtContent.length <= 0 || !aTxtContent[0]) {
	    aTxtContent = _.filter(aNotificationsSettings.OT_MAIL_TEMPLATE, function(oTxt) {
    		return oTxt.MAIL_TEMPLATE_CODE === sCode && oTxt.LANG === CommonUtil.DEFAULT_LAN_CODE;
    	});
	}
	if (!aTxtContent || aTxtContent.length <= 0 || !aTxtContent[0]) {
		return CommonUtil.EMPTY_CONTENT;
	}
	sTxtContent = aTxtContent[0].TEMPLATE;
	if (typeof sTxtContent !== "string") {
		sTxtContent = $.util.stringify(sTxtContent);
	}
	return sTxtContent;
}

function _getCode(oHQ, oNotification, aCampDatas, aNotificationsSettings, iUserSettingType, sLang) {
	if (iUserSettingType === CommonUtil.USER_SETTING_TYPE.BATCH) {
		return SystemSettings.getValue(CommonUtil.SYS_EMAIL_TEMPLATE.summary_code, oHQ);
	}
	var sActionCode = oNotification.ACTION_CODE;
	if (NotificationNotifyAuthorTextmoduleProcesser.isNotifyAuthor(oNotification)) {
		sActionCode = NotificationNotifyAuthorTextmoduleProcesser.getActionCodeFromHistory(oHQ, oNotification, aNotificationsSettings, sLang);
	}
	var aSetting = _.filter(aNotificationsSettings.OT_SYS_SETTINGS, function(oNotiSetting) {
		return oNotiSetting.ACTION_CODE === sActionCode;
	});
	if (!aSetting || aSetting.length <= 0) {
		return undefined;
	}
	if (aSetting[0].ACTION_TYPE_CODE === CommonUtil.SYS_ACTION_TYPE_CODE.SYSTEM || aSetting[0].ACTION_TYPE_CODE === CommonUtil.SYS_ACTION_TYPE_CODE.FOLLOW) {
		return aSetting[0].EMAIL_TEMPLATE_CODE;
	}
	var aCamp = _.filter(aCampDatas, function(oCamp) {
		return oCamp.ID === oNotification.CAMPAIGN_ID;
	});
	if (!aCamp || aCamp.length <= 0) {
		return undefined;
	}
	return aCamp[0].MAIL_TEMPLATE_CODE;
}

function getData(oHQ, oNotification, aCampDatas, aNotificationsSettings, iUserSettingType, oUser, sContent, oCache) {
	var sCode = _getCode(oHQ, oNotification, aCampDatas, aNotificationsSettings, iUserSettingType, oUser.LOCALE);
	var sTemplateContent = _getText(aNotificationsSettings, sCode, oUser.LOCALE);
	if (iUserSettingType === CommonUtil.USER_SETTING_TYPE.IMME) {
		return sTemplateContent.replace("{{CONTENT}}", oNotification.SUBTITLE);
	}
	var sResult = sTemplateContent.replace("{{CONTENT}}", oCache.template.replace("{{CONTENT}}", sContent));
	sResult = NotificationPlaceholderProcesser.replaceUser(oHQ, oUser.USER_ID, sResult, "RECIPIENT_");
	return NotificationPlaceholderProcesser.replaceUser(oHQ, oUser.USER_ID, sResult, "ACTOR_");
}