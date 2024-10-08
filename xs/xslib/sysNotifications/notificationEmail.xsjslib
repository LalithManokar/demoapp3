const Message = $.import("sap.ino.xs.aof.lib", "message");
const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const Mail = $.import("sap.ino.xs.xslib", "mail");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const Notification = $.import("sap.ino.xs.xslib.sysNotifications", "notification");
const Attachments = $.import("sap.ino.xs.xslib", "attachment_repository");
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn);
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var RegularExpression = {
	IDEA_ID: new RegExp("{{IDEA_ID}}", "g"),
	IDEA_NAME: new RegExp("{{IDEA_NAME}}", "g"),
	PHASE_CODE: new RegExp("{{PHASE_CODE}}", "g"),
	STATUS_CODE: new RegExp("{{STATUS_CODE}}", "g"),
	CAMPAIGN_TITLE_IMAGE: new RegExp("{{CAMPAIGN_TITLE_IMAGE}}", "g"),
	CAMPAIGN_TITLE_IMAGE_CID: new RegExp("cid:CAMPAIGN_TITLE_IMAGE", "g"),
	CAMPAIGN_NAME: new RegExp("{{CAMPAIGN_NAME}}", "g"),
	CAMPAIGN_ID: new RegExp("{{CAMPAIGN_ID}}", "g"),
	CAMPAIGN_COLOR: new RegExp("{{CAMPAIGN_COLOR}}", "g"),
	CAMPAIGN_COLOR_SMALL: new RegExp("{{campaign_color}}", "g"),
	HOST_PORT: new RegExp("{{HOST_PORT}}", "g"),
	COACH_NAME: new RegExp("{{COACH_NAME}}", "g"),
	COACH_FIRST_NAME: new RegExp("{{COACH_FIRST_NAME}}", "g"),
	COACH_LAST_NAME: new RegExp("{{COACH_LAST_NAME}}", "g"),
	COACH_PHONE: new RegExp("{{COACH_PHONE}}", "g"),
	COACH_MOBILE: new RegExp("{{COACH_MOBILE}}", "g"),
	COACH_EMAIL: new RegExp("{{COACH_EMAIL}}", "g"),
	AUTHOR_NAME: new RegExp("{{AUTHOR_NAME}}", "g"),
	AUTHOR_FIRST_NAME: new RegExp("{{AUTHOR_FIRST_NAME}}", "g"),
	AUTHOR_LAST_NAME: new RegExp("{{AUTHOR_LAST_NAME}}", "g"),
	ACTOR_NAME: new RegExp("{{ACTOR_NAME}}", "g"),
	ACTOR_FIRST_NAME: new RegExp("{{ACTOR_FIRST_NAME}}", "g"),
	ACTOR_LAST_NAME: new RegExp("{{ACTOR_LAST_NAME}}", "g"),
	ACTOR_PHONE: new RegExp("{{ACTOR_PHONE}}", "g"),
	ACTOR_MOBILE: new RegExp("{{ACTOR_MOBILE}}", "g"),
	ACTOR_EMAIL: new RegExp("{{ACTOR_EMAIL}}", "g"),
	RECIPIENT_NAME: new RegExp("{{RECIPIENT_NAME}}", "g"),
	RECIPIENT_FIRST_NAME: new RegExp("{{RECIPIENT_FIRST_NAME}}", "g"),
	RECIPIENT_LAST_NAME: new RegExp("{{RECIPIENT_LAST_NAME}}", "g"),
	RECIPIENT_PHONE: new RegExp("{{RECIPIENT_PHONE}}", "g"),
	RECIPIENT_MOBILE: new RegExp("{{RECIPIENT_MOBILE}}", "g"),
	RECIPIENT_EMAIL: new RegExp("{{RECIPIENT_EMAIL}}", "g"),
	DECISION_REASON: new RegExp("{{DECISION_REASON}}", "g"),
	DECISION_REFERENCE_URL: new RegExp("{{DECISION_REFERENCE_URL}}", "g"),
	DECISION_REFERENCE_LABEL: new RegExp("{{DECISION_REFERENCE_LABEL}}", "g"),
	USER_NAME: new RegExp("{{USER_NAME}}", "g"),
	CONTENT: new RegExp("{{CONTENT}}", "g")
};

//cache for Repository Images
var Images;
var Host;
var bEnableNewNotification = CommonUtil.getSystemSetting(oHQ, "sap.ino.config.ENABLE_NEW_NOTIFICATION");
function setHost(sHost) {
	Host = sHost;
}

var getHost = _.memoize(function(oHQ, bExternal) {
	if (Host) {
		return Host;
	}

	if (bExternal) {
		var sExternalHost = SystemSettings.getIniValue("host_external", oHQ);
		if (sExternalHost) {
			return sExternalHost;
		} else {
			return getHost(oHQ, false);
		}
	}
	return SystemSettings.getIniValue("host", oHQ);
}, function(oHQ, bExternal) {
	return bExternal;
});

var getFrontofficeUrl = _.memoize(function(oHQ, bExternal) {
	var sResult;
	if (bExternal) {
		sResult = SystemSettings.getValue("sap.ino.config.URL_PATH_UI_FRONTOFFICE", oHQ) + '/';
		if (!sResult) {
			return sResult;
		}
		return getHost(oHQ, true) + "/" + sResult;
	} else {
		sResult = SystemSettings.getValue("sap.ino.config.URL_PATH_UI_FRONTOFFICE", oHQ) + '/';
		if (!sResult) {
			return sResult;
		}
		return getHost(oHQ, false) + "/" + sResult;
	}
}, function(oHQ, bExternal) {
	return bExternal;
});

