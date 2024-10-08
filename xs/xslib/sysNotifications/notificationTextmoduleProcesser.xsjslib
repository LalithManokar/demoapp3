//notificationTextmoduleProcesser.xsjslib
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const NotificationNotifyAuthorTextmoduleProcesser = $.import("sap.ino.xs.xslib.sysNotifications",
	"notificationNotifyAuthorTextmoduleProcesser");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function _getSpecialKey(oHQ, oNotification, sLang) {
	return NotificationNotifyAuthorTextmoduleProcesser.getSpecialKey(oHQ, oNotification, sLang);
}

function _parseTxtContent(sTxtContent, oNotification) {
	var oRegex = /\$ROLE_[^$]+\$[\s\S]+\$\/ROLE_[^$]+\$/gm;
	var aAllTxtModules = oRegex.exec(sTxtContent);
	if (!aAllTxtModules || aAllTxtModules.length <= 0) {
		return {
			content: CommonUtil.DEFAULT_TXT_CONTENT,
			key: ""
		};
	}
	var sRoles = aAllTxtModules[0];
	var oRoleReg = new RegExp("\\$(ROLE_" + oNotification.ROLE_CODE + ")\\$([\\s\\S]+?)\\$\\/\\1\\$", 'gm');
	var aRole = oRoleReg.exec(sRoles);
	if (aRole && aRole.length > 2) {
		return {
			content: sTxtContent.replace(oRegex, aRole[2]),
			key: oNotification.ROLE_CODE
		};
	}
	oRoleReg = new RegExp("\\$(ROLE_" + CommonUtil.DEFAULT_RECIPIENT + ")\\$([\\s\\S]+?)\\$\\/\\1\\$", 'gm');
	aRole = oRoleReg.exec(sRoles);
	if (aRole && aRole.length > 2) {
		return {
			content: sTxtContent.replace(oRegex, aRole[2]),
			key: oNotification.ROLE_CODE
		};
	}
	return {
		content: CommonUtil.DEFAULT_TXT_CONTENT,
		key: ""
	};
}

function _getText(aNotificationsSettings, sCode, sLang) {
	if (!sCode) {
		return CommonUtil.DEFAULT_TXT_CONTENT;
	}
	var sTxtContent = CommonUtil.DEFAULT_TXT_CONTENT;
	var aTxtContent = _.filter(aNotificationsSettings.OT_TXT_MODULE, function(oTxt) {
		return oTxt.TEXT_MODULE_CODE === sCode && oTxt.LANG === sLang;
	});
	if (!aTxtContent || aTxtContent.length <= 0 || !aTxtContent[0]) {
		aTxtContent = _.filter(aNotificationsSettings.OT_TXT_MODULE, function(oTxt) {
    		return oTxt.TEXT_MODULE_CODE === sCode && oTxt.LANG === CommonUtil.DEFAULT_LAN_CODE;
    	});
	}
	if (!aTxtContent || aTxtContent.length <= 0 || !aTxtContent[0]) {
		return CommonUtil.DEFAULT_TXT_CONTENT;
	}
	sTxtContent = aTxtContent[0].TEXT_MODULE;
	if (typeof sTxtContent !== "string") {
		sTxtContent = $.util.stringify(sTxtContent);
	}
	return sTxtContent;
}

function _getCode(oHQ, oNotification, aNotificationsSettings, sLang) {
	if (NotificationNotifyAuthorTextmoduleProcesser.isSpecialCode(oNotification)) {
		return NotificationNotifyAuthorTextmoduleProcesser.getTxtModuleCode(oHQ, oNotification, aNotificationsSettings, sLang);
	}
	var aSetting = _.filter(aNotificationsSettings.OT_SYS_SETTINGS, function(oNotiSetting) {
		return oNotiSetting.ACTION_CODE === oNotification.ACTION_CODE;
	});
	if (!aSetting || aSetting.length <= 0) {
		return undefined;
	}
	if (aSetting[0].ACTION_TYPE_CODE === CommonUtil.SYS_ACTION_TYPE_CODE.SYSTEM || aSetting[0].ACTION_TYPE_CODE === CommonUtil.SYS_ACTION_TYPE_CODE
		.FOLLOW) {
		return aSetting[0].TEXT_MODULE_CODE;
	}
	var aCampSetting = _.filter(aNotificationsSettings.OT_CAMP_SETTINGS, function(oCampSetting) {
		return oCampSetting.ACTION_CODE === oNotification.ACTION_CODE && oCampSetting.CAMPAIGN_ID === oNotification.CAMPAIGN_ID;
	});
	if (!aCampSetting || aCampSetting.length <= 0) {
		return undefined;
	}
	return aCampSetting[0].TEXT_MODULE_CODE;
}

