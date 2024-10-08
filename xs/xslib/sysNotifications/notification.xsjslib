var oSI = $.import("sap.ino.xs.xslib", "SimilarIdeas");
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const textBundle = $.import("sap.ino.xs.xslib", "textBundle");
const SystemSetting = $.import("sap.ino.xs.xslib", "systemSettings");

var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn).setSchema('SAP_INO_EXT');
var oHQTech = $.import("sap.ino.xs.xslib", "dbConnection").getHQ().setSchema('SAP_INO_EXT');

//init timestamps once
var iNow = new Date().getTime();
var iOneMinuteAgo = iNow - 1000 * 60;
var iTwoMinutesAgo = iNow - 1000 * 60 * 2;
var iOneHourAgo = iNow - 1000 * 60 * 60;
var iTwoHoursAgo = iNow - 1000 * 60 * 60 * 2;
var iSixHoursAgo = iNow - 1000 * 60 * 60 * 6;
var dTodayStart = new Date();
dTodayStart.setHours(0);
dTodayStart.setMinutes(0);
dTodayStart.setSeconds(0);
dTodayStart.setMilliseconds(1);
var iTodayStart = dTodayStart.getTime();
var dYesterdayStart = new Date();
dYesterdayStart.setHours(0);
dYesterdayStart.setMinutes(0);
dYesterdayStart.setSeconds(0);
dYesterdayStart.setMilliseconds(1);
dYesterdayStart.setDate(dYesterdayStart.getDate() - 1);
var iYesterdayStart = dYesterdayStart.getTime();

var getIdeaData = _.memoize(function(oHq, iIdeaId) {
	var sStatement =
		"select idea.id as idea_id, idea.name as idea_name, idea.phase as phase_code, idea.status as status_code, " +
		"idea.campaign_id, idea.coach_id, " +
		"idea.created_by_id as author_id " +
		"from \"sap.ino.db.idea::v_idea_medium\" as idea " +
		"where idea.id = ?";

	var aResult = oHq.statement(sStatement).execute(iIdeaId);
	if (aResult.length === 0) {
		return {};
	}

	return aResult[0];
}, function(oHq, iIdeaID) {
	return iIdeaID;
});

var getCodeText = _.memoize(function(sPhaseCode, sCodeType, sLang) {
	var aPhaseText = textBundle.getExtensibleTextBundleObject(sCodeType, sLang, sPhaseCode);
	if (aPhaseText.length > 0) {
		return aPhaseText[0].CONTENT;
	} else {
		return sPhaseCode;
	}
});

function getNotifications(iTop, iSkip, sLang, bCountOnly) {
	var oResult;
	if (bCountOnly) {
		oResult = oHQ.statement('select * from "SAP_INO_EXT"."sap.ino.db.notification.ext::v_ext_notification_count"').execute();
		if (oResult && oResult[0] && oResult[0].COUNT) {
			var iCount = oResult[0].COUNT;
			return {
				"NOTIFICATION_COUNT": iCount
			};
		}
		return oResult;
	} else {

		oResult = oHQ.statement(
			'select ' +
			'notification.ID, ' +
			'notification.NOTIFICATION_ID, ' +
			'notification.USER_ID, ' +
			'notification.ROLE_CODE, ' +
			'notification.STATUS_CODE, ' +
			'notification.EVENT_AT, ' +
			'notification.NOTIFICATION_CODE, ' +
			'notification.ACTION_CODE, ' +
			'notification.OBJECT_TYPE_CODE, ' +
			'notification.OBJECT_ID, ' +
			'notification.OBJECT_TEXT, ' +
			'notification.SUB_TEXT, ' +
			'notification.ACTOR_ID, ' +
			'notification.ACTOR_NAME,' +
			'notification.ACTOR_IMAGE_ID, ' +
			'notification.OWNER_ID, ' +
			'notification.INVOLVED_ID ' +

			'from ' +
			'"SAP_INO_EXT"."sap.ino.db.notification.ext::v_ext_notification" as notification ' +
			'inner join "SAP_INO"."sap.ino.db.newnotification::v_notification_system_setting" as notification_setting ' +
			'on notification_setting.action_code = notification.action_code and notification_setting.ALLOW_INBOX_NOTIFICATION = 1 ' +
			'order by notification.event_at desc ' +
			'limit ? offset ?'
		).execute(iTop, iSkip);
		return {
			"NOTIFICATIONS": this.getNotificationTextData(oResult, sLang),
			"NOTIFICATION_COUNT": oResult.length
		};
	}
}