function getObjectUrl(bExternal, sType, sId, sNotificationCode, oHQ) {
	var sUrl = getFrontofficeUrl(oHQ, bExternal);
	if (sUrl === null) {
		return null;
	}
	if (sType === "IDEA") {
		if (sNotificationCode === "COMMENT_CREATED" || sNotificationCode === "COMMENT_DELETED") {
			sUrl = sUrl + "#idea/" + sId + "?section=sectionComments";
		} else if (sNotificationCode === "EXPERT_ASSIGNED" || sNotificationCode === "EXPERT_UNASSIGNED") {
			sUrl = sUrl + "#idea/" + sId + "?section=sectionExperts";
		} else if (sNotificationCode === "STATUS_ACTION_sap.ino.config.EVAL_SUBMIT" || sNotificationCode ===
			"STATUS_ACTION_sap.ino.config.EVAL_PUB_SUBMITTER" || sNotificationCode === "STATUS_ACTION_sap.ino.config.EVAL_PUB_COMMUNITY") {
			sUrl = sUrl + "#idea/" + sId + "?section=sectionEvaluations";
		} else {
			sUrl = sUrl + "#idea/" + sId;
		}
		return sUrl;
	} else if (sType === "CAMPAIGN") {
		return sUrl + "#campaign/" + sId;
	} else if (sType === "EVAL_REQUEST") {
		return sUrl + "#/evaluationrequest-display/" + sId;
	} else if (sType === "EVAL_REQUEST_ITEM") {
		return sUrl + "#/evaluationrequest-item/" + sId;
	}
	if (sType === "REGISTRATION_REQUEST") {
		return sUrl + "#/register-pending";
	}
	return sUrl;
}

var getIdeaData = _.memoize(function(oHQ, iIdeaId) {
	var sStatement =
		"select idea.id as idea_id, idea.name as idea_name, idea.phase as phase_code, idea.status as status_code, " +
		"idea.campaign_id, idea.coach_id, " +
		"idea.created_by_id as author_id " +
		"from \"sap.ino.db.idea::v_idea_medium\" as idea " +
		"where idea.id = ?";

	var aResult = oHQ.statement(sStatement).execute(iIdeaId);
	if (aResult.length === 0) {
		return {};
	}

	return aResult[0];
}, function(oHQ, iIdeaID) {
	return iIdeaID;
});

function getReasonText(oHQ, sReasoncode) {
	var sStatement =
		"select default_text as default_text from \"sap.ino.db.basis::t_value_option\" where code  = ?";
	var aResult = oHQ.statement(sStatement).execute(sReasoncode);
	if (aResult.length === 0) {
		return "";
	}
	return aResult[0].DEFAULT_TEXT;
}

var getIdentity = _.memoize(function(oHQ, iIdentityID) {
	var sIdentityStatement = "select first_name, last_name, name, phone, mobile, email from \"sap.ino.db.iam::t_identity\" where id = ?";
	return oHQ.statement(sIdentityStatement).execute(iIdentityID)[0];
}, function(oHQ, iIdentityID) {
	return iIdentityID;
});

var getTemplateData = _.memoize(function(sTemplateCode, sLang) {
	var sTemplateData = "{{CONTENT}}";
	if (sTemplateCode) {
		sTemplateData = TextBundle.getTextBundleObject(
			"\"sap.ino.db.notification::t_mail_template_t\"", "MAIL_TEMPLATE_CODE", "TEMPLATE", "LANG", sLang, sTemplateCode
		);
		if (!sTemplateData || sTemplateData.length <= 0 || !sTemplateData[0]) {
			return "{{CONTENT}}";
		}
		sTemplateData = sTemplateData[0].CONTENT;
		if (typeof sTemplateData !== "string") {
			sTemplateData = $.util.stringify(sTemplateData);
		}
	}
	return sTemplateData;
});

var getTextTemplateData = _.memoize(function(sTxtCode, sLang) {
	var sTxtTemplateData = "{{CONTENT}}";
	if (sTxtCode) {
		sTxtTemplateData = TextBundle.getTextBundleObject(
			"\"sap.ino.db.basis::t_text_module_t\"", "TEXT_MODULE_CODE", "TEXT_MODULE", "LANG", sLang, sTxtCode
		);
		if (!sTxtTemplateData || sTxtTemplateData.length <= 0 || !sTxtTemplateData[0] || !sTxtTemplateData[0].CONTENT) {
		    return "{{CONTENT}}";
		}
		sTxtTemplateData = sTxtTemplateData[0].CONTENT;
		if (typeof sTxtTemplateData !== "string") {
			sTxtTemplateData = $.util.stringify(sTxtTemplateData);
		}
	}
	return sTxtTemplateData;
});

var getCampaignName = _.memoize(function(oHQ, iCampaignID, sLang) {
    if(iCampaignID === undefined){
        return undefined;
    }
	var aCampaignNames = TextBundle.getTextBundleObject(
		"\"sap.ino.db.campaign::t_campaign_t\"", "CAMPAIGN_ID", "NAME", "LANG", sLang, iCampaignID);
	if (aCampaignNames.length === 0) {
		return iCampaignID;
	}
	var sCampaignName = aCampaignNames[0].CONTENT;
	if (typeof sCampaignName !== "string") {
		sCampaignName = $.util.stringify(sCampaignName);
	}
	return sCampaignName;
}, function(oHQ, iCampaignID, sLang) {
	return iCampaignID + "-" + sLang;
});

