// notificationPlaceholderIdeaStatusProcesser.xsjslib
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const hostUrlProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationHostUrlProcesser");

function _handleHistory(oHQ, oNotification, oResult, sLang) {
	var oIntegrationObject = {
		OBJECT_NAME: "",
		OBJECT_URL: "",
		OBJECT_STATUS: "",
		OBJECT_EVENT_AT: ""
	};
	var aObjectResults = [];
	oIntegrationObject.OBJECT_EVENT_AT = oNotification.EVENT_AT;
	var sObjectUUID;
	if (oNotification.HISTORY_OBJECT_INFO) {
		var aHistoryObjectInfo = oNotification.HISTORY_OBJECT_INFO.split("_INTEGRATION_OBJECT_UUID");
		if (aHistoryObjectInfo.length > 1) {
			sObjectUUID = aHistoryObjectInfo[0];
		}
	}
	var sSQL =
		'select * from "sap.ino.db.integration::t_idea_object_integration" where INTEGRATION_OBJECT_UUID = ? AND ( MAPPING_FIELD_CODE = ? OR MAPPING_FIELD_CODE = ? OR MAPPING_FIELD_CODE = ?)';

	aObjectResults = oHQ.statement(sSQL).execute(sObjectUUID, "OBJECT_TITLE", "OBJECT_URL", "OBJECT_STATUS");
	if (aObjectResults.length > 0) {
		_.each(aObjectResults, function(oObjectResult) {
			_.each(oIntegrationObject, function(sValue, sKey) {
				var sMappingFiledCode = oObjectResult.MAPPING_FIELD_CODE;
				if (sMappingFiledCode === "OBJECT_TITLE") {
					sMappingFiledCode = "OBJECT_NAME";
				}
				if (sMappingFiledCode === sKey) {
					oIntegrationObject[sKey] = oObjectResult.MAPPING_FIELD_VALUE;
				}
			});
		});
	}
	if (oIntegrationObject.OBJECT_URL) {
		var sObjectUrl = "<a href=\"" + oIntegrationObject.OBJECT_URL + "\">" + oIntegrationObject.OBJECT_URL + "</a>";
		oIntegrationObject.OBJECT_URL = sObjectUrl;
	}
	CommonUtil.replacePlaceHolder(oResult, oIntegrationObject);
}

function process(oHQ, oNotification, oResult, sLang) {
	_handleHistory(oHQ, oNotification, oResult, sLang);
}