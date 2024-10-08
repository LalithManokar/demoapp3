var oSI = $.import("sap.ino.xs.xslib", "SimilarIdeas");
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const textBundle = $.import("sap.ino.xs.xslib", "textBundle");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

var oGeneralConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oGeneralHq = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oGeneralConn).setSchema('SAP_INO_EXT');
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
var Host;

var getHost = _.memoize(function(oHq, bExternal) {
	if (Host) {
		return Host;
	}

	if (bExternal) {
		var sExternalHost = SystemSettings.getIniValue("host_external", oHq);
		if (sExternalHost) {
			return sExternalHost;
		} else {
			return getHost(oHq, false);
		}
	}
	return SystemSettings.getIniValue("host", oHq);
}, function(oHq, bExternal) {
	return bExternal;
});

var getFrontofficeUrl = _.memoize(function(oHq, bExternal) {
	var sResult;
	if (bExternal) {
		sResult = SystemSettings.getValue("sap.ino.config.URL_PATH_UI_FRONTOFFICE", oHq);
		if (!sResult) {
			return sResult;
		}
		return getHost(oHq, true) + "/" + sResult;
	} else {
		sResult = SystemSettings.getValue("sap.ino.config.URL_PATH_UI_FRONTOFFICE", oHq);
		if (!sResult) {
			return sResult;
		}
		return getHost(oHq, false) + "/" + sResult;
	}
}, function(oHq, bExternal) {
	return bExternal;
});

function getFeedTextDataBatch(aFeeds) {
	var aLanguages = _.map(aFeeds, function(oFeed) {
		return oFeed.LOCALE;
	});
	var aUniqueLanguages = _.uniq(aLanguages);
	_.each(aUniqueLanguages, function(sLanguage) {
		textBundle.preloadText("nguii18n", "%FEED%", sLanguage, undefined, oHQTech);
	});
	_.each(aFeeds, function(oFeed) {
		getFeedTitle(oFeed, oFeed.LOCALE);
		getFeedSubTitle(oFeed, oFeed.LOCALE);
		getFeedRelativeTimestamp(oFeed, oFeed.LOCALE);
	});

	return aFeeds;
}

function getFeedTitle(oFeed) {
	var sObjectText = oFeed.OBJECT_TEXT;
	oFeed.TITLE = sObjectText;
}

function getLocaleDate(sDate, sLang) {
	var oDate = new Date(sDate);
	return oDate.toLocaleDateString(sLang);
}

// function getFeedSubTitle(oFeed, sLang) {
//     var sMsgKey, sParam0, sObjectName;
// 	sMsgKey = oFeed.OBJECT_TYPE_CODE + "_FEEDS_MSG_" + oFeed.FEED_CODE;
//         if(oFeed.INVOLVED_OBJ_TYPE_CODE){
// 			sMsgKey = sMsgKey + '_' + oFeed.INVOLVED_OBJ_TYPE_CODE;
// 		} 
// 		sParam0 = oFeed.SUB_TEXT;
// 		sObjectName = oFeed.OBJECT_TEXT;
// 		if(oFeed.OBJECT_TYPE_CODE === 'IDEA' && oFeed.FEED_CODE.indexOf('STATUS_ACTION')=== 0){
// 			sMsgKey = oFeed.OBJECT_TYPE_CODE + "_FEEDS_MSG_" + 'STATUS_CHANGE';
// 	    }
// 		if(oFeed.OBJECT_TYPE_CODE === 'IDEA' && oFeed.FEED_CODE.indexOf('COPIED_TARGET') > 0){
// 		    sMsgKey = oFeed.OBJECT_TYPE_CODE + "_FEEDS_MSG_" + 'COPIED_TARGET';
// 		}

//     oFeed.SUBTITLE = textBundle.getText("nguii18n", sMsgKey, [sObjectName, sParam0], sLang, undefined, oHQTech);
//     return;

// }

function feedObjectTypeFormatter(sObjectType, sLang) {
	if (!sObjectType) {
		return;
	}
	return textBundle.getText("nguii18n", "FEEDS_FLD_OBJECT_TYPE_" + sObjectType, [], sLang, undefined, oHQTech);
}

function feedFieldNameFormatter(sFieldName, sLang) {
	if (!sFieldName) {
		return;
	}
	return textBundle.getText("nguii18n", "FEEDS_FLD_NAME_" + sFieldName, [], sLang, undefined, oHQTech);
}

