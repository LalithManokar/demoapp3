// notificationPlaceholderCoauthorProcesser.xsjslib

const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function process(oHQ, oNotification, oResult) {
	if (!oNotification.HISTORY_OBJECT_INFO) {
		return;
	}
	var aResult = oNotification.HISTORY_OBJECT_INFO.split("_CONTRIBUTOR_ID");
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
	CommonUtil.replacePlaceHolder(oResult, oData, "COAUTHOR_");
}