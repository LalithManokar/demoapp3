//notificationPlaceholderProcesser.xsjslib
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const NotificationHostUrlProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationHostUrlProcesser");
const NotificationPlaceholderSpecialProcesser = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder",
	"notificationPlaceholderSpecialProcesser");
const NotificationPlaceholderAuthorProcesser = $.import("sap.ino.xs.xslib.sysNotifications.sysplaceholder",
	"notificationPlaceholderAuthorProcesser");

function _getIdeaId(oNotification) {
	//oNotification.OBJECT_TYPE_CODE === "EVAL_REQUEST_ITEM" ? oNotification.INVOLVED_ID : oNotification.OBJECT_ID;
	if (oNotification.OBJECT_TYPE_CODE === "IDEA") {
		return oNotification.OBJECT_ID;
	} else if (oNotification.ACTION_CODE.indexOf("EVALUATION_REQUEST_") > -1 || oNotification.OBJECT_TYPE_CODE === "EVAL_REQUEST_ITEM" ||
		oNotification.ACTION_CODE === "DELIVERY_OF_REQUEST_CLARIFICATION" || oNotification.ACTION_CODE === "RECEIPT_OF_REQUEST_CLARIFICATION") {
		return oNotification.INVOLVED_ID;
	} else if (oNotification.OBJECT_TYPE_CODE === "FOLLOW" && (oNotification.ACTION_CODE === "FOLLOW_IDEA" || oNotification.ACTION_CODE ===
		"UNFOLLOW_IDEA")) {
		return oNotification.OBJECT_ID;
	}
	return -1;
}

function _replaceCampaignData(oHQ, oCampaign, oResult, oNotification) {
	if (!oCampaign || !oResult.sContent) {
		return;
	}
	if (oCampaign.COLOR) {
		CommonUtil.replacePlaceHolder(oResult, {
			"CAMPAIGN_ID": oCampaign.ID,
			"CAMPAIGN_COLOR": oCampaign.COLOR,
			"CAMPAIGN_COLOR_SMALL": oCampaign.COLOR
		});
	}
	if (oCampaign.CAMPAIGN_NAME) {
		CommonUtil.replacePlaceHolder(oResult, {
			"CAMPAIGN_NAME": NotificationHostUrlProcesser.getData(oHQ, true, "CAMPAIGN", oCampaign.ID, undefined, CommonUtil.encodeHtml(oCampaign.CAMPAIGN_NAME))
		});
	} else if (oCampaign.CAMPAIGN_NAME_EN) {
		CommonUtil.replacePlaceHolder(oResult, {
			"CAMPAIGN_NAME": NotificationHostUrlProcesser.getData(oHQ, true, "CAMPAIGN", oCampaign.ID, undefined, CommonUtil.encodeHtml(oCampaign.CAMPAIGN_NAME_EN))
		});
	}
	if (oNotification && (oNotification.ACTION_CODE === 'PUBLISH_CAMPAIGN' || oNotification.ACTION_CODE === 'CAMPAIGN_START_SOON' ||
		oNotification.ACTION_CODE === 'CAMPAIGN_DUE_TO_EXPIRE' || oNotification.ACTION_CODE === 'IDEA_SUBMISSION_SOON' || oNotification.ACTION_CODE ===
		'IDEA_SUBMISSION_DUE_TO_EXPIRE' || oNotification.ACTION_CODE === 'CAMPAIGN_REGISTRATION_SOON' || oNotification.ACTION_CODE ===
		'CAMPAIGN_REGISTRATION_DUE_TO_EXPIRE')) {
		CommonUtil.replacePlaceHolder(oResult, {
			"CONTENT": !oCampaign.DESCRIPTION ? (!oCampaign.DESCRIPTION_EN ? "" : oCampaign.DESCRIPTION_EN) : oCampaign.DESCRIPTION
		});
		CommonUtil.replacePlaceHolder(oResult, {
			"VALID_FROM": !oCampaign.VALID_FROM ? "" : CommonUtil.formatDate(new Date(oCampaign.VALID_FROM))
		});
		CommonUtil.replacePlaceHolder(oResult, {
			"VALID_TO": !oCampaign.VALID_TO ? "" : CommonUtil.formatDate(new Date(oCampaign.VALID_TO))
		});
		CommonUtil.replacePlaceHolder(oResult, {
			"SUBMISSION_FROM": !oCampaign.SUBMIT_FROM ? "" : CommonUtil.formatDate(new Date(oCampaign.SUBMIT_FROM))
		});
		CommonUtil.replacePlaceHolder(oResult, {
			"SUBMISSION_TO": !oCampaign.SUBMIT_TO ? "" : CommonUtil.formatDate(new Date(oCampaign.SUBMIT_TO))
		});
		CommonUtil.replacePlaceHolder(oResult, {
			"REGISTRATION_FROM": !oCampaign.REGISTER_FROM ? "" : CommonUtil.formatDate(new Date(oCampaign.REGISTER_FROM))
		});
		CommonUtil.replacePlaceHolder(oResult, {
			"REGISTRATION_TO": !oCampaign.REGISTER_TO ? "" : CommonUtil.formatDate(new Date(oCampaign.REGISTER_TO))
		});
	}
}