function _hasCache(oHQ, oNotification, sLang, oAllTxtModuleCache) {
	var sKey1 = (oNotification.CAMPAIGN_ID || -1).toString() + oNotification.ACTION_CODE + oNotification.ROLE_CODE + sLang + _getSpecialKey(
		oHQ, oNotification, sLang);
	var sKey2 = (oNotification.CAMPAIGN_ID || -1).toString() + oNotification.ACTION_CODE + CommonUtil.DEFAULT_RECIPIENT + sLang +
		_getSpecialKey(oHQ, oNotification, sLang);
	return sKey1 && sKey2 && oAllTxtModuleCache.hasOwnProperty(sKey1.toLocaleUpperCase()) && oAllTxtModuleCache.hasOwnProperty(sKey2.toLocaleUpperCase());
}

function _getDataFromCache(oHQ, oNotification, sLang, oAllTxtModuleCache) {
	var sKey = (oNotification.CAMPAIGN_ID || -1).toString() + oNotification.ACTION_CODE + oNotification.ROLE_CODE + sLang + _getSpecialKey(oHQ,
		oNotification, sLang);
	if (!sKey) {
		return CommonUtil.DEFAULT_TXT_CONTENT;
	}
	if (!oAllTxtModuleCache.hasOwnProperty(sKey.toLocaleUpperCase())) {
		sKey = (oNotification.CAMPAIGN_ID || -1).toString() + oNotification.ACTION_CODE + CommonUtil.DEFAULT_RECIPIENT + sLang + _getSpecialKey(
			oHQ, oNotification, sLang);
		if (!sKey) {
			return CommonUtil.DEFAULT_TXT_CONTENT;
		}
	}
	if (!oAllTxtModuleCache.hasOwnProperty(sKey.toLocaleUpperCase())) {
		return CommonUtil.DEFAULT_TXT_CONTENT;
	}
	return oAllTxtModuleCache[sKey.toLocaleUpperCase()];
}

function _setDataIntoCache(oHQ, oContent, oNotification, sLang, oAllTxtModuleCache) {
	var sKey = (oNotification.CAMPAIGN_ID || -1).toString() + oNotification.ACTION_CODE + oContent.key + sLang + _getSpecialKey(oHQ,
		oNotification, sLang);
	if (sKey) {
		oAllTxtModuleCache[sKey.toLocaleUpperCase()] = oContent.content;
	}
}

function getData(oHQ, oNotification, aNotificationsSettings, iUserSettingType, sLang, oCache) {
	if (_hasCache(oHQ, oNotification, sLang, oCache)) {
		return _getDataFromCache(oHQ, oNotification, sLang, oCache);
	}
	var sCode = _getCode(oHQ, oNotification, aNotificationsSettings, sLang);
	var sTxtContent = _getText(aNotificationsSettings, sCode, sLang);
	var oContent = _parseTxtContent(sTxtContent, oNotification);
	_setDataIntoCache(oHQ, oContent, oNotification, sLang, oCache);
	if(!oContent.content && NotificationNotifyAuthorTextmoduleProcesser.isNotifyAuthor(oNotification)){
	    return "{{DECISION_AUTHOR_COMMENT}}";
	}
	return oContent.content;
}

function parseTxtContent(sTxtContent, sRoleCode) {
	return _parseTxtContent(sTxtContent, {
		"ROLE_CODE": sRoleCode
	});
}

function parseData(oHQ, aNotificationsSettings, oAllRolePriority) {
	if (!aNotificationsSettings || !aNotificationsSettings.OT_TXT_MODULE) {
		return;
	}
	_.each(aNotificationsSettings.OT_TXT_MODULE, function(item) {
		oAllRolePriority[item.TEXT_MODULE_CODE] = oAllRolePriority[item.TEXT_MODULE_CODE] || [];
		var oRegex = /\$(ROLE_([^$]+))\$([\s\S]+?)\$\/\1\$/gm;
		do {
			var aAllTxtRoles = oRegex.exec(item.TEXT_MODULE);
			if (aAllTxtRoles && aAllTxtRoles.length > 0) {
				oAllRolePriority[item.TEXT_MODULE_CODE].push(aAllTxtRoles[2]);
			}
		} while (oRegex.lastIndex > 0 && oRegex.lastIndex < item.TEXT_MODULE.length - 1);

	});
}