var getCampaignData = _.memoize(function(oHQ, iCampaignID) {
	var oCampaign = {
		ID: iCampaignID,
		COLOR: "#FFFFFF"
	};

	if (iCampaignID) {
		var sStatement =
			"select campaign.color_code, campaign.mail_template_code, campaign.mail_success_code, " +
			"campaign.mail_rejection_code, campaign.mail_phase_change_code, attachment.attachment_id as image, campaign.mail_notification_summary_code " +
			"from \"sap.ino.db.campaign::t_campaign\" as campaign " +
			"left outer join \"sap.ino.db.attachment::t_attachment_assignment\" as attachment " +
			"on attachment.owner_id = campaign.id and " +
			"attachment.owner_type_code = 'CAMPAIGN' and " +
			"attachment.role_type_code = 'CAMPAIGN_DETAIL_IMG' " +
			"where campaign.id = ?";

		var aResult = oHQ.statement(sStatement).execute(iCampaignID);

		if (aResult.length === 0) {
			oCampaign.COLOR = "#FFFFFF";
		} else {
			oCampaign.COLOR = "#" + aResult[0].COLOR_CODE;
			oCampaign.IMAGE = aResult[0].IMAGE;
			oCampaign.MAIL_TEMPLATE_CODE = aResult[0].MAIL_TEMPLATE_CODE;
			oCampaign.MAIL_SUCCESS_CODE = aResult[0].MAIL_SUCCESS_CODE;
			oCampaign.MAIL_REJECTION_CODE = aResult[0].MAIL_REJECTION_CODE;
			oCampaign.MAIL_PHASE_CHANGE_CODE = aResult[0].MAIL_PHASE_CHANGE_CODE;
			oCampaign.MAIL_NOTIFICATION_SUMMARY_CODE = aResult[0].MAIL_NOTIFICATION_SUMMARY_CODE;
		}
	}

	return oCampaign;
}, function(oHQ, iCampaignID, sLang, bCeckAuth) {
	return iCampaignID + "-" + sLang + "-" + bCeckAuth;
});

var getImage = _.memoize(function(oHQ, sCID, iCampaignID) {
	var oImage = {
		CID: sCID
	};
	if (sCID === "CAMPAIGN_TITLE_IMAGE") {
		var iImageId = getCampaignData(oHQ, iCampaignID, false).IMAGE;
		if (!iImageId) {
			return undefined;
		}
		var sRepositoryStatement =
			"select " +
			"attachment.file_name, attachment.media_type, data.data " +
			"from \"sap.ino.db.attachment::t_attachment\" as attachment " +
			"inner join \"sap.ino.db.attachment::t_attachment_data\" as data " +
			"on attachment.id = data.id and attachment.id = ?";
		var aRepositoryResult = oHQ.statement(sRepositoryStatement).execute(iImageId);
		if (aRepositoryResult.length === 0) {
			return undefined;
		} else {
			oImage.MEDIA_TYPE = aRepositoryResult[0].MEDIA_TYPE;
			oImage.FILE_NAME = aRepositoryResult[0].FILE_NAME + "." + oImage.MEDIA_TYPE.split("/")[1];
			oImage.DATA = aRepositoryResult[0].DATA;
		}
	} else {
		var sStatement =
			"select " +
			"package_id as package, file_name, media_type " +
			"from " +
			"\"sap.ino.db.attachment::v_repository_attachment\"" +
			"where upper(file_name) = ?";

		var aResult = oHQ.statement(sStatement).execute(sCID);
		if (!aResult || aResult.length === 0) {
			oImage.DATA = undefined;
			return oImage;
		}
		oImage.MEDIA_TYPE = aResult[0].MEDIA_TYPE;
		oImage.FILE_NAME = aResult[0].FILE_NAME + "." + oImage.MEDIA_TYPE.split("/")[1];

		try {
			oImage.DATA = Attachments.readAttachment(aResult[0].PACKAGE,
				aResult[0].FILE_NAME,
				aResult[0].MEDIA_TYPE,
				oHQ);
		} catch (e) {
			oImage.DATA = undefined;
		}
	}

	return oImage;
}, function(oHQ, sCID, iCampaignID) {
	return sCID + "-" + iCampaignID;
});

var getCodeText = _.memoize(function(sPhaseCode, sCodeType, sLang) {
	var aPhaseText = TextBundle.getExtensibleTextBundleObject(sCodeType, sLang, sPhaseCode);
	if (aPhaseText.length > 0) {
		return aPhaseText[0].CONTENT;
	} else {
		return sPhaseCode;
	}
});

function replaceCID(oHQ, sTemplate, iCampaignID) {
	if (sTemplate.search("{{CAMPAIGN_TITLE_IMAGE}}") !== -1 ||
		sTemplate.search("cid:CAMPAIGN_TITLE_IMAGE") !== -1) {
		var sAttachmentStatement = "select value from \"sap.ino.db.basis::t_system_setting\" where code = ?";
		var aResult = oHQ.statement(sAttachmentStatement).execute("sap.ino.config.URL_PATH_XS_ATTACHMENT_DOWNLOAD");

		if (aResult.length > 0 && iCampaignID) {
			var sCampaignImage = getCampaignData(oHQ, iCampaignID).IMAGE;
			var sImageURL = getHost(oHQ) + "/" + aResult[0].VALUE + "/" + sCampaignImage;
			sTemplate = sTemplate.replace(RegularExpression.CAMPAIGN_TITLE_IMAGE, sImageURL);
			sTemplate = sTemplate.replace(RegularExpression.CAMPAIGN_TITLE_IMAGE_CID, sImageURL);
		}else{
			sTemplate = sTemplate.replace(RegularExpression.CAMPAIGN_TITLE_IMAGE, "");
			sTemplate = sTemplate.replace(RegularExpression.CAMPAIGN_TITLE_IMAGE_CID, "");
		}
	}

	if (!Images) {
		var sStatement =
			"select " +
			"upper(file_name) as cid, path " +
			"from " +
			"\"sap.ino.db.attachment::v_repository_attachment\"";

		Images = oHQ.statement(sStatement).execute();
	}

	var sHost = getHost(oHQ) + "/";
	_.each(Images, function(oImage) {
		var sCID = "cid:" + oImage.CID;
		var oRegExp = new RegExp(sCID, "g");
		sTemplate = sTemplate.replace(oRegExp, sHost + oImage.PATH);
	});
	return sTemplate;
}