function feedFieldValueFormatter(sValueType, sValue, sLang) {
	if (!sValueType || !sValue) {
		return;
	}
	if (sValueType === "BOOLEAN") {
		//TODO: add textbundle for "true" or "false"
		return Number(sValue) ? "true" : "false";
	}
	if (sValueType === "DATE") {
		sValue = sValue.split(".");
		sValue = sValue[0].replace(/-/g, "/");
		return getLocaleDate(sValue, sLang);
	}
	return;
}

function feedObjectLinkFormatter(sObjectId, sObjectName, sObjectType) {
	if (!sObjectId || !sObjectName || !sObjectType) {
		return;
	}
	var sResult;
	switch (sObjectType) {
		case "IDEA":
			sResult = "<a href='" + getObjectUrl(false, sObjectType, sObjectId, oGeneralHq) +
				"' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link'>" +
				sObjectName + "</a>";
			break;
		case "WALL":
			sResult = "<a href='" + getObjectUrl(false, sObjectType, sObjectId, oGeneralHq) +
				"' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link'>" +
				sObjectName + "</a>";
			break;
		case "CAMPAIGN":
			sResult = "<a href='" + getObjectUrl(false, sObjectType, sObjectId, oGeneralHq) +
				"' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link'>" +
				sObjectName + "</a>";
			break;
		case "EVALUATION":
			sResult = "<a href='" + getObjectUrl(false, sObjectType, sObjectId, oGeneralHq) +
				"' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link' target='_blank'>" + sObjectName + "</a>";
			break;
		case "BLOG":
			sResult = "<a href='" + getObjectUrl(false, sObjectType, sObjectId, oGeneralHq) +
				"' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link' target='_blank'>" + sObjectName + "</a>";
			break;
		case "LINK":
			sResult = "<a href='" + sObjectId + "' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link' target='_blank'>" + sObjectName + "</a>";
			break;
		default:
			sResult = sObjectName;
			break;
	}
	return sResult;
}

function getFeedRelativeTimestamp(oFeed, sLang) {
	oFeed.EVENT_AT = Date.parse(oFeed.EVENT_AT);
	var sTimeStamp = oFeed.EVENT_AT;
	var iEventTime = new Date(sTimeStamp).getTime();

	if (iEventTime > iNow) {
		oFeed.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_FUTURE", null, sLang, undefined, oHQTech);
	} else if (iEventTime < iNow && iEventTime > iOneMinuteAgo) {
		oFeed.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_NOW", null, sLang, undefined, oHQTech);
	} else if (iEventTime <= iOneMinuteAgo && iEventTime > iTwoMinutesAgo) {
		oFeed.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_MINUTE", null, sLang, undefined, oHQTech);
	} else if (iEventTime <= iTwoMinutesAgo && iEventTime > iOneHourAgo) {
		oFeed.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_MINUTES", null, sLang, undefined, oHQTech);
	} else if (iEventTime <= iOneHourAgo && iEventTime > iTwoHoursAgo) {
		oFeed.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_HOUR", null, sLang, undefined, oHQTech);
	} else if (iEventTime <= iTwoHoursAgo && iEventTime > iSixHoursAgo) {
		oFeed.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_HOURS", null, sLang, undefined, oHQTech);
	} else if (iEventTime > iTodayStart) {
		oFeed.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_TODAY", null, sLang, undefined, oHQTech);
	} else if (iEventTime > iYesterdayStart) {
		oFeed.RELATIVE_TIMESTAMP = textBundle.getText("uitexts", "CTRL_RELATIVEDATE_SEL_YESTERDAY", null, sLang, undefined, oHQTech);
	} else {
		var newDate = new Date(iEventTime);
		oFeed.RELATIVE_TIMESTAMP = newDate.toUTCString();
	}
}

function getObjectUrl(bExternal, sType, sId) {
	var sUrl = getFrontofficeUrl(oGeneralHq, bExternal);
	if (sUrl === null) {
		return null;
	}
	if (sType === "IDEA") {
		return sUrl + "/#idea/" + sId;
	}
	if (sType === "CAMPAIGN") {
		return sUrl + "/#campaign/" + sId;
	}
	if (sType === "BLOG") {
		return sUrl + "/#blog/" + sId;
	}
	if (sType === "EVALUATION") {
		return sUrl + "/#evaluation/" + sId;
	}
	if (sType === "WALL") {
		return sUrl + "/#wall/" + sId;
	}
	return sUrl;
}