function getNotificationTextData(aNotifications, sLang) {
	textBundle.preloadText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_%", sLang, undefined, oHQTech);
	_.each(aNotifications, function(oNotification) {
		getNotificationTitle(oNotification, sLang);
		getNotificationSubTitle(oNotification, sLang);
		getNotificationRelativeTimestamp(oNotification, sLang);
	});

	return aNotifications;
}

function getNotificationTextDataBatch(aNotifications) {
	var aLanguages = _.map(aNotifications, function(oNotification) {
		return oNotification.LOCALE;
	});
	var aUniqueLanguages = _.uniq(aLanguages);
	_.each(aUniqueLanguages, function(sLanguage) {
		textBundle.preloadText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_%", sLanguage, undefined, oHQTech);
	});
	_.each(aNotifications, function(oNotification) {
		getNotificationTitle(oNotification, oNotification.LOCALE);
		getNotificationSubTitle(oNotification, oNotification.LOCALE, true);
		getNotificationRelativeTimestamp(oNotification, oNotification.LOCALE);
	});

	return aNotifications;
}

function getNotificationTitle(oNotification, sLang) {
	var sType = oNotification.OBJECT_TYPE_CODE;
	var iUserId = oNotification.USER_ID;
	var iOwnerId = oNotification.OWNER_ID;
	var sObjectText = oNotification.OBJECT_TEXT;

	if (sType === "IDEA" && iUserId === iOwnerId) {
		oNotification.TITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_YOUR_IDEA", [sObjectText], sLang, undefined, oHQTech);
	} else if (oNotification.NOTIFICATION_CODE === "CAMP_REGISTER_CREATED") {
		var sKey = "CTRL_NOTIFICATIONCTRL_TIT_CAMP_REGISTER_CREATED";
		if (oNotification.ROLE_CODE === "APPLICANT") {
			sKey = "CTRL_NOTIFICATIONCTRL_TIT_APPLICANT_REGISTER_FOR_CAMPAIGN";
		}
		oNotification.TITLE = textBundle.getText("uitexts", sKey, [sObjectText], sLang, undefined, oHQTech);
	} else {
		oNotification.TITLE = sObjectText;
	}
}