function replaceCampaignData(oHQ, sTemplate, iCampaignID, sLang) {
	var oCampaign = getCampaignData(oHQ, iCampaignID);
	if (oCampaign.COLOR) {
		sTemplate = sTemplate.replace(RegularExpression.CAMPAIGN_ID, oCampaign.ID);
		sTemplate = sTemplate.replace(RegularExpression.CAMPAIGN_COLOR, oCampaign.COLOR);
		sTemplate = sTemplate.replace(RegularExpression.CAMPAIGN_COLOR_SMALL, oCampaign.COLOR);
	}
	var sCampaignName = getCampaignName(oHQ, iCampaignID, sLang);
	if (sCampaignName) {
		sTemplate = sTemplate.replace(RegularExpression.CAMPAIGN_NAME, encodeHtml(sCampaignName));
	}
	return sTemplate;
}

function createTemplateMail(oHQ, iIdeaId, sAction, iDecider,iActorId, iRecipientId, sLang, sContent, sPhase, sStatus,sReasonText) {
	var oIdea = getIdeaData(oHQ, iIdeaId, true);
	iRecipientId = iRecipientId || oIdea.AUTHOR_ID;

	var oTemplates = getCampaignData(oHQ, oIdea.CAMPAIGN_ID);
	var sTemplate = getTemplateData(oTemplates.MAIL_TEMPLATE_CODE, sLang);
	
	if (sReasonText === null || sReasonText === undefined) {
		sReasonText = '';
	}

	//ensure that the content does not contain HTML
	if (sContent) {
		sContent = _.stripTags(sContent);
		sContent = sContent.replace(/&#xa;/g, "<br />").replace(/\n/g, "<br />");
	}

	var sMailTextCode;
	if (sAction === "sap.ino.config.START_NEXT_PHASE" ||
		sAction === "STATUS_ACTION_sap.ino.config.START_NEXT_PHASE") {
		sMailTextCode = "MAIL_PHASE_CHANGE_CODE";
	} else if (sAction === "sap.ino.config.COMPLETE" ||
		sAction === "STATUS_ACTION_sap.ino.config.COMPLETE") {
		sMailTextCode = "MAIL_SUCCESS_CODE";
	} else if (sAction === "sap.ino.config.DISCONTINUE" ||
		sAction === "STATUS_ACTION_sap.ino.config.DISCONTINUE") {
		sMailTextCode = "MAIL_REJECTION_CODE";
	}
	var sText = getTextTemplateData(oTemplates[sMailTextCode], sLang);
	
	if (bEnableNewNotification && Number(bEnableNewNotification) > 0 && sText !== '{{CONTENT}}') {
        var sRoleCode = "AUTHOR";
        var sActionCode = "CHANGE_STATUS";
		sText = replaceNewNotificationTextModule(sText,sRoleCode,sActionCode);
    }

    sText = sText.replace(/{{CONTENT}}/g, sContent);
	sTemplate = sTemplate.replace("{{CONTENT}}", sText);

	_.each(oIdea, function(sAttribute, sKey) {
		if (sKey === "IDEA_NAME") {
			sAttribute = encodeHtml(sAttribute);
		}
		sTemplate = sTemplate.replace(RegularExpression[sKey], sAttribute);
	});
	_.each(getIdentity(oHQ, iActorId), function(sAttribute, sKey) {
		sTemplate = sTemplate.replace(RegularExpression["ACTOR_" + sKey], sAttribute);
	});
	_.each(getIdentity(oHQ, iRecipientId), function(sAttribute, sKey) {
		sTemplate = sTemplate.replace(RegularExpression["RECIPIENT_" + sKey], sAttribute);
	});
	if (oIdea.COACH_ID) {
		_.each(getIdentity(oHQ, oIdea.COACH_ID), function(sAttribute, sKey) {
			sTemplate = sTemplate.replace(RegularExpression["COACH_" + sKey], sAttribute);
		});
	} else {
		sTemplate = sTemplate.replace(RegularExpression.COACH_NAME, "");
		sTemplate = sTemplate.replace(RegularExpression.COACH_FIRST_NAME, "");
		sTemplate = sTemplate.replace(RegularExpression.COACH_LAST_NAME, "");
		sTemplate = sTemplate.replace(RegularExpression.COACH_PHONE, "");
		sTemplate = sTemplate.replace(RegularExpression.COACH_MOBILE, "");
		sTemplate = sTemplate.replace(RegularExpression.COACH_EMAIL, "");
	}
	sTemplate = sTemplate.replace(RegularExpression.HOST_PORT, getHost());
	
	if (bEnableNewNotification && Number(bEnableNewNotification) > 0) {
		sTemplate = sTemplate.replace(new RegExp("{{PHASE}}", "g"), getCodeText(sPhase, "t_phase", sLang));
		sTemplate = sTemplate.replace(new RegExp("{{PREVIOUS_STATUS}}", "g"), getCodeText(oIdea.STATUS_CODE, "t_phase", sLang));
		sTemplate = sTemplate.replace(new RegExp("{{NEW_STATUS}}", "g"), getCodeText(sStatus, "t_phase", sLang));
        sTemplate = sTemplate.replace(/{{DECISION_AUTHOR_COMMENT}}/g, sContent || "");
        sTemplate = sTemplate.replace(/{{DECISION_REASON_COMMENT}}/g, (sReasonText || "").replace(/&#xa;/g, "<br />"));
		_.each(getIdentity(oHQ, iDecider), function(sAttribute, sKey) {
			if (sKey === "NAME") {
				sTemplate = sTemplate.replace(/{{DECISION_MAKER}}/g, sAttribute);
			}
		});
	}else{
		sPhase = sPhase || oIdea.PHASE_CODE;
		sStatus = sStatus || oIdea.STATUS_CODE;
		sTemplate = sTemplate.replace(new RegExp("{{IDEA_PHASE}}", "g"), getCodeText(sPhase, "t_phase", sLang));
		sTemplate = sTemplate.replace(new RegExp("{{IDEA_STATUS}}", "g"), getCodeText(sStatus, "t_status", sLang));
	}

	sTemplate = replaceCampaignData(oHQ, sTemplate, oIdea.CAMPAIGN_ID, sLang);

	return sTemplate;
}

function createTemplateTextMail(oHQ, iIdeaId, sAction, iDecider,iActorId, iRecipientId, sLang, sContent,
	sPhase, sStatus, sTextcode, sReasoncode, sReasonText, sLabel, sURL) {
	var oIdea = getIdeaData(oHQ, iIdeaId, true);
	var sReason;
	iRecipientId = iRecipientId || oIdea.AUTHOR_ID;

	var oTemplates = getCampaignData(oHQ, oIdea.CAMPAIGN_ID);
	var sTemplate = getTemplateData(oTemplates.MAIL_TEMPLATE_CODE, sLang);

	if (sLabel === null) {
		sLabel = '';
	}
	if (sURL === null) {
		sURL = '';
	}
	if (sReasonText === null) {
		sReasonText = '';
	}
	//ensure that the content does not contain HTML
	if (sContent) {
		sContent = _.stripTags(sContent);
		sContent = sContent.replace(/&#xa;/g, "<br />");
	}
	var sText = getTextTemplateData(sTextcode, sLang);
	
	
	if (bEnableNewNotification && Number(bEnableNewNotification) > 0) {
        var sRoleCode = "AUTHOR";
        var sActionCode = "CHANGE_STATUS";
		sText = replaceNewNotificationTextModule(sText,sRoleCode,sActionCode);
	}
	
	sText = sText.replace(/{{CONTENT}}/g, sContent);
	sTemplate = sTemplate.replace(/{{CONTENT}}/g, sText);

	if (!sLabel && sURL) {
		sTemplate = sTemplate.replace(/{{DECISION_REFERENCE_LABEL}}/g, sURL);
	} else {
		sTemplate = sTemplate.replace(/{{DECISION_REFERENCE_LABEL}}/g, sLabel);
	}

	if (sReasoncode) {
		sReason = getReasonText(oHQ, sReasoncode);

	}

	_.each(oIdea, function(sAttribute, sKey) {
		if (sKey === "IDEA_NAME") {
			sAttribute = encodeHtml(sAttribute);
		}
		sTemplate = sTemplate.replace(RegularExpression[sKey], sAttribute);
	});

	_.each(getIdentity(oHQ, oIdea.AUTHOR_ID), function(sAttribute, sKey) {
		sTemplate = sTemplate.replace(RegularExpression["AUTHOR_" + sKey], sAttribute);
	});
	
	_.each(getIdentity(oHQ, iActorId), function(sAttribute, sKey) {
		sTemplate = sTemplate.replace(RegularExpression["ACTOR_" + sKey], sAttribute);
	});

	_.each(getIdentity(oHQ, iRecipientId), function(sAttribute, sKey) {
		sTemplate = sTemplate.replace(RegularExpression["RECIPIENT_" + sKey], sAttribute);
	});

	if (oIdea.COACH_ID) {
		_.each(getIdentity(oHQ, oIdea.COACH_ID), function(sAttribute, sKey) {
			sTemplate = sTemplate.replace(RegularExpression["COACH_" + sKey], sAttribute);
		});
	} else {
		sTemplate = sTemplate.replace(RegularExpression.COACH_NAME, "");
		sTemplate = sTemplate.replace(RegularExpression.COACH_FIRST_NAME, "");
		sTemplate = sTemplate.replace(RegularExpression.COACH_LAST_NAME, "");
		sTemplate = sTemplate.replace(RegularExpression.COACH_PHONE, "");
		sTemplate = sTemplate.replace(RegularExpression.COACH_MOBILE, "");
		sTemplate = sTemplate.replace(RegularExpression.COACH_EMAIL, "");
	}
	sTemplate = sTemplate.replace(RegularExpression.HOST_PORT, getHost());

	sTemplate = sTemplate.replace(new RegExp("{{STATUS}}", "g"), getCodeText(sStatus, "t_status", sLang));
	if (bEnableNewNotification && Number(bEnableNewNotification) > 0) {
		sTemplate = sTemplate.replace(new RegExp("{{PHASE}}", "g"), getCodeText(sPhase, "t_phase", sLang));
		sTemplate = sTemplate.replace(new RegExp("{{PREVIOUS_STATUS}}", "g"), getCodeText(oIdea.STATUS_CODE, "t_phase", sLang));
		sTemplate = sTemplate.replace(new RegExp("{{NEW_STATUS}}", "g"), getCodeText(sStatus, "t_status", sLang));
		sTemplate = sTemplate.replace(/{{DECISION_CHANGE_REASON}}/g, sReason || "");
		sTemplate = sTemplate.replace(/{{DECISION_AUTHOR_COMMENT}}/g, sContent || "");
		_.each(getIdentity(oHQ, iDecider), function(sAttribute, sKey) {
			if (sKey === "NAME") {
				sTemplate = sTemplate.replace(/{{DECISION_MAKER}}/g, sAttribute);
			}
			
		});
		sTemplate = sTemplate.replace(/{{DECISION_REASON_COMMENT}}/g, (sReasonText || "").replace(/&#xa;/g, "<br />"));
		sTemplate = sTemplate.replace(/{{DECISION_REFERENCE_URL}}/g, sURL);

	}else{
		sTemplate = sTemplate.replace(/{{DECISION_REFERENCE_LINK}}/g, sURL);
		sTemplate = sTemplate.replace(/{{DECISION_REASON}}/g, sReason || "");
		sTemplate = sTemplate.replace(/{{DECISION_REASONTEXT}}/g, (sReasonText || "").replace(/&#xa;/g, "<br />"));
		sPhase = sPhase || oIdea.PHASE_CODE;
		sStatus = sStatus || oIdea.STATUS_CODE;
		sTemplate = sTemplate.replace(new RegExp("{{IDEA_PHASE}}", "g"), getCodeText(sPhase, "t_phase", sLang));
		sTemplate = sTemplate.replace(new RegExp("{{IDEA_STATUS}}", "g"), getCodeText(sStatus, "t_status", sLang));
	}

	sTemplate = replaceCampaignData(oHQ, sTemplate, oIdea.CAMPAIGN_ID, sLang);

	return sTemplate;
}

function encodeHtml(str) {
	if (!str) {
		return "";
	}
	return str.replace(/[\x00-\x2b\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\xff\u2028\u2029]/g, fnEncodeHtml);
}

function fnEncodeHtml(char) {
	var mHtmlLookup = {
		"<": "&lt;",
		">": "&gt;",
		"&": "&amp;",
		"\"": "&quot;"
	};
	var sEncoded = mHtmlLookup[char];
	if (!sEncoded) {
		return char;
	}
	return sEncoded;
}
//------------------------------------------------------------------------------------
//                  functions to send mails
//------------------------------------------------------------------------------------

function sendNotificationMail(oHQ, sContent, oCurrentData, oSentNotifications, sProcedureName, sEmailSubject) {
	sContent = sContent.replace(RegularExpression.CAMPAIGN_TITLE_IMAGE, "cid:CAMPAIGN_TITLE_IMAGE");

	//use callback of replace to simulate a matchAll
	var aImages = [];
	var oRegex = /src="cid:([^\/:*?\"<>|]+)"/g;
	if (oCurrentData.CAMPAIGN_ID && !isNaN(Number(oCurrentData.CAMPAIGN_ID))) {
		sContent.replace(oRegex, function() {
			var oImage = getImage(oHQ, arguments[1], oCurrentData.CAMPAIGN_ID);
			if (oImage) {
				aImages.push(oImage);
			}
		});
	}

	sContent = "<html><body>" + sContent + "</html></body>";

	try {
		Mail.send(oCurrentData.EMAIL,
			sEmailSubject || TextBundle.getText("messages", "MSG_NOTIFICATION_SUBJECT", null, oCurrentData.LOCALE),
			sContent, undefined, aImages);
		oSentNotifications.IV_STATUS = 'SENT';
	} catch (e) {
		oSentNotifications.IV_STATUS = 'ERROR';
	} finally {
		oHQ.procedure("SAP_INO", sProcedureName || "sap.ino.db.notification::p_notification_email_status_update").execute(oSentNotifications);
	}

	oHQ.getConnection().commit();
}

function sendScheduledNotificationMail(oHQ, sContent, oCurrentData, oSentNotifications) {
	sContent = "<html><body>" + sContent + "</html></body>";
	try {
		Mail.send(oCurrentData.EMAIL, TextBundle.getText("messages", "MSG_NOTIFICATION_SUBJECT", null, oCurrentData.LOCALE), sContent, undefined,
			undefined);
		oSentNotifications.IV_STATUS = 'SENT';
	} catch (e) {
		oSentNotifications.IV_STATUS = 'ERROR';
	} finally {
		oHQ.procedure("SAP_INO", "sap.ino.db.notification::p_notification_email_scheduled_status_update").execute(oSentNotifications);
	}
	oHQ.getConnection().commit();
}

function handleSingleNotification(oHQ, oNotification) {
	// this method is used for sending decision  email. first check if customized model is used 
	var sContent = "";
	var sDecider = "";
	var sURL = "";
	var sLabel = "";
	var sTextcode = "";
	var sReasonText = "";
	var sReasoncode = "";
	var sMailText;
	var aResponse = oNotification.RESPONSE.split("_DECIDER_ID_");
	if (aResponse.length > 1) {
		sContent = (aResponse[1] || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	} else {
		sContent = (oNotification.RESPONSE || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	aResponse = aResponse[0].split("_INO_LINK_URL_");
	if (aResponse.length > 1) {
		sDecider = aResponse[1];
	}
	aResponse = aResponse[0].split("_INO_LINK_LABEL_");
	if (aResponse.length > 1) {
		sURL = aResponse[1];
	}
	aResponse = aResponse[0].split("_INO_REASON_TEXT_");
	if (aResponse.length > 1) {
		sLabel = aResponse[1];
	}
	aResponse = aResponse[0].split("_INO_REASON_CODE_");
	if (aResponse.length > 1) {
		sReasonText = (aResponse[1] || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	aResponse = aResponse[0].split("_INO_TEXT_CODE_");
	if (aResponse.length > 1) {
		sReasoncode = aResponse[1];
		sTextcode = aResponse[0];
	}

	if (sTextcode || sReasoncode || sLabel || sURL) {
		//oHQ, iIdeaId, sAction,
		//sDecider, iActorId, iRecipientId, sLang, sContent, 
		//sPhase, sStatus, sTextcode, sReasoncode, sReasonText,sLabel, sURL
		sMailText = createTemplateTextMail(oHQ, oNotification.OBJECT_ID, oNotification.NOTIFICATION_CODE,
			sDecider, oNotification.ACTOR_ID, oNotification.USER_ID, oNotification.LOCALE, (sContent || "").replace(/\n/g, "&#xa;"),
			null, null, sTextcode, sReasoncode, (sReasonText || "").replace(/\n/g, "&#xa;"), sLabel, sURL);
	} else {
	   // oHQ, iIdeaId, sAction, iDecider,iActorId, iRecipientId, sLang, sContent, sPhase, sStatus,sReasonText
		sMailText = createTemplateMail(oHQ, oNotification.OBJECT_ID, oNotification.NOTIFICATION_CODE, sDecider,
			oNotification.ACTOR_ID, oNotification.USER_ID, oNotification.LOCALE, sContent);
	}

	var oSentNotifications = {
		IT_NOTIFICATION_STATUS_IDS: [{
			"ID": oNotification.ID
		}]
	};
	sendNotificationMail(oHQ, sMailText, oNotification, oSentNotifications,
		"sap.ino.db.notification::p_notification_email_scheduled_status_update");
}

function handleBundleNotification(oHQ, sContent, oCurrentData, oSentNotifications, sProcedureName) {
	if (!oCurrentData.CAMPAIGN_ID || isNaN(Number(oCurrentData.CAMPAIGN_ID))) {
		sendNotificationMail(oHQ, sContent, oCurrentData, oSentNotifications, sProcedureName);
		return;
	}
	var oCampaignData = getCampaignData(oHQ, oCurrentData.CAMPAIGN_ID);
	if (oCampaignData.MAIL_NOTIFICATION_SUMMARY_CODE) {
		var sTxtModule = getTextTemplateData(oCampaignData.MAIL_NOTIFICATION_SUMMARY_CODE, oCurrentData.LOCALE);
		if (sTxtModule) {
			sContent = sTxtModule.replace("{{USER_NAME}}", oCurrentData.NAME).replace("{{CONTENT}}", sContent);
		}
	} else {
		sContent = TextBundle.getText("messages", "MSG_NOTIFICATION_BODY", [oCurrentData.NAME, sContent], oCurrentData.LOCALE);
	}
	var sTemplate = getTemplateData(oCampaignData.MAIL_TEMPLATE_CODE, oCurrentData.LOCALE);
	sContent = sTemplate.replace("{{CONTENT}}", sContent);

	sContent = replaceCampaignData(oHQ, sContent, oCurrentData.CAMPAIGN_ID, oCurrentData.LOCALE);

	sendNotificationMail(oHQ, sContent, oCurrentData, oSentNotifications, sProcedureName);
}

function createNotificationEntry(oHQ, oNotification, bWithoutRelativeDate) {
	var sSubtitle = oNotification.SUBTITLE;
	if (oNotification.SUBTITLE_MAIL) {
		sSubtitle = oNotification.SUBTITLE_MAIL;
	}
	sSubtitle = (sSubtitle || "");
	return "<li>" +
		(bWithoutRelativeDate ? "" : (oNotification.RELATIVE_TIMESTAMP + ":&nbsp;")) +
		"<a href=\"" +
		getObjectUrl(oNotification.IS_EXTERNAL,
			oNotification.OBJECT_TYPE_CODE,
			oNotification.OBJECT_ID,
			oNotification.NOTIFICATION_CODE,
			oHQ) +
		"\">" +
		(oNotification.TITLE || "").replace(/</g, "&lt;").replace(/>/g, "&gt;") +
		"</a><br />" +
		sSubtitle +
		"</li>";
}

function createNotificationIdeaDeletedEntry(oHQ, oNotification) {

	var TextYourIdea = TextBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_IDEA_DELETE_YOUR_IDEA", [oNotification.OBJECT_TEXT]);
	var TextHasDeleted = TextBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_IDEA_DELETE_HAS_DELETED");
	return "<li>" + TextYourIdea +
		"<a href=\"" +
		getObjectUrl(oNotification.IS_EXTERNAL,
			"CAMPAIGN",
			oNotification.CAMPAIGN_ID,
			oNotification.NOTIFICATION_CODE,
			oHQ) +
		"\">" +
		oNotification.CAMPAIGN_ID +
		"</a>" +
		TextHasDeleted + "<br />" +
		"</li>";
}
//--------------------------------------------------------------------------------------------
//                              preview functions
//-------------------------------------------------------------------------------------------

function checkCampaignAuthorization(oHQ, iCampaignID) {
	var sCampaignAuthStatement =
		"select * " +
		"from \"sap.ino.db.campaign::v_auth_campaigns\" as campaign " +
		"where campaign.campaign_id = ?";

	var aCampAuthResult = oHQ.statement(sCampaignAuthStatement).execute(iCampaignID);

	if (aCampAuthResult.length === 0) {
		//User is not authorized to read campaign data
		return false;
	}
	return true;
}

function checkIdeaAuthorization(oHQ, iIdeaID) {
	var sIdeaAuthStatement =
		"select * " +
		"from \"sap.ino.db.idea::v_auth_ideas_read\" as idea " +
		"where idea.idea_id = ?";

	var aIdeaAuthResult = oHQ.statement(sIdeaAuthStatement).execute(iIdeaID);

	if (aIdeaAuthResult.length === 0) {
		//User is not authorized to read campaign data
		return false;
	}
	return true;
}

function getMailPreview(iIdeaID, sAction, iDecider,iActorId, sLang, sContent, sPhase, sStatus,sReasontxt) {

	if (!checkIdeaAuthorization(oHQ, iIdeaID)) {
		return sContent;
	}

	var oIdea = getIdeaData(oHQ, iIdeaID);
	if (!oIdea) {
		return sContent;
	}

	var sCampaignColor = getCampaignData(oHQ, oIdea.CAMPAIGN_ID).COLOR;
	if (!sCampaignColor) {
		//user is not authorized to read the campaign
		return sContent;
	}
// 	oHQ, iIdeaId, sAction, iDecider,iActorId, iRecipientId, sLang, sContent, sPhase, sStatus,sReasonText
	var sTemplate = createTemplateMail(oHQ, iIdeaID, sAction, iDecider,iActorId, undefined, sLang, sContent, sPhase, sStatus,sReasontxt);
	sTemplate = replaceCID(oHQ, sTemplate, oIdea.CAMPAIGN_ID, true);

	return "<div>" + sTemplate + "</div>";
}

function getMailwithTextcodePreview(iIdeaID, sAction, iDecider,iActorId, sLang, sContent,
	sPhase, sStatus, sTextcode, sReasoncode, sReasontxt, sLabel, sURL) {

	if (!checkIdeaAuthorization(oHQ, iIdeaID)) {
		return sContent;
	}

	var oIdea = getIdeaData(oHQ, iIdeaID);
	if (!oIdea) {
		return sContent;
	}

	var sCampaignColor = getCampaignData(oHQ, oIdea.CAMPAIGN_ID).COLOR;
	if (!sCampaignColor) {
		//user is not authorized to read the campaign
		return sContent;
	}
	var sTemplate = createTemplateTextMail(oHQ, iIdeaID, sAction, iDecider,iActorId, undefined,
		sLang, sContent, sPhase, sStatus, sTextcode, sReasoncode, sReasontxt, sLabel, sURL);
	sTemplate = replaceCID(oHQ, sTemplate, oIdea.CAMPAIGN_ID, true);

	return "<div>" + sTemplate + "</div>";
}

function getTemplatePreview(sTemplateCode, sTextCode, iCampaignID, sLang,sRoleCode,sActionCode) {

	if((iCampaignID < 0 && Number(bEnableNewNotification) === 0) || iCampaignID > 0){
		if (!checkCampaignAuthorization(oHQ, iCampaignID)) {
			return "";
		}
	}	

	var sMailTemplate = "{{CONTENT}}";
	if (sTemplateCode) {
		sMailTemplate = getTemplateData(sTemplateCode, sLang);
	}
	var sMailText = "{{CONTENT}}";
	if (sTextCode) {
		sMailText = getTextTemplateData(sTextCode, sLang);
		if (bEnableNewNotification && Number(bEnableNewNotification) > 0 && sRoleCode) {
		    sMailText = replaceNewNotificationTextModule(sMailText,sRoleCode,sActionCode);
        }
	}
	
    
	sMailTemplate = sMailTemplate.replace("{{CONTENT}}", sMailText);
	sMailTemplate = replaceCampaignData(oHQ, sMailTemplate, iCampaignID, sLang);
	sMailTemplate = replaceCID(oHQ, sMailTemplate, iCampaignID, true);

	return "<div>" + sMailTemplate + "</div>";
}


function replaceNewNotificationTextModule(sMailText,sRoleCode,sActionCode){
	return _getAllActionsTxtContent(sMailText,sRoleCode,sActionCode);
}

function _getAllActionsTxtContent(sMailText,sRoleCode,sActionCode) {
	var oActionRegex = /\$ACTION_[^$]+\$[\s\S]+\$\/ACTION_[^$]+\$/gm;
	var aAllTxtActions = oActionRegex.exec(sMailText);
	if (!aAllTxtActions || aAllTxtActions.length <= 0) {
	    return  _parseRoleTxtContent(sMailText,sRoleCode,undefined,undefined);
	}else{
	    var sActions = aAllTxtActions[0];
	    return _getActionsTxtContent(sMailText,sRoleCode,sActionCode,sActions,oActionRegex);
	}
}

function _getActionsTxtContent(sMailText,sRoleCode,sActionCode,sActions,oActionRegex) {
    var oActionReg = new RegExp("\\$(ACTION_" + sActionCode + ")\\$([\\s\\S]+?)\\$\/\\1\\$", 'gm');
    var aActions = oActionReg.exec(sActions);
    if (aActions && aActions.length > 2) {
        return  _parseRoleTxtContent(sMailText,sRoleCode,aActions[2],oActionRegex);
    }else{
        return "";
    }
}

function _parseRoleTxtContent(sMailText,sRoleCode,aActions,oActionRegex) {
    var sParseRole = aActions? aActions : sMailText;
	var oRoleRegex = /\$ROLE_[^$]+\$[\s\S]+\$\/ROLE_[^$]+\$/gm;
	var oParseRoleRegex = oActionRegex? oActionRegex : oRoleRegex;
    var aAllTxtRoles = oRoleRegex.exec(sParseRole);
	if (!aAllTxtRoles || aAllTxtRoles.length <= 0) {
		return "";
	}else{
	    var sRoles = aAllTxtRoles[0];
	    var oRoleReg = new RegExp("\\$(ROLE_" + sRoleCode + ")\\$([\\s\\S]+?)\\$\/\\1\\$", 'gm');
	    var aRole = oRoleReg.exec(sRoles);
	    
	    if (aRole && aRole.length > 2) {
		    return sMailText.replace(oParseRoleRegex, aRole[2]);
	    }
	    
	    oRoleReg = new RegExp("\\$(ROLE_" + CommonUtil.DEFAULT_RECIPIENT + ")\\$([\\s\\S]+?)\\$\/\\1\\$", 'gm');
	    aRole = oRoleReg.exec(sRoles);
	    if (aRole && aRole.length > 2) {
		    return sMailText.replace(oParseRoleRegex, aRole[2]);
	    }

	    return "";
	}
}
