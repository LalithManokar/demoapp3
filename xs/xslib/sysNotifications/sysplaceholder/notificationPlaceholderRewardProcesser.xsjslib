// notificationPlaceholderRewardProcesser
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function _replacePhase(oHQ, oNotification, oResult, sLang) {
	var oPhase = {
		"PHASE": ""
	};
	if (!oNotification.HISTORY_OBJECT_INFO) {
		return;
	}
	var aResult = oNotification.HISTORY_OBJECT_INFO.split("_IDEA_PHASE_CODE");
	if (!aResult || aResult.length < 2 || !aResult[0]) {
		return;
	}
	oPhase.PHASE = CommonUtil.getCodeText(aResult[0], "t_phase", sLang);
	CommonUtil.replacePlaceHolder(oResult, oPhase);
}

function _replaceAuthor(oHQ, oNotification, oResult, sLang) {
	if (!oNotification.HISTORY_OBJECT_INFO) {
		return;
	}
	var aResult = oNotification.HISTORY_OBJECT_INFO.split("_IDEA_PHASE_CODE");
	if (!aResult || aResult.length < 2 || !aResult[0]) {
		return;
	}
	aResult = aResult[1].split("_AUTHOR_ID");
	if (!aResult || aResult.length < 2 || !aResult[0]) {
		return;
	}
	aResult = aResult[0].split(",");
	aResult = _.map(aResult, function(sId) {
		return parseInt(sId, 10);
	});
	var sIdentityStatement = 'select  name,first_name,last_name  from "sap.ino.db.iam::t_identity" where 1!=1 ';
	_.each(aResult, function() {
		sIdentityStatement += ' or id = ? ';
	});
	aResult = oHQ.statement(sIdentityStatement).execute(aResult);
	var oData = {
		"NAME": "",
		"FIRST_NAME": "",
		"LAST_NAME": ""
	};
	if (aResult && aResult.length === 1) {
		oData.NAME = aResult[0].NAME;
		oData.FIRST_NAME = aResult[0].FIRST_NAME;
		oData.LAST_NAME = aResult[0].LAST_NAME;
	} else {
		_.each(aResult, function(oName) {
			oData.NAME += "<li>" + oName.NAME + "</li>";
			oData.FIRST_NAME += "<li>" + oName.FIRST_NAME + "</li>";
			oData.LAST_NAME += "<li>" + oName.LAST_NAME + "</li>";
		});
		oData.NAME = "<ul>" + oData.NAME + "</ul>";
		oData.FIRST_NAME = "<ul>" + oData.FIRST_NAME + "</ul>";
		oData.LAST_NAME = "<ul>" + oData.LAST_NAME + "</ul>";
	}
	CommonUtil.replacePlaceHolder(oResult, oData, "AUTHOR_");
}

function process(oHQ, oNotification, oResult, sLang) {
	_replacePhase(oHQ, oNotification, oResult, sLang);
	_replaceAuthor(oHQ, oNotification, oResult, sLang);
}