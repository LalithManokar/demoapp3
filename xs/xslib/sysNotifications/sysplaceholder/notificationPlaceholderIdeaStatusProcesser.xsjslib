// notificationPlaceholderIdeaStatusProcesser.xsjslib
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function _splitResponse(oHQ, oNotification) {
	var oResult = {
		AUTHOR_COMMENT: "",
		REFERENCE_URL: "",
		REFERENCE_LABEL: "",
		REASON_COMMENT: "",
		CHANGE_REASON: "",
		TEXTCODE: ""
	};
	if (!oNotification.RESPONSE) {
		return oResult;
	}
	var aResponse = oNotification.RESPONSE.split("_INO_LINK_URL_");
	if (aResponse.length > 1) {
		oResult.AUTHOR_COMMENT = (aResponse[1] || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
	} else {
		oResult.AUTHOR_COMMENT = (oNotification.RESPONSE || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
	}
	aResponse = aResponse[0].split("_INO_LINK_LABEL_");
	if (aResponse.length > 1) {
		oResult.REFERENCE_URL = aResponse[1];
	}
	aResponse = aResponse[0].split("_INO_REASON_TEXT_");
	if (aResponse.length > 1) {
		oResult.REFERENCE_LABEL = aResponse[1];
	}
	aResponse = aResponse[0].split("_INO_REASON_CODE_");
	if (aResponse.length > 1) {
		oResult.REASON_COMMENT = (aResponse[1] || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
	}
	aResponse = aResponse[0].split("_INO_TEXT_CODE_");
	if (aResponse.length > 1) {
		oResult.CHANGE_REASON = CommonUtil.getValueText(oHQ, aResponse[1]);
		oResult.TEXTCODE = aResponse[0];
	}
	return oResult;
}

function process(oHQ, oNotification, oResult, sLang) {
	CommonUtil.replacePlaceHolder(oResult, _splitResponse(oHQ, oNotification), "DECISION_");
	var oData = CommonUtil.splitIdeaStatusHistoryObjectInfo(oHQ, oNotification, sLang);
	if (oData.MAKER && !isNaN(Number(oData.MAKER)) && Number(oData.MAKER) > 0) {
		var oMaker = CommonUtil.getIdentity(oHQ, oData.MAKER);
		oData.DECISION_MAKER = oMaker.NAME;
	}else{
	    oData.DECISION_MAKER = "";
	}
	CommonUtil.replacePlaceHolder(oResult, oData);
}