function _replaceIdeaData(oHQ, oNotification, aNotificationsSettings, oIdea, oResult, sLang) {
	if (!oIdea) {
		return;
	}
	_.each(oIdea, function(sAttribute, sKey) {
		if (sKey === "IDEA_NAME") {
			var ideaId = _getIdeaId(oNotification);
			sAttribute = NotificationHostUrlProcesser.getData(oHQ, oNotification.IS_EXTERNAL, "IDEA", ideaId,
				oNotification.NOTIFICATION_CODE, CommonUtil.encodeHtml(sAttribute));
		}
		if (sKey === "PHASE") {
			sAttribute = CommonUtil.getCodeText(sAttribute, "t_phase", sLang);
			oResult.sContent = oResult.sContent.replace(CommonUtil.RegularExpression.NEW_PHASE, sAttribute);
		}
		if (sKey === "STATUS") {
			var oHistoryInfo = CommonUtil.splitIdeaStatusHistoryObjectInfo(oHQ, oNotification, sLang);
			if (aNotificationsSettings.OT_STATUS_MODEL_TRAN && aNotificationsSettings.OT_STATUS_MODEL_TRAN.length > 0 && oHistoryInfo &&
				oHistoryInfo.TRANSITION_CODE) {
				var aStatusTran = _.filter(aNotificationsSettings.OT_STATUS_MODEL_TRAN, function(oStatusTran) {
					return oStatusTran.CODE === oHistoryInfo.TRANSITION_CODE;
				});
				if (aStatusTran && aStatusTran.length > 0) {
					sAttribute = aStatusTran[0].NEXT_STATUS_CODE;
				}
			}
			sAttribute = CommonUtil.getCodeText(sAttribute, "t_status", sLang);
			oResult.sContent = oResult.sContent.replace(CommonUtil.RegularExpression.NEW_STATUS, sAttribute);
		}
		if (sKey === 'SHORT_DESC' && oNotification.ACTION_CODE === 'SUBMIT_IDEA') {
			oResult.sContent = oResult.sContent.replace(CommonUtil.RegularExpression.CONTENT, sAttribute);
		}
		oResult.sContent = oResult.sContent.replace(CommonUtil.RegularExpression[sKey], sAttribute);
	});
}

function _replaceCoach(oHQ, oIdea, oResult) {
	if (oIdea && oIdea.COACH_ID && oResult.sContent && oResult.sContent.indexOf("{{COACH_") > -1) {
		CommonUtil.replacePlaceHolder(oResult, CommonUtil.getIdentity(oHQ, oIdea.COACH_ID), "COACH_");
	} else if (oResult.sContent) {
		CommonUtil.replacePlaceHolder(oResult, {
			"NAME": "",
			"FIRST_NAME": "",
			"LAST_NAME": "",
			"PHONE": "",
			"MOBILE": "",
			"EMAIL": ""
		}, "COACH_");
	}
}

function _replaceActor(oHQ, oNotification, oResult) {
	if (oResult.sContent && oResult.sContent.indexOf("{{ACTOR_") > -1) {
		if (oNotification.ACTOR_ID === 0 && oNotification.ACTION_CODE === 'APPROVAL_LETTER_FOR_REGISTRATION') {
			var sTitle = SystemSettings.getValue('sap.ino.config.APPLICATION_TITLE', oHQ);
			CommonUtil.replacePlaceHolder(oResult, {
				NAME: sTitle,
				FIRST_NAME: sTitle,
				LAST_NAME: sTitle
			}, "ACTOR_");
		} else {
			CommonUtil.replacePlaceHolder(oResult, CommonUtil.getIdentity(oHQ, oNotification.ACTOR_ID), "ACTOR_");
		}
	}
}

function _replaceAuthor(oHQ, oNotification, oIdea, oResult, sLang) {
	NotificationPlaceholderAuthorProcesser.process(oHQ, oNotification, oResult, oIdea, sLang);
}

function _replaceRecipient(oHQ, oNotification, oResult) {
	if (oResult.sContent && oResult.sContent.indexOf("{{RECIPIENT_") > -1) {
		CommonUtil.replacePlaceHolder(oResult, CommonUtil.getIdentity(oHQ, oNotification.USER_ID), "RECIPIENT_");
	}
}

function _replaceSpecailPlaceHolder(oHQ, oNotification, oResult, sLang) {
	if (oResult.sContent && NotificationPlaceholderSpecialProcesser.hasOwnProperty(oNotification.ACTION_CODE)) {
		NotificationPlaceholderSpecialProcesser[oNotification.ACTION_CODE](oHQ, oNotification, oResult, sLang);
	}
}

function _replaceContent(oHQ, oNotification, aNotificationsSettings, aCampDatas, oResult, sLang) {
	if (!oResult.sContent) {
		return;
	}
	_replaceSpecailPlaceHolder(oHQ, oNotification, oResult);
	_replaceCampaignData(oHQ, _.find(aCampDatas, function(oCampaign) {
		return oNotification.CAMPAIGN_ID === oCampaign.ID;
	}), oResult, oNotification);
	var oIdea = CommonUtil.getIdeaData(oHQ, _getIdeaId(oNotification));
	_replaceIdeaData(oHQ, oNotification, aNotificationsSettings, oIdea, oResult, sLang);
	_replaceAuthor(oHQ, oNotification, oIdea, oResult, sLang);
	_replaceActor(oHQ, oNotification, oResult);
	_replaceRecipient(oHQ, oNotification, oResult);
	_replaceCoach(oHQ, oIdea, oResult);
}

//getData
//should return an object like this:
// return {
// 		sContent: ""
// 	};
function getData(oHQ, sTemplateTxtData, oNotification, aNotificationsSettings, aCampDatas, sLang) {
	var oResult = {
		sContent: sTemplateTxtData
	};
	_replaceContent(oHQ, oNotification, aNotificationsSettings, aCampDatas, oResult, sLang);
	return oResult;
}

function replaceUser(oHQ, iUserId, sContent, sPrefix) {
	var sResult = sContent;
	_.each(CommonUtil.getIdentity(oHQ, iUserId), function(sAttribute, sKey) {
		sResult = sResult.replace(CommonUtil.RegularExpression[sPrefix + sKey], sAttribute);
	});
	return sResult;
}