function getNotificationSubTitle(oNotification, sLang, bEmail) {
	const sSystemApllicationTitleStr = SystemSetting.getValue('sap.ino.config.APPLICATION_TITLE', oHQ);
	var sCode = oNotification.NOTIFICATION_CODE;
	var sRole = oNotification.ROLE_CODE;
	var iUserId = oNotification.USER_ID;
	var iInvolvedId = oNotification.INVOLVED_ID;
	var sSubText = oNotification.SUB_TEXT;
	var sActionCode = oNotification.ACTION_CODE;
	var sActor = oNotification.ACTOR_NAME === null ? sSystemApllicationTitleStr : oNotification.ACTOR_NAME;

	if (sActionCode && sActionCode !== 'FEED') {
		// for new action
		var sTextKey = "CTRL_NOTIFICATIONCTRL_TIT_NEW_ACTION_" + sRole + "_" + sActionCode + "_TEXT";
		var sNewActionText = textBundle.getText("uitexts", sTextKey, [sActor], sLang, undefined,
			oHQTech);
		if (sNewActionText !== sTextKey) {
			oNotification.SUBTITLE = sNewActionText;
			return;
		}
		sTextKey = "CTRL_NOTIFICATIONCTRL_TIT_NEW_ACTION_" + sActionCode + "_TEXT";
		sNewActionText = textBundle.getText("uitexts", sTextKey, [sActor], sLang, undefined,
			oHQTech);
		if (sNewActionText !== sTextKey) {
			oNotification.SUBTITLE = sNewActionText;
			return;
		}
		oNotification.SUBTITLE = textBundle.getNormalText("uitexts", sTextKey, [sActor], '', undefined,
			oHQTech);
	}

	switch (sCode) {
		case "COMMENT_DELETED":
			var sMsgCommentDel = "CTRL_NOTIFICATIONCTRL_TIT_COMMENT_DELETED";
			if (iInvolvedId > 0 && iUserId === iInvolvedId) {
				sMsgCommentDel = "CTRL_NOTIFICATIONCTRL_TIT_YOUR_COMMENT_DELETED";
			}
			oNotification.SUBTITLE = textBundle.getText("uitexts", sMsgCommentDel, [_.stripTags(sSubText || "").substr(0, 100)],
				sLang, undefined,
				oHQTech);
			return;
		case "COMMENT_CREATED":
			oNotification.SUBTITLE = _.stripTags(sSubText || "").substr(0, 100);
			oNotification.SUBTITLE_MAIL = textBundle.getText("uitexts",
				"CTRL_NOTIFICATIONCTRL_TIT_COMMENT_CREATED", [oNotification.SUBTITLE], sLang, undefined, oHQTech);
			return;
		case "CAMP_REGISTER_UPDATED":
			if (sSubText === 'sap.ino.config.REGISTER_APPROVED') {
				oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_REGISTER_APPR", [sSubText], sLang, undefined, oHQTech);
			} else {
				oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_REGISTER_REJC", [sSubText], sLang, undefined, oHQTech);
			}
			return;
		case "IDEA_VOLUNTEERS_CREATE":
			oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_VOLUNTEER_CREATE", [sSubText], sLang, undefined,
				oHQTech);
			return;
		case "EVAL_REQ_ITEM_CREATED":
			oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_EVAL_REQ_EXPERT_ASSIGN", [sSubText], sLang, undefined,
				oHQTech);
			return;
		case "EVAL_REQ_ITEM_DELETED":
			oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_EVAL_REQ_EXPERT_UNASSIGN", [sSubText], sLang,
				undefined,
				oHQTech);
			return;
		case "STATUS_ACTION_sap.ino.config.EVAL_REQ_ACCEPT":
			oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_EVAL_REQ_EXPERT_ACCEPT", [sSubText], sLang, undefined,
				oHQTech);
			return;
		case "STATUS_ACTION_sap.ino.config.EVAL_REQ_REJECT":
			oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_EVAL_REQ_EXPERT_REJECT", [sSubText], sLang, undefined,
				oHQTech);
			return;
		case "STATUS_ACTION_sap.ino.config.EVAL_REQ_ITEM_COMPLETE":
		case "STATUS_ACTION_sap.ino.config.EVAL_REQ_COMPLETE":
			oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_EVAL_REQ_ITEM_COMPLETE", [sSubText], sLang, undefined,
				oHQTech);
			return;
		case "EVAL_REQ_ITEM_EXPIRED":
			oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_EVAL_REQ_ITEM_EXPIRE", [sSubText], sLang, undefined,
				oHQTech);
			return;
		case "EVAL_REQ_EXPIRE_IN_ONE_DAY":
			oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_EVAL_REQ_ITEM_EXPIRE_SOON", [sSubText], sLang,
				undefined, oHQTech);
			return;
		case "EVAL_REQ_ITEM_CLARIFICATION_SENT":
			oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_EVAL_REQ_ITEM_CLARIFICATION", [sSubText], sLang,
				undefined, oHQTech);
			return;
		case "EVAL_REQ_ITEM_CLARIFICATION_RECEIVED":
			oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_EVAL_REQ_ITEM_CLARIFICATION_RECEIVED", [sSubText],
				sLang, undefined, oHQTech);
			return;
		case "EVAL_REQ_ITEM_FORWARDED":
			oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_EVAL_REQ_ITEM_FORWARD", [sSubText], sLang, undefined,
				oHQTech);
			return;
	}
	if (oNotification.ACTION_CODE === "FEED") {
		oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_" + oNotification.NOTIFICATION_CODE, [sSubText], sLang,
			undefined, oHQTech);
		return;
	}
	if (sCode.length > 8 && sCode.substr(0, 7) === "FOLLOW_") {
		oNotification.SUBTITLE = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_" + sCode, [sSubText || sActor], sLang, undefined,
			oHQTech);
		return;
	}
	// 	else if (sActionCode) {
	// 	    // for new action
	// 	    var sTextKey = "CTRL_NOTIFICATIONCTRL_TIT_NEW_ACTION_" + sActionCode + "_TEXT";
	// 	    var sNewActionText = textBundle.getText("uitexts", sTextKey, [sActor], sLang, undefined,
	// 			oHQTech);
	// 		if (sNewActionText !== sTextKey) {
	// 		    oNotification.SUBTITLE = sNewActionText;
	// 		    return;
	// 		}
	// 	} 
	else if (sSubText) {
		oNotification.SUBTITLE = sSubText;
		return;
	}

	// 1) try to get a text with role and code,
	//     e.g. CTRL_NOTIFICATIONCTRL_TIT_IDEA_SUBMITTER_IDEA_CREATED
	// 2) try to get the text only with the code, 
	//     e.g. CTRL_NOTIFICATIONCTRL_TIT_IDEA_CREATED
	// 3) simply return empty string
	var sTextCodePrefix = "CTRL_NOTIFICATIONCTRL_TIT_";
	var sYou = "";
	if (iInvolvedId > 0 && iUserId === iInvolvedId) {
		sYou = "_YOU";
	}

	var sTextCode = sTextCodePrefix + sRole + "_" + sCode + sYou;
	var sText = textBundle.getText("uitexts", sTextCode, null, sLang, undefined, oHQTech);
	if (sText === sTextCode) {
		// failed to get a text
		sTextCode = sTextCodePrefix + sRole + "_" + sCode;
		sText = textBundle.getText("uitexts", sTextCode, null, sLang, undefined, oHQTech);
		if (sText === sTextCode) {
			// failed to get a text
			sTextCode = sTextCodePrefix + sCode;
			sText = textBundle.getText("uitexts", sTextCode, null, sLang, undefined, oHQTech);
			if (sText === sTextCode) {
				// failed again
				if (sCode && sCode.indexOf("STATUS_ACTION") === 0) {
					// this is an unknown status/phase change
					sText = textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_GENERIC_STATUS_ACTION", null, sLang, undefined, oHQTech);
				} else {
					sText = "";
				}
			}
			if (sCode && sCode.indexOf("STATUS_ACTION") === 0 && sCode.indexOf("EVAL_") < 0 && oNotification.OBJECT_TYPE_CODE === "IDEA") {
				var oIdea = getIdeaData(oHQ, oNotification.OBJECT_ID, true);
				sText += bEmail ? "<br />" : "\r\n";
				sText += textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_NEW_STATUS_CODE", null, sLang, undefined, oHQTech) + " " +
					getCodeText(oIdea.STATUS_CODE, "t_status", sLang);
				sText += bEmail ? "<br />" : "\r\n";
				sText += textBundle.getText("uitexts", "CTRL_NOTIFICATIONCTRL_TIT_NEW_PHASE_CODE", null, sLang, undefined, oHQTech) + " " + getCodeText(
					oIdea.PHASE_CODE, "t_phase", sLang);
			}
		}
	}

	oNotification.SUBTITLE = sText;
}

