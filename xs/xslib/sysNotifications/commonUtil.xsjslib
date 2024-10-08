const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const DEFAULT_LAN_CODE = 'en';
const Attachments = $.import("sap.ino.xs.xslib", "attachment_repository");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const PROCESS_COUNT = 1000;
const NOTIFY_AUTHOR = "NOTIFY_AUTHOR";
const CHANGE_STATUS = "CHANGE_STATUS";
const CHANGE_DECISION = "CHANGE_DECISION";
const CHANGE_IDEA_PHASE = "CHANGE_IDEA_PHASE";
const IDEA_SUBMITTER = "IDEA_SUBMITTER";
const AUTHOR = "AUTHOR";
const EMPTY_CONTENT = "{{CONTENT}}";
const DEFAULT_TXT_CONTENT = "";
const DEFAULT_RECIPIENT = "RECIPIENT";
const SYS_SUMMARY_TXT_MODULE = "sap.ino.config.NOTIFICATION_MAIL_TEXT_CODE";
const SKIPPED = "SKIPPED";
const USER_SETTING_TYPE = {
	IMME: 0,
	BATCH: 1
};
const SYS_EMAIL_TEMPLATE = {
	summary_code: "sap.ino.config.NOTIFICATION_MAIL_TEMPLATE_CODE",
	imme_code: "sap.ino.config.NOTIFICATION_IMME_MAIL_TEMPLATE_CODE"
};
const SYS_ACTION_TYPE_CODE = {
	SYSTEM: "SYSTEM",
	CAMPAIGN: "CAMPAIGN",
	FOLLOW: "FOLLOW"
};
const RegularExpression = {
	CONTENT: new RegExp("{{CONTENT}}", "g"),
	IDEA_ID: new RegExp("{{IDEA_ID}}", "g"),
	IDEA_NAME: new RegExp("{{IDEA_NAME}}", "g"),
	PHASE: new RegExp("{{PHASE}}", "g"),
	STATUS: new RegExp("{{STATUS}}", "g"),
	PREVIOUS_PHASE: new RegExp("{{PREVIOUS_PHASE}}", "g"),
	PREVIOUS_STATUS: new RegExp("{{PREVIOUS_STATUS}}", "g"),
	NEW_PHASE: new RegExp("{{NEW_PHASE}}", "g"),
	NEW_STATUS: new RegExp("{{NEW_STATUS}}", "g"),
	CAMPAIGN_TITLE_IMAGE: new RegExp("{{CAMPAIGN_TITLE_IMAGE}}", "g"),
	CAMPAIGN_TITLE_IMAGE_CID: new RegExp("cid:CAMPAIGN_TITLE_IMAGE", "g"),
	CAMPAIGN_NAME: new RegExp("{{CAMPAIGN_NAME}}", "g"),
	CAMPAIGN_ID: new RegExp("{{CAMPAIGN_ID}}", "g"),
	CAMPAIGN_COLOR: new RegExp("{{CAMPAIGN_COLOR}}", "g"),
	CAMPAIGN_COLOR_SMALL: new RegExp("{{campaign_color}}", "g"),
	COACH_NAME: new RegExp("{{COACH_NAME}}", "g"),
	COACH_FIRST_NAME: new RegExp("{{COACH_FIRST_NAME}}", "g"),
	COACH_LAST_NAME: new RegExp("{{COACH_LAST_NAME}}", "g"),
	COACH_PHONE: new RegExp("{{COACH_PHONE}}", "g"),
	COACH_MOBILE: new RegExp("{{COACH_MOBILE}}", "g"),
	COACH_EMAIL: new RegExp("{{COACH_EMAIL}}", "g"),
	ACTOR_NAME: new RegExp("{{ACTOR_NAME}}", "g"),
	ACTOR_FIRST_NAME: new RegExp("{{ACTOR_FIRST_NAME}}", "g"),
	ACTOR_LAST_NAME: new RegExp("{{ACTOR_LAST_NAME}}", "g"),
	ACTOR_PHONE: new RegExp("{{ACTOR_PHONE}}", "g"),
	ACTOR_MOBILE: new RegExp("{{ACTOR_MOBILE}}", "g"),
	ACTOR_EMAIL: new RegExp("{{ACTOR_EMAIL}}", "g"),
	AUTHOR_NAME: new RegExp("{{AUTHOR_NAME}}", "g"),
	AUTHOR_FIRST_NAME: new RegExp("{{AUTHOR_FIRST_NAME}}", "g"),
	AUTHOR_LAST_NAME: new RegExp("{{AUTHOR_LAST_NAME}}", "g"),
	AUTHOR_PHONE: new RegExp("{{AUTHOR_PHONE}}", "g"),
	AUTHOR_MOBILE: new RegExp("{{AUTHOR_MOBILE}}", "g"),
	AUTHOR_EMAIL: new RegExp("{{AUTHOR_EMAIL}}", "g"),
	RECIPIENT_NAME: new RegExp("{{RECIPIENT_NAME}}", "g"),
	RECIPIENT_FIRST_NAME: new RegExp("{{RECIPIENT_FIRST_NAME}}", "g"),
	RECIPIENT_LAST_NAME: new RegExp("{{RECIPIENT_LAST_NAME}}", "g"),
	RECIPIENT_PHONE: new RegExp("{{RECIPIENT_PHONE}}", "g"),
	RECIPIENT_MOBILE: new RegExp("{{RECIPIENT_MOBILE}}", "g"),
	RECIPIENT_EMAIL: new RegExp("{{RECIPIENT_EMAIL}}", "g"),
	DECISION_MAKER: new RegExp("{{DECISION_MAKER}}", "g"),
	DECISION_CHANGE_REASON: new RegExp("{{DECISION_CHANGE_REASON}}", "g"),
	DECISION_REASON_COMMENT: new RegExp("{{DECISION_REASON_COMMENT}}", "g"),
	DECISION_AUTHOR_COMMENT: new RegExp("{{DECISION_AUTHOR_COMMENT}}", "g"),
	DECISION_REFERENCE_URL: new RegExp("{{DECISION_REFERENCE_URL}}", "g"),
	DECISION_REFERENCE_LABEL: new RegExp("{{DECISION_REFERENCE_LABEL}}", "g"),
	USER_NAME: new RegExp("{{USER_NAME}}", "g"),
	SOURCE_IDEA_NAME: new RegExp("{{SOURCE_IDEA_NAME}}", "g"),
	LEADING_IDEA_NAME: new RegExp("{{LEADING_IDEA_NAME}}", "g"),
	LEADING_IDEA_STATUS: new RegExp("{{LEADING_IDEA_STATUS}}", "g"),
	VOLUNTEER_NAME: new RegExp("{{VOLUNTEER_NAME}}", "g"),
	VOLUNTEER_FIRST_NAME: new RegExp("{{VOLUNTEER_FIRST_NAME}}", "g"),
	VOLUNTEER_LAST_NAME: new RegExp("{{VOLUNTEER_LAST_NAME}}", "g"),
	VOLUNTEER_EMAIL: new RegExp("{{VOLUNTEER_EMAIL}}", "g"),
	VOLUNTEER_MOBILE: new RegExp("{{VOLUNTEER_MOBILE}}", "g"),
	VOLUNTEER_PHONE: new RegExp("{{VOLUNTEER_PHONE}}", "g"),
	PREVIOUS_AUTHOR_NAME: new RegExp("{{PREVIOUS_AUTHOR_NAME}}", "g"),
	PREVIOUS_AUTHOR_FIRST_NAME: new RegExp("{{PREVIOUS_AUTHOR_FIRST_NAME}}", "g"),
	PREVIOUS_AUTHOR_LAST_NAME: new RegExp("{{PREVIOUS_AUTHOR_LAST_NAME}}", "g"),
	NEW_AUTHOR_NAME: new RegExp("{{NEW_AUTHOR_NAME}}", "g"),
	NEW_AUTHOR_FIRST_NAME: new RegExp("{{NEW_AUTHOR_FIRST_NAME}}", "g"),
	NEW_AUTHOR_LAST_NAME: new RegExp("{{NEW_AUTHOR_LAST_NAME}}", "g"),
	EXPERT_NAME: new RegExp("{{EXPERT_NAME}}", "g"),
	EXPERT_FIRST_NAME: new RegExp("{{EXPERT_FIRST_NAME}}", "g"),
	EXPERT_LAST_NAME: new RegExp("{{EXPERT_LAST_NAME}}", "g"),
	PREVIOUS_CAMPAIGN_NAME: new RegExp("{{PREVIOUS_CAMPAIGN_NAME}}", "g"),
	NEW_CAMPAIGN_NAME: new RegExp("{{NEW_CAMPAIGN_NAME}}", "g"),
	IDEA_COMMENT: new RegExp("{{IDEA_COMMENT}}", "g"),
	IDEA_FOLLOW_UP_DATE: new RegExp("{{IDEA_FOLLOW_UP_DATE}}", "g"),
	EVALUATION_RESULT: new RegExp("{{EVALUATION_RESULT}}", "g"),
	OBJECT_NAME: new RegExp("{{OBJECT_NAME}}", "g"),
	OBJECT_URL: new RegExp("{{OBJECT_URL}}", "g"),
	OBJECT_STATUS: new RegExp("{{OBJECT_STATUS}}", "g"),
	OBJECT_EVENT_AT: new RegExp("{{OBJECT_EVENT_AT}}", "g"),
	EVALUATION_REQUEST_DESCRIPTION: new RegExp("{{EVALUATION_REQUEST_DESCRIPTION}}", "g"),
	EVALUATION_REQUEST_ACCEPTANCE_DATE: new RegExp("{{EVALUATION_REQUEST_ACCEPTANCE_DATE}}", "g"),
	EVALUATION_REQUEST_COMPLETION_DATE: new RegExp("{{EVALUATION_REQUEST_COMPLETION_DATE}}", "g"),
	EVALUATION_REQUEST_STATUS: new RegExp("{{EVALUATION_REQUEST_STATUS}}", "g"),
	APPLICANT_NAME: new RegExp("{{APPLICANT_NAME}}", "g"),
	APPLICANT_FIRST_NAME: new RegExp("{{APPLICANT_FIRST_NAME}}", "g"),
	APPLICANT_LAST_NAME: new RegExp("{{APPLICANT_LAST_NAME}}", "g"),
	REGISTRATION_STATUS: new RegExp("{{REGISTRATION_STATUS}}", "g"),
	REGISTRATION_REASON: new RegExp("{{REGISTRATION_REASON}}", "g"),
	CAMPAIGN_MANAGER_NAME: new RegExp("{{CAMPAIGN_MANAGER_NAME}}", "g"),
	CAMPAIGN_MANAGER_FIRST_NAME: new RegExp("{{CAMPAIGN_MANAGER_FIRST_NAME}}", "g"),
	CAMPAIGN_MANAGER_LAST_NAME: new RegExp("{{CAMPAIGN_MANAGER_LAST_NAME}}", "g"),
	CAMPAIGN_COMMENT: new RegExp("{{CAMPAIGN_COMMENT}}", "g"),
	TAG_NAME: new RegExp("{{TAG_NAME}}", "g"),
	COAUTHOR_NAME: new RegExp("{{COAUTHOR_NAME}}", "g"),
	COAUTHOR_FIRST_NAME: new RegExp("{{COAUTHOR_FIRST_NAME}}", "g"),
	COAUTHOR_LAST_NAME: new RegExp("{{COAUTHOR_LAST_NAME}}", "g"),
	USER_PASSWORD: new RegExp("{{USER_PASSWORD}}", "g"),
	VALID_FROM: new RegExp("{{VALID_FROM}}", "g"),
	VALID_TO: new RegExp("{{VALID_TO}}", "g"),
	SUBMISSION_FROM: new RegExp("{{SUBMISSION_FROM}}", "g"),
	SUBMISSION_TO: new RegExp("{{SUBMISSION_TO}}", "g"),
	REGISTRATION_FROM: new RegExp("{{REGISTRATION_FROM}}", "g"),
	REGISTRATION_TO: new RegExp("{{REGISTRATION_TO}}", "g"),
	SYSTEM_URL: new RegExp("{{SYSTEM_URL}}", "g")
};

