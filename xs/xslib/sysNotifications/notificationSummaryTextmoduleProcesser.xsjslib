//notificationSummaryTextmoduleProcesser.xsjslib

const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

function _getAllRolesTxtContent(sTxtContent) {
	var oRegex = /\$ROLE_[^$]+\$[\s\S]+\$\/ROLE_[^$]+\$/gm;
	var aAllTxtRoles = oRegex.exec(sTxtContent);
	if (!aAllTxtRoles || aAllTxtRoles.length <= 0) {
		return undefined;
	}
	return {
		template: sTxtContent.replace(oRegex, CommonUtil.EMPTY_CONTENT),
		roles: aAllTxtRoles[0]
	};
}

function _getAllActionsTxtContent(sTxtContent) {
	var oRegex = /\$ACTION_[^$]+\$[\s\S]+\$\/ACTION_[^$]+\$/gm;
	var aAllTxtActions = oRegex.exec(sTxtContent);
	if (!aAllTxtActions || aAllTxtActions.length <= 0) {
		return undefined;
	}
	return {
		template: sTxtContent.replace(oRegex, CommonUtil.EMPTY_CONTENT),
		actions: aAllTxtActions[0]
	};
}

function _parseActionTxtContent(sTxtContent) {
	var oRegex = /\$(ACTION_([^$]+))\$([\s\S]+)\$\/\1\$/gm,
		oResult = {};
	do {
		var aAllTxtActions = oRegex.exec(sTxtContent);
		if (aAllTxtActions && aAllTxtActions.length > 0) {
			oResult[aAllTxtActions[2]] = aAllTxtActions[3];
		}
	} while (oRegex.lastIndex > 0 && oRegex.lastIndex < sTxtContent.length - 1);
	return oResult;
}

function parseRoleTxtContent(sTxtContent) {
	var oRolesText = _getAllRolesTxtContent(sTxtContent);
	if (!oRolesText) {
		return {};
	}
	var oRegex = /\$(ROLE_([^$]+))\$([\s\S]+?)\$\/\1\$/gm,
		oResult = {};
	do {
		var aAllTxtRoles = oRegex.exec(oRolesText.roles);
		if (aAllTxtRoles && aAllTxtRoles.length > 0) {
			oResult[aAllTxtRoles[2]] = oRolesText.template.replace(CommonUtil.EMPTY_CONTENT, aAllTxtRoles[3]);
		}
	} while (oRegex.lastIndex > 0 && oRegex.lastIndex < sTxtContent.length - 1);
	return oResult;
}

function _getTexts(aNotificationsSettings, sCode) {
	if (!sCode) {
		return [];
	}
	var aTxtContent = _.filter(aNotificationsSettings.OT_TXT_MODULE, function(oTxt) {
		return oTxt.TEXT_MODULE_CODE === sCode;
	});
	if (!aTxtContent || aTxtContent.length <= 0) {
		return [];
	}
	return aTxtContent;
}

function _getAllData(aTxtContent, oCache, sCode, oAllSummaryRolePriority) {
	_.each(aTxtContent, function(oTxtContent) {
		var oActionsContent = _getAllActionsTxtContent(oTxtContent.TEXT_MODULE);
		if (oActionsContent) {
			oCache.template = oActionsContent.template;
			var oActions = _parseActionTxtContent(oActionsContent.actions);
			_.each(oActions, function(sAction, sActionKey) {
			    oAllSummaryRolePriority[sActionKey] = [];
				var oRoles = parseRoleTxtContent(sAction);
				_.each(oRoles, function(sRole, sRoleKey) {
				    oAllSummaryRolePriority[sActionKey].push(sRoleKey);
					var sKey = sCode + sActionKey + sRoleKey + oTxtContent.LANG;
					if (sKey) {
						oCache[sKey.toLocaleUpperCase()] = sRole;
					}
				});
			});
		}
	});
}

function parseData(oHQ, aNotificationsSettings, oCache, oAllSummaryRolePriority) {
	var sCode = SystemSettings.getValue(CommonUtil.SYS_SUMMARY_TXT_MODULE, oHQ);
	var aTxtContent = _getTexts(aNotificationsSettings, sCode);
	_getAllData(aTxtContent, oCache, sCode, oAllSummaryRolePriority);
}

function getData(oHQ, oSummaryTxtModules, oNotification, sLang) {
	var sCode = SystemSettings.getValue(CommonUtil.SYS_SUMMARY_TXT_MODULE, oHQ);
	var sKey = sCode + oNotification.ACTION_CODE + oNotification.ROLE_CODE + sLang;
	if (!sKey) {
		return CommonUtil.DEFAULT_TXT_CONTENT;
	}
	if (!oSummaryTxtModules.hasOwnProperty(sKey.toLocaleUpperCase())) {
		sKey = sCode + oNotification.ACTION_CODE + CommonUtil.DEFAULT_RECIPIENT + sLang;
		if (!sKey) {
			return CommonUtil.DEFAULT_TXT_CONTENT;
		}
	}
	if (!oSummaryTxtModules.hasOwnProperty(sKey.toLocaleUpperCase())) {
		return CommonUtil.DEFAULT_TXT_CONTENT;
	}
	return oSummaryTxtModules[sKey.toLocaleUpperCase()] || CommonUtil.DEFAULT_TXT_CONTENT;
}

//end