function getNotificationRelativeTimestamp(oNotification, sLang) {
	oNotification.EVENT_AT = Date.parse(oNotification.EVENT_AT);
	var sTimeStamp = oNotification.EVENT_AT;
	var iEventTime = new Date(sTimeStamp).getTime();

	if (iEventTime > iNow) {
		oNotification.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_FUTURE", null, sLang, undefined, oHQTech);
	} else if (iEventTime < iNow && iEventTime > iOneMinuteAgo) {
		oNotification.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_NOW", null, sLang, undefined, oHQTech);
	} else if (iEventTime <= iOneMinuteAgo && iEventTime > iTwoMinutesAgo) {
		oNotification.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_MINUTE", null, sLang, undefined, oHQTech);
	} else if (iEventTime <= iTwoMinutesAgo && iEventTime > iOneHourAgo) {
		oNotification.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_MINUTES", null, sLang, undefined, oHQTech);
	} else if (iEventTime <= iOneHourAgo && iEventTime > iTwoHoursAgo) {
		oNotification.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_HOUR", null, sLang, undefined, oHQTech);
	} else if (iEventTime <= iTwoHoursAgo && iEventTime > iSixHoursAgo) {
		oNotification.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_HOURS", null, sLang, undefined, oHQTech);
	} else if (iEventTime > iTodayStart) {
		oNotification.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_TODAY", null, sLang, undefined, oHQTech);
	} else if (iEventTime > iYesterdayStart) {
		oNotification.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_YESTERDAY", null, sLang, undefined, oHQTech);
	} else {
		var newDate = new Date(iEventTime);
		oNotification.RELATIVE_TIMESTAMP = newDate.toUTCString();
	}
}