var getCampaignName = _.memoize(function(oHQ, iCampaignID, sLang) {
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

var getIdeaData = _.memoize(function(oHQ, iIdeaId) {
	if (iIdeaId <= 0) {
		return {};
	}
	var sStatement =
		`SELECT idea.id AS idea_id, 
	idea.name AS idea_name, 
	idea.phase_code AS phase, 
	idea.status_code AS status, 
	idea.campaign_id, 
	ident_coach.id AS coach_id, 
	idea.created_by_id AS author_id, 
	case when camp.is_black_box = 1 then '' else idea.short_description end AS short_desc
FROM "sap.ino.db.idea::t_idea" AS idea
	INNER JOIN "sap.ino.db.campaign::t_campaign" AS camp
	ON idea.campaign_id = camp.id
	LEFT OUTER JOIN "sap.ino.db.iam::t_object_identity_role" AS identity_role_coach
	ON idea.id = identity_role_coach.object_id
		AND identity_role_coach.object_type_code = 'IDEA'
		AND identity_role_coach.role_code = 'IDEA_COACH'
	LEFT OUTER JOIN "sap.ino.db.iam::t_identity" AS ident_coach
	ON ident_coach.id = identity_role_coach.identity_id
WHERE idea.id = ?`;

	var aResult = oHQ.statement(sStatement).execute(iIdeaId);
	if (aResult.length === 0) {
		return {};
	}

	return aResult[0];
}, function(oHQ, iIdeaID) {
	return iIdeaID;
});

var getIdentity = _.memoize(function(oHQ, iIdentityID) {
	var sIdentityStatement = "select first_name, last_name, name, phone, mobile, email from \"sap.ino.db.iam::t_identity\" where id = ?";
	return oHQ.statement(sIdentityStatement).execute(iIdentityID)[0];
}, function(oHQ, iIdentityID) {
	return iIdentityID;
});

var getTag = _.memoize(function(oHQ, iID) {
	var sIdentityStatement = 'SELECT "NAME" FROM "SAP_INO"."sap.ino.db.tag::t_tag" WHERE ID = ?';
	return oHQ.statement(sIdentityStatement).execute(iID)[0];
}, function(oHQ, iID) {
	return iID;
});

var getValueText = _.memoize(function(oHQ, sValueCode) {
	var sStatement =
		"select default_text as default_text from \"sap.ino.db.basis::t_value_option\" where code  = ?";
	var aResult = oHQ.statement(sStatement).execute(sValueCode);
	if (aResult.length === 0) {
		return "";
	}
	return aResult[0].DEFAULT_TEXT;
}, function(oHQ, sValueCode) {
	return sValueCode;
});

var getOptionValueText = _.memoize(function(oHQ, sListCode, iTypeValue, sValue, iValue, bValue) {
	var sStatement =
		`select default_text as default_text from 
		"sap.ino.db.basis::t_value_option" 
		where LIST_CODE  = ? `;
	var aParam = [sListCode];
	if (iTypeValue === 1) {
		sStatement += ' AND TEXT_VALUE = ? ';
		aParam.push(sValue);
	} else if (iTypeValue === 2) {
		sStatement += '  AND NUM_VALUE = ? ';
		aParam.push(iValue);
	} else if (iTypeValue === 3) {
		sStatement += '  AND BOOL_VALUE = ? ';
		aParam.push(bValue);
	}
	var aResult = oHQ.statement(sStatement).execute(aParam);
	if (aResult.length === 0) {
		return "";
	}
	return aResult[0].DEFAULT_TEXT;
}, function(oHQ, sListCode, iTypeValue, sValue, iValue, bValue) {
	return sListCode + (iTypeValue || "") + (sValue || "") + (iValue || "-1") + (bValue || "false");
});

var getUnitText = _.memoize(function(oHQ, sValueCode) {
	var sStatement =
		"select default_text as default_text from \"sap.ino.db.basis::t_unit\" where code  = ?";
	var aResult = oHQ.statement(sStatement).execute(sValueCode);
	if (aResult.length === 0) {
		return "";
	}
	return aResult[0].DEFAULT_TEXT;
}, function(oHQ, sValueCode) {
	return sValueCode;
});

var getImage = _.memoize(function(oHQ, sCID, iCampaignID) {
	var oImage = {
		CID: sCID
	};
	if (sCID === "CAMPAIGN_TITLE_IMAGE") {
		var sRepositoryStatement =
			`
			SELECT attachment.file_name, 
	attachment.media_type, 
	data.data
FROM "sap.ino.db.campaign::t_campaign" AS campaign
	INNER JOIN "sap.ino.db.attachment::t_attachment_assignment" AS attach_assign
	ON attach_assign.owner_id = campaign.id
		AND attach_assign.owner_type_code = 'CAMPAIGN'
		AND attach_assign.role_type_code = 'CAMPAIGN_DETAIL_IMG'
	INNER JOIN "sap.ino.db.attachment::t_attachment" AS attachment
	ON attachment.ID = attach_assign.attachment_id
	INNER JOIN "sap.ino.db.attachment::t_attachment_data" AS data
	ON attachment.id = data.id
WHERE campaign.id = ?
				`;
		var aRepositoryResult = oHQ.statement(sRepositoryStatement).execute(iCampaignID);
		if (aRepositoryResult.length === 0) {
			return undefined;
		} else {
			oImage.MEDIA_TYPE = aRepositoryResult[0].MEDIA_TYPE;
			oImage.FILE_NAME = aRepositoryResult[0].FILE_NAME + "." + oImage.MEDIA_TYPE.split("/")[1];
			oImage.DATA = aRepositoryResult[0].DATA;
		}
		return oImage;
	}

	var sStatement =
		`
			SELECT package_id AS package,
			file_name,
			media_type
			FROM "sap.ino.db.attachment::v_repository_attachment"
			WHERE upper(file_name) = ?
				`;
	var aResult = oHQ.statement(sStatement).execute(sCID);
	if (!aResult || aResult.length === 0) {
		oImage.DATA = undefined;
		return oImage;
	}
	oImage.MEDIA_TYPE = aResult[0].MEDIA_TYPE;
	oImage.FILE_NAME = aResult[0].FILE_NAME + "." + oImage.MEDIA_TYPE.split("/")[1];
	try {
		oImage.DATA = Attachments.readAttachment(aResult[0].PACKAGE, aResult[0].FILE_NAME, aResult[0].MEDIA_TYPE, oHQ);
	} catch (e) {
		oImage.DATA = undefined;
	}
	return oImage;
}, function(oHQ, sCID, iCampaignID) {
	return sCID + "-" + iCampaignID;
});

var getCodeText = _.memoize(function(sCode, sCodeType, sLang) {
	var aPhaseText = TextBundle.getExtensibleTextBundleObject(sCodeType, sLang, sCode);
	if (aPhaseText.length > 0) {
		return aPhaseText[0].CONTENT;
	} else {
		return sCode;
	}
});

function getSystemSetting(oHQ, sCode) {
	var sSelStatement = 'SELECT VALUE FROM "sap.ino.db.basis::v_local_system_setting" WHERE CODE = ?';
	var oSystemSetting = oHQ.statement(sSelStatement).execute(sCode);
	if (!oSystemSetting || oSystemSetting.length <= 0) {
		return "";
	}
	return oSystemSetting[0].VALUE;
}

function getAllNotificationSettings(oHQ) {
	var oNotificationsSetting = oHQ
		.procedure("SAP_INO", "sap.ino.db.newnotification::p_notification_email_settings")
		.execute();
	return oNotificationsSetting;
}

function getCampaignsData(oHQ, aCampaignID, sLan) {
	var oCampaign = [];
	if (aCampaignID && aCampaignID.length > 0) {
		var sStatement =
			`
			SELECT campaign.ID, campaign.color_code,
    			campaign.mail_template_code,
    			campaign.mail_success_code,
    			campaign.mail_rejection_code,
    			campaign.mail_phase_change_code,
    			attachment.attachment_id AS image,
    			campaign.mail_notification_summary_code,
    			campaign.VALID_FROM as VALID_FROM,
    			campaign.VALID_TO as VALID_TO,
    			campaign.SUBMIT_FROM as SUBMIT_FROM,
    			campaign.SUBMIT_TO as SUBMIT_TO,
    			campaign.REGISTER_FROM as REGISTER_FROM,
    			campaign.REGISTER_TO as REGISTER_TO,
    			camp_t.name as CAMPAIGN_NAME,
    			camp_t.DESCRIPTION as DESCRIPTION,
    			camp_t_en.name as CAMPAIGN_NAME_EN,
    			camp_t_en.DESCRIPTION as DESCRIPTION_EN
			FROM "sap.ino.db.campaign::t_campaign" AS campaign
			LEFT OUTER JOIN "sap.ino.db.campaign::t_campaign_t" AS camp_t
			    ON campaign.id = camp_t.campaign_id AND camp_t.lang = ?
			LEFT OUTER JOIN "sap.ino.db.campaign::t_campaign_t" AS camp_t_en
			    ON campaign.id = camp_t_en.campaign_id AND camp_t_en.lang = 'en'
			LEFT OUTER JOIN "sap.ino.db.attachment::t_attachment_assignment" AS attachment
			    ON attachment.owner_id = campaign.id
			    AND attachment.owner_type_code = 'CAMPAIGN'
			    AND attachment.role_type_code = 'CAMPAIGN_DETAIL_IMG'
			WHERE 1 != 1 `;

		_.each(aCampaignID, function(iCampId) {
			sStatement += ' OR  campaign.ID = ? ';
		});
		var aResult = oHQ.statement(sStatement).execute([].concat([sLan]).concat(aCampaignID));
		if (aResult.length > 0) {
			_.each(aResult, function(oCamp) {
				oCampaign.push({
					ID: oCamp.ID,
					CAMPAIGN_NAME: oCamp.CAMPAIGN_NAME,
					CAMPAIGN_NAME_EN: oCamp.CAMPAIGN_NAME_EN,
					COLOR: "#" + oCamp.COLOR_CODE,
					IMAGE: oCamp.IMAGE,
					MAIL_TEMPLATE_CODE: oCamp.MAIL_TEMPLATE_CODE,
					MAIL_SUCCESS_CODE: oCamp.MAIL_SUCCESS_CODE,
					MAIL_REJECTION_CODE: oCamp.MAIL_REJECTION_CODE,
					MAIL_PHASE_CHANGE_CODE: oCamp.MAIL_PHASE_CHANGE_CODE,
					MAIL_NOTIFICATION_SUMMARY_CODE: oCamp.MAIL_NOTIFICATION_SUMMARY_CODE,
					VALID_FROM: oCamp.VALID_FROM,
					VALID_TO: oCamp.VALID_TO,
					SUBMIT_FROM: oCamp.SUBMIT_FROM,
					SUBMIT_TO: oCamp.SUBMIT_TO,
					REGISTER_FROM: oCamp.REGISTER_FROM,
					REGISTER_TO: oCamp.REGISTER_TO,
					DESCRIPTION: oCamp.DESCRIPTION,
					DESCRIPTION_EN: oCamp.DESCRIPTION_EN
				});
			});
		}
	}
	return oCampaign;
}

function getHost(oHQ, bExternal) {
	if (bExternal) {
		var sExternalHost = SystemSettings.getIniValue("host_external", oHQ);
		if (sExternalHost) {
			return sExternalHost + "/";
		} else {
			return getHost(oHQ, false);
		}
	}
	return SystemSettings.getIniValue("host", oHQ) + "/";
}

function replaceCID(oHQ, sTemplate, oCampaignData, sHost) {
	if (sTemplate.search("{{CAMPAIGN_TITLE_IMAGE}}") > -1 || sTemplate.search("cid:CAMPAIGN_TITLE_IMAGE") > -1) {
		var sAttachmentStatement = 'select value from "sap.ino.db.basis::t_system_setting" where code = ?';
		var aResult = oHQ.statement(sAttachmentStatement).execute("sap.ino.config.URL_PATH_XS_ATTACHMENT_DOWNLOAD");
		if (aResult.length > 0) {
			var sCampaignImage = oCampaignData.IMAGE;
			var sImageURL = sHost + aResult[0].VALUE + "/" + sCampaignImage;
			sTemplate = sTemplate.replace(RegularExpression.CAMPAIGN_TITLE_IMAGE, sImageURL);
			sTemplate = sTemplate.replace(RegularExpression.CAMPAIGN_TITLE_IMAGE_CID, sImageURL);
		}
	}
	var sStatement = 'select  upper(file_name) as cid, path  from  "sap.ino.db.attachment::v_repository_attachment"';
	var Images = oHQ.statement(sStatement).execute();
	_.each(Images, function(oImage) {
		var sCID = "cid:" + oImage.CID;
		var oRegExp = new RegExp(sCID, "g");
		sTemplate = sTemplate.replace(oRegExp, sHost + oImage.PATH);
	});
	return sTemplate;
}

function generateJobId(oHQ) {
	var sSelStatement =
		'SELECT VALUE FROM "sap.ino.db.notification::v_notification_email_scheduled_currentseconds"';
	return Number(oHQ.statement(sSelStatement).execute()[0].VALUE.toString());
}

function updateMailStatus(oHQ, nJobId) {
	oHQ.procedure("SAP_INO", "sap.ino.db.newnotification::p_notification_email_sender_service")
		.execute(nJobId);
	oHQ.getConnection().commit();
}

function getUserList(oHQ, nJobId) {
	var sSelectStatement =
		`
			SELECT DISTINCT status.USER_ID, loc.LOCALE, sloc.LOCALE AS SLOCALE,
			setting.SETTING_VALUE
			FROM "sap.ino.db.basis::v_locale" AS sloc, "sap.ino.db.notification::t_notification_status"
			AS status
			LEFT OUTER JOIN "sap.ino.db.iam::t_personalize_setting"
			AS setting
			ON status.USER_ID = setting.IDENTITY_ID
			AND setting.OBJECT_TYPE_CODE = 'NEWNOTIFICATION_KEY'
			AND setting.TYPE_CODE = 'NEWNOTIFICATION'
			LEFT OUTER JOIN "sap.ino.db.basis::v_user_locale"
			AS loc
			ON status.USER_ID = loc.user_id
			WHERE status.CHANGED_BY_ID = ?
				AND status.MAIL_STATUS_CODE = 'PROCESSING'
				AND sloc.IS_SYSTEM_DEFAULT = 1
			`;
	return oHQ.statement(sSelectStatement).execute(nJobId);
}

function splitIdeaStatusHistoryObjectInfo(oHQ, oNotification, sLang) {
	var oResult = {
		PREVIOUS_PHASE: "",
		PREVIOUS_STATUS: "",
		TRANSITION_CODE: "",
		SUB_ACTION_TYPE: "",
		MAKER: ""
	};
	if (!oNotification.HISTORY_OBJECT_INFO) {
		return oResult;
	}
	// 	sandbox.bestfleisch.config.cust1.sylTest_New_PRE_STATUS_CODE
	var aResult = oNotification.HISTORY_OBJECT_INFO.split("_PRE_STATUS_CODE_");
	if (aResult.length === 2) {
		oResult.PREVIOUS_STATUS = getCodeText(aResult[0], "t_status", sLang);
	}
	aResult = aResult.length === 2 ? aResult[1].split("_PRE_PHASE_CODE_") : aResult[0].split("_PRE_PHASE_CODE_");
	if (aResult.length === 2) {
		oResult.PREVIOUS_PHASE = getCodeText(aResult[0], "t_phase", sLang);
	}
	aResult = aResult.length === 2 ? aResult[1].split("_TRANSITION_ID_") : aResult[0].split("_TRANSITION_ID_");
	if (aResult.length === 2) {
		oResult.TRANSITION_CODE = aResult[0];
	}
	aResult = aResult.length === 2 ? aResult[1].split("_ACTION_TYPE_") : aResult[0].split("_ACTION_TYPE_");
	if (aResult.length === 2) {
		oResult.SUB_ACTION_TYPE = aResult[0];
	}
	aResult = aResult.length === 2 ? aResult[1].split("_DECIDER_ID_") : aResult[0].split("_DECIDER_ID_");
	if (aResult.length === 2) {
		oResult.MAKER = aResult[0];
	}
	return oResult;
}

function splitIdeaStatusHistoryObjectInfoForActionType(oNotification) {
	var oResult = {
		SUB_ACTION_TYPE: ""
	};
	if (!oNotification.HISTORY_OBJECT_INFO) {
		return oResult;
	}
	// 	sandbox.bestfleisch.config.cust1.sylTest_New_PRE_STATUS_CODE
	var aResult = oNotification.HISTORY_OBJECT_INFO.split("_PRE_STATUS_CODE_");
	aResult = aResult.length === 2 ? aResult[1].split("_PRE_PHASE_CODE_") : aResult[0].split("_PRE_PHASE_CODE_");
	aResult = aResult.length === 2 ? aResult[1].split("_TRANSITION_ID_") : aResult[0].split("_TRANSITION_ID_");
	aResult = aResult.length === 2 ? aResult[1].split("_ACTION_TYPE_") : aResult[0].split("_ACTION_TYPE_");
	if (aResult.length === 2) {
		oResult.SUB_ACTION_TYPE = aResult[0];
	}
	return oResult;
}

function replacePlaceHolder(oResult, oData, sPrefix) {
	if (oData) {
		_.each(oData, function(sValue, sKey) {
			oResult.sContent = oResult.sContent.replace(RegularExpression[(sPrefix || "") + sKey], sValue);
		});
	}
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

function formatDate(oDate) {
	if (!oDate) {
		return oDate;
	}
	return (oDate.getUTCMonth() + 1) + "/" + oDate.getUTCDate() + "/" + oDate.getUTCFullYear();
}