function spanWrapperFormatter(sText) {
	return sText ? "<span>" + sText + "</span>" : "";
}

function getTextBundleText(sObject, sCode, sLang) {
	var sObjectType;
	var aText = [];
	switch (sObject) {
		case 'sap.ino.xs.object.campaign.Phase.Root':
			sObjectType = 't_phase';
			break;
		case 'sap.ino.xs.object.status.Status.Root':
			sObjectType = 't_status';
			break;
		case 'sap.ino.xs.object.campaign.VoteType.Root':
			sObjectType = 't_vote_type';
			break;
		case 'sap.ino.xs.object.basis.Unit.Root':
			sObjectType = 't_unit';
			break;
		case 'sap.ino.xs.object.status.Model.Root':
			sObjectType = 't_status_model';
			break;
		case 'sap.ino.xs.object.evaluation.AutoPublication.Root':
			sObjectType = 't_auto_publication';
			break;
		case 'sap.ino.xs.object.evaluation.Model.Root':
			sObjectType = 't_model';
			break;
		case 'sap.ino.xs.object.subresponsibility.ResponsibilityStage.Root':
			sObjectType = 't_responsibility_stage';
			break;
		case 'sap.ino.xs.object.ideaform.IdeaForm.Root':
			sObjectType = 't_form';
			break;
		default:
			if (sObject.indexOf("sap.ino.xs.object.basis.ValueOptionList.Root") >= 0) {
				var sValueOptionListCode = sObject.replace("sap.ino.xs.object.basis.ValueOptionList.Root_", "");
				var sStatement = 'select * from "sap.ino.db.basis::t_value_option" where LIST_CODE = ?';
				var aValueOption = oGeneralHq.statement(sStatement).execute(sValueOptionListCode);
				_.each(aValueOption, function(oValueOption) {
					if ((oValueOption.TEXT_VALUE && oValueOption.TEXT_VALUE === sCode) ||
						(oValueOption.NUM_VALUE && oValueOption.NUM_VALUE.toString() === sCode) ||
						(oValueOption.BOOL_VALUE && oValueOption.BOOL_VALUE.toString() === sCode)) {
						sCode = oValueOption.CODE;
					}
				});
				sObjectType = 't_value_option';
			}
			break;
	}
	if (sObjectType) {
		aText = textBundle.getExtensibleTextBundleObject(sObjectType, sLang, sCode);
	}
	return aText[0] && aText[0].CONTENT;
}

