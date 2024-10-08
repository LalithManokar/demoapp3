// notificationPlaceholderIdeaStatusProcesser.xsjslib
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const hostUrlProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationHostUrlProcesser");

function _handleHistory(oHQ, oNotification, oResult, sLang) {
	//Get Current Campagin Name
	var sNewCampaignName = CommonUtil.getCampaignName(oHQ, oNotification.CAMPAIGN_ID, sLang);
	let sNewCampaignValue = hostUrlProcesser.getData(oHQ, oNotification.is_external, 'CAMPAIGN', oNotification.CAMPAIGN_ID, undefined,
		sNewCampaignName);
	oResult.sContent = oResult.sContent.replace(CommonUtil.RegularExpression.NEW_CAMPAIGN_NAME, sNewCampaignValue);
	//Get Previour Campaign Name
	var sPreviousCampaignId;
	if (oNotification.HISTORY_OBJECT_INFO) {
		var aHistoryObjectInfo = oNotification.HISTORY_OBJECT_INFO.split("_PRE_CAMPAIGN_ID");
		if (aHistoryObjectInfo.length > 1) {
			sPreviousCampaignId = aHistoryObjectInfo[0];
		}
	}
	var sPreviousCampaignName = CommonUtil.getCampaignName(oHQ, sPreviousCampaignId, sLang);
	let sPreviousCampaignValue = hostUrlProcesser.getData(oHQ, oNotification.is_external, 'CAMPAIGN', oNotification.CAMPAIGN_ID, undefined,
		sPreviousCampaignName);
	oResult.sContent = oResult.sContent.replace(CommonUtil.RegularExpression.PREVIOUS_CAMPAIGN_NAME, sPreviousCampaignValue);
}

function process(oHQ, oNotification, oResult, sLang) {
	_handleHistory(oHQ, oNotification, oResult, sLang);
}