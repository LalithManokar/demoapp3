const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const txtProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationTextmoduleProcesser");
const NotificationPlaceholderProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationPlaceholderProcesser");
const NotificationSummaryTextmoduleProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationSummaryTextmoduleProcesser");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

function _processSubTitle(oHQ, oNotification, aCampDatas, aNotificationsSettings, iUserSettingType, sLang, oCache) {
	var txtModule;
	if (iUserSettingType === CommonUtil.USER_SETTING_TYPE.BATCH) {
		var sModuleLang = sLang;
		var sCode = SystemSettings.getValue(CommonUtil.SYS_SUMMARY_TXT_MODULE, oHQ);
		var aTxtContent = _.filter(aNotificationsSettings.OT_TXT_MODULE, function(oTxt) {
			return oTxt.TEXT_MODULE_CODE === sCode && oTxt.LANG === sModuleLang;
		});
		if (!aTxtContent || aTxtContent.length <= 0 || !aTxtContent[0]) {
			sModuleLang = CommonUtil.DEFAULT_LAN_CODE;
		}
		txtModule = NotificationSummaryTextmoduleProcesser.getData(oHQ, oCache, oNotification, sModuleLang);
	} else {
		txtModule = txtProcesser.getData(oHQ, oNotification, aNotificationsSettings, iUserSettingType, sLang, oCache);
	}
	var txtContent = NotificationPlaceholderProcesser.getData(oHQ, txtModule, oNotification, aNotificationsSettings, aCampDatas, sLang);
	oNotification.SUBTITLE = txtContent.sContent;
}

function process(oHQ, aNotifications, aCampDatas, aNotificationsSettings, iUserSettingType, sLang, oCache) {
	_.each(aNotifications, function(oNotification) {
		if (oNotification.MAIL_STATUS_CODE === 'PROCESSING') {
			if (oNotification.ACTION_CODE === CommonUtil.NOTIFY_AUTHOR) {
				oNotification.ROLE_CODE = CommonUtil.AUTHOR;
			}
			try {
				_processSubTitle(oHQ, oNotification, aCampDatas, aNotificationsSettings, iUserSettingType, sLang, oCache);
			} catch (e) {
				oNotification.MAIL_STATUS_CODE = 'ERROR';
				oNotification.MAIL_STATUS_REASON = e.toString();
			}
		}
	});
}