function getFeedSubTitle(oValue, sLang) {
	var sResult, sMsgKey;
	if (!oValue || !oValue.FEED_CODE) {
		return;
	}

	var sAction = oValue.FEED_CODE,
		sObjectName = (oValue.OBJECT_TEXT || "").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
		sObjectId = oValue.OBJECT_ID,
		sObjectType = oValue.OBJECT_TYPE_CODE,
		sInvolvedObjectName = (oValue.INVOLVED_OBJ_TEXT || "").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
		sInvolvedObjectId = oValue.INVOLVED_ID,
		sInvolvedObjectType = oValue.INVOLVED_OBJ_TYPE_CODE,
		sFieldOneValue = oValue.FIELD1_VALUE,
		sFieldOneName = oValue.FIELD1_NAME,
		sFieldOneText = oValue.FIELD1_TEXT,
		sFieldOneValueOption = oValue.FIELD1_VALUE_OPTION,
		sFieldTwoValue = oValue.FIELD2_VALUE,
		sFieldTwoName = oValue.FIELD2_NAME,
		sFieldTwoText = oValue.FIELD2_TEXT,
		sFieldTwoValueOption = oValue.FIELD2_VALUE_OPTION,
		sContent = oValue.CONTENT,
		sObjectLink,
		sInvolvedObjectLink,
		sActor = oValue.ACTOR_NAME;
	if (oValue.ACTOR_ID === 0) {
		sActor = "";
		sActor = textBundle.getText("nguii18n", "IDEA_OBJECT_TIT_IDEA_Anonymity", null, sLang);
	}

	sObjectLink = feedObjectLinkFormatter(sObjectId, sObjectName, sObjectType, sLang);
	sInvolvedObjectName = sInvolvedObjectType === "EVALUATION" ? feedObjectTypeFormatter(sInvolvedObjectType, sLang) : sInvolvedObjectName;
	sInvolvedObjectId = sInvolvedObjectType === "LINK" ? sContent : sInvolvedObjectId;
	sInvolvedObjectLink = feedObjectLinkFormatter(sInvolvedObjectId, sInvolvedObjectName, sInvolvedObjectType, sLang);
	// action name
	if (sAction.indexOf("STATUS_ACTION") === 0) { //status change
		if (sAction.indexOf("SUBMIT") > 0) {
			sAction = "STATUS_ACTION_SUBMIT";
		} else if (sAction.indexOf("EVAL") > 0) {
			sAction = "STATUS_ACTION" + "_EVAL";
		} else {
			sAction = "STATUS_ACTION";
		}
	}
	if (sAction.indexOf("CAMP_MAJOR_PUBLISH") === 0) { //campaign major publish
		sAction = "ACTION_FLD_COMPAIGN_MAJOR_CHANGE";
	}
	if (sAction.indexOf("IDEA_RELATION") === 0) { //idea relation change
		sAction = sAction.substr(sAction.lastIndexOf(".") + 1);
	}

	// field name/value
	if (sFieldOneText === "IDEA_FORM") { //idea form field change
		sAction = "ACTION_IDEA_FORM";
		if (["BOOLEAN", "DATE"].indexOf(sFieldOneValueOption) >= 0) {
			sFieldOneValue = feedFieldValueFormatter(sFieldOneValueOption, sFieldOneValue, sLang);
		} else if (sFieldOneValueOption) {
			sFieldOneValue = sFieldOneValueOption ? getTextBundleText(sFieldOneValueOption, sFieldOneValue, sLang) : sFieldOneValue;
		}

		if (["BOOLEAN", "DATE"].indexOf(sFieldTwoValueOption) >= 0) {
			sFieldTwoValue = feedFieldValueFormatter(sFieldTwoValueOption, sFieldTwoValue, sLang);
		} else if (sFieldTwoValueOption) {
			sFieldTwoValue = sFieldTwoValueOption ? getTextBundleText(sFieldTwoValueOption, sFieldTwoValue, sLang) : sFieldTwoValue;
		}

	} else { //normal field change
		if (["BOOLEAN", "DATE"].indexOf(sFieldOneValueOption) >= 0) {
			sFieldOneValue = feedFieldValueFormatter(sFieldOneValueOption, sFieldOneValue, sLang);
		} else if (sFieldOneValueOption) {
			sFieldOneValue = getTextBundleText(sFieldOneValueOption, sFieldOneValue, sLang);
		}
		if (["BOOLEAN", "DATE"].indexOf(sFieldTwoValueOption) >= 0) {
			sFieldTwoValue = feedFieldValueFormatter(sFieldTwoValueOption, sFieldTwoValue, sLang);
		} else if (sFieldTwoValueOption) {
			sFieldTwoValue = getTextBundleText(sFieldTwoValueOption, sFieldTwoValue, sLang);
		}
		sFieldOneName = sFieldOneText ? this.feedFieldNameFormatter(sFieldOneText) : sFieldOneName;
		sFieldTwoName = sFieldTwoText ? this.feedFieldNameFormatter(sFieldTwoText) : sFieldTwoName;
	}

	sObjectType = feedObjectTypeFormatter(sObjectType, sLang);
	sInvolvedObjectType = feedObjectTypeFormatter(sInvolvedObjectType, sLang);

	sMsgKey = "FEEDS_MSG_" + sAction;

	sResult = textBundle.getText("nguii18n", sMsgKey, [spanWrapperFormatter(sObjectType), sObjectLink, spanWrapperFormatter(
			sInvolvedObjectType), sInvolvedObjectLink,
	    spanWrapperFormatter(sFieldOneName), spanWrapperFormatter(sFieldOneValue), spanWrapperFormatter(sFieldTwoName), spanWrapperFormatter(
			sFieldTwoValue), spanWrapperFormatter(sActor)], sLang, undefined, oHQTech);

	oValue.SUBTITLE = spanWrapperFormatter(sResult);
	return;
}

function getCampaignFeed(iCampaignId, iLength) {
	var oResult = {};
	var oResponse = {
		status: $.net.http.OK,
		body: oResult
	};
	var sStatement;

	if (iLength) {
		sStatement = "select top " + iLength + " * from \"sap.ino.db.campaign::v_campaign_biz_feeds\" where object_id = ?" +
			" and ((filter_type_code = 'FRONTOFFICE' and object_id in (select campaign_id from \"sap.ino.db.campaign::v_auth_campaigns\") AND (INVOLVED_OBJ_TYPE_CODE <> 'IDEA' or INVOLVED_OBJ_TYPE_CODE is null)) or" +
			"(filter_type_code = 'FRONTOFFICE' and object_id in (select campaign_id from \"sap.ino.db.campaign::v_auth_campaigns\") and INVOLVED_OBJ_TYPE_CODE = 'IDEA' and INVOLVED_ID IN (SELECT IDEA_ID FROM \"sap.ino.db.idea::v_auth_ideas\")) or " +
			" (filter_type_code = 'BACKOFFICE' and object_id in (select campaign_id from \"sap.ino.db.campaign::v_auth_backoffice_campaign_privilege\")) or" +
			" (filter_type_code = 'REGISTRATION' and object_id in (select campaign_id from \"sap.ino.db.campaign::v_auth_registration_campaign_privilege\")))" +
			" order by event_at desc";

	} else {
		sStatement = 'select * from "sap.ino.db.campaign::v_campaign_biz_feeds" where object_id = ?' +
			" and ((filter_type_code = 'FRONTOFFICE' and object_id in (select campaign_id from \"sap.ino.db.campaign::v_auth_campaigns\") AND (INVOLVED_OBJ_TYPE_CODE <> 'IDEA' or INVOLVED_OBJ_TYPE_CODE is null)) or" +
			"(filter_type_code = 'FRONTOFFICE' and object_id in (select campaign_id from \"sap.ino.db.campaign::v_auth_campaigns\") and INVOLVED_OBJ_TYPE_CODE = 'IDEA' and INVOLVED_ID IN (SELECT IDEA_ID FROM \"sap.ino.db.idea::v_auth_ideas\")) or " +
			" (filter_type_code = 'BACKOFFICE' and object_id in (select campaign_id from \"sap.ino.db.campaign::v_auth_backoffice_campaign_privilege\")) or" +
			" (filter_type_code = 'REGISTRATION' and object_id in (select campaign_id from \"sap.ino.db.campaign::v_auth_registration_campaign_privilege\")))" +
			" order by event_at desc";

	}
	oResult.results = oGeneralHq.statement(sStatement).execute(iCampaignId);

	return oResponse;
}

function _createDateReachableFeed(oDbHq, oDbConn) {
	//create date reach feed
	const createFeedDateProcedure = oDbHq.procedure("SAP_INO", "sap.ino.db.feed::p_campaign_dates_feed");
	createFeedDateProcedure.execute({});
	oDbConn.commit();
}

function _createGeneralFeed(oDbHq, oDbConn) {
	//create new feed on idea, campaign, tag change
	const createFeedProcedure = oDbHq.procedure("SAP_INO", "sap.ino.db.feed::p_feed_create");
	createFeedProcedure.execute({});
	oDbConn.commit();
}

function _createGeneralFeedStatus(oDbHq, oDbConn) {
	//create feed status on new feed
	var sStatement = "select distinct object_id, object_type_code, campaign_id from \"sap.ino.db.feed::t_feed_update\" where is_new = 1";
	var aFeeds = oDbHq.statement(sStatement).execute();
	const createFeedStatusProcedure = oDbHq.procedure("SAP_INO", "sap.ino.db.feed::p_feed_status_create");

	_.each(aFeeds, function(oFeed) {
		createFeedStatusProcedure.execute({
			iv_object_id: oFeed.OBJECT_ID,
			iv_object_type_code: oFeed.OBJECT_TYPE_CODE,
			iv_campaign_id: oFeed.CAMPAIGN_ID
		});
		oDbConn.commit();
	});
}

function _cleanOrphanedFeed(oDbHq, oDbConn) {
	//clean up feed
	const feedCleanupProcedure = oDbHq.procedure("SAP_INO", "sap.ino.db.feed::p_feed_cleanup");
	feedCleanupProcedure.execute({});
	oDbConn.commit();
}

function createFeed(oDbHq, oDbConn) {
// 	var sResult = SystemSettings.getValue("sap.ino.config.SWITCH_OFF_FEED_EMAIL", oDbHq);
// 	if (sResult && Number(sResult) === 1) {
// 	    oDbHq.procedure("SAP_INO", "sap.ino.db.feed::p_feed_latest_time").execute({});
// 	    oDbConn.commit();
// 		return;
// 	}
	_createDateReachableFeed(oDbHq, oDbConn);
	_createGeneralFeed(oDbHq, oDbConn);
	_createGeneralFeedStatus(oDbHq, oDbConn);
	_cleanOrphanedFeed(oDbHq, oDbConn);
}