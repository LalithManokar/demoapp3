const Message = $.import("sap.ino.xs.aof.lib", "message");
const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const Mail = $.import("sap.ino.xs.xslib", "mail");
const Feed = $.import("sap.ino.xs.xslib", "feed");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const Attachments = $.import("sap.ino.xs.xslib", "attachment_repository");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var Images;
var Host;

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
		sResult = SystemSettings.getValue("sap.ino.config.URL_PATH_UI_FRONTOFFICE", oHQ);
		if (!sResult) {
			return sResult;
		}
		return getHost(oHQ, true) + "/" + sResult;
	} else {
		sResult = SystemSettings.getValue("sap.ino.config.URL_PATH_UI_FRONTOFFICE", oHQ);
		if (!sResult) {
			return sResult;
		}
		return getHost(oHQ, false) + "/" + sResult;
	}
}, function(oHQ, bExternal) {
	return bExternal;
});

var getTemplateData = _.memoize(function(sTemplateCode, sLang) {
	var sTemplateData = "{{CONTENT}}";
	if (sTemplateCode !== null && sTemplateCode !== undefined) {
		sTemplateData = TextBundle.getTextBundleObject(
			"\"sap.ino.db.notification::t_mail_template_t\"", "MAIL_TEMPLATE_CODE", "TEMPLATE", "LANG", sLang, sTemplateCode
		)[0].CONTENT;
		if (typeof sTemplateData !== "string") {
			sTemplateData = $.util.stringify(sTemplateData);
		}
	}
	return sTemplateData;
});

function getObjectUrl(bExternal, sType, sId, oHQ) {
	var sUrl = getFrontofficeUrl(oHQ, bExternal);
	if (sUrl === null) {
		return null;
	}
	if (sType === "IDEA") {
		return sUrl + "/#idea/" + sId;
	} else if (sType === "CAMPAIGN") {
		return sUrl + "/#campaign/" + sId;
	}
	return sUrl;
}

function createFeedEntry(oHQ, oFeed) {
	var sSubtitle = (oFeed.TITLE || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	return ": <a href=\"" +
		getObjectUrl(oFeed.IS_EXTERNAL,
			oFeed.OBJECT_TYPE_CODE,
			oFeed.OBJECT_ID,
			oHQ) +
		"\">" +
		sSubtitle +
		"</a>";
}

function sendFeedMail(oHQ, sContent, oCurrentData) {
	sContent = sContent.replace(new RegExp("{{CAMPAIGN_TITLE_IMAGE}}", "g"), "cid:CAMPAIGN_TITLE_IMAGE");

	//use callback of replace to simulate a matchAll
	var aImages = [];
	var oRegex = /src="cid:([A-Z_ ]+)"/g;
	var sEmailTitle;
	var oSentFeeds = {
		IT_FEEDS: [{
			ID: oCurrentData.ID
		}]
	};

	sContent.replace(oRegex, function() {
		var oImage = getImage(oHQ, arguments[1], oCurrentData.CAMPAIGN_ID);
		if (oImage) {
			aImages.push(oImage);
		}
	});

	sContent = "<html><body>" + sContent + "</html></body>";
	if (oCurrentData.INVOLVED_ID === null && oCurrentData.FEED_CODE === 'STATUS_ACTION_SUBMIT') {
		sEmailTitle = "MSG_FEED_SUBJECT_STATUS_CHANGE";
	} else if (oCurrentData.INVOLVED_ID !== null && oCurrentData.FEED_CODE === 'STATUS_ACTION_SUBMIT') {
		sEmailTitle = "MSG_FEED_SUBJECT_STATUS_ACTION_SUBMIT";
	} else if (oCurrentData.FEED_CODE.indexOf('STATUS_ACTION') >= 0) {
		sEmailTitle = "MSG_FEED_SUBJECT_STATUS_CHANGE";
	} else {
		sEmailTitle = "MSG_FEED_SUBJECT_" + oCurrentData.FEED_CODE;
	}

	try {
		Mail.send(oCurrentData.EMAIL,
			TextBundle.getText("messages", sEmailTitle, [oCurrentData.TITLE], oCurrentData.LOCALE),
			sContent, undefined, aImages);
		oSentFeeds.IV_STATUS = 'SENT';

	} catch (e) {
		oSentFeeds.IV_STATUS = 'ERROR';
	} finally {
		oHQ.procedure("SAP_INO", "sap.ino.db.feed::p_feed_email_status_update").execute(oSentFeeds.IT_FEEDS, oSentFeeds.IV_STATUS);
	}

	oHQ.getConnection().commit();
}

function handleInstanceFeed(oHQ, sLink, oCurrentData) {
	var sContent, sSubTitle;

	sSubTitle = oCurrentData.SUBTITLE;
	// if(oCurrentData.FEED_CODE.indexOf('DATE_REACHED') !== 0) {
	//     sSubTitle = (oCurrentData.ACTOR_ID === 0 ? TextBundle.getText("nguii18n", "IDEA_OBJECT_TIT_IDEA_Anonymity", null, oCurrentData.LOCALE) : oCurrentData.ACTOR_NAME)  + " " + sSubTitle;
	// }
	if (oCurrentData.SUB_TEXT) {
		sContent = TextBundle.getText("messages", "MSG_FEED_INST_MAIL_BODY_WITH_ABSTRACT", [oCurrentData.NAME, sSubTitle, oCurrentData.SUB_TEXT],
			oCurrentData.LOCALE);
	} else {
		sContent = TextBundle.getText("messages", "MSG_FEED_INST_MAIL_BODY", [oCurrentData.NAME, sSubTitle], oCurrentData.LOCALE);
	}
	var sTemplate = getTemplateData(getCampaignData(oHQ, oCurrentData.CAMPAIGN_ID).MAIL_TEMPLATE_CODE, oCurrentData.LOCALE);
	sContent = sTemplate.replace("{{CONTENT}}", sContent);
	sendFeedMail(oHQ, sContent, oCurrentData);
}

function execute(oHQ, oConn) {
	Message.createMessage(Message.MessageSeverity.Info, "MSG_BATCH_MAIL_STARTED");

	try {
		//load Feeds that shall be sent
// 		var procedure = oHQ.procedure("SAP_INO", "sap.ino.db.feed::p_feed_instance_email");
// 		var result = procedure.execute({});
// 		var aFeeds = Feed.getFeedTextDataBatch(result.OT_FEEDS);
        var aFeeds = [];
		var sContent = "";

		var oFeed;
		for (var i = 0; i < aFeeds.length; i++) {
			oFeed = aFeeds[i];
			//if the campaign or the user has changed the content of the mail is complete and will be sent
			sContent = createFeedEntry(oHQ, oFeed);
			handleInstanceFeed(oHQ, sContent, oFeed);
		}
		oConn.commit();
	} catch (e) {
		Message.createMessage(
			Message.MessageSeverity.Error,
			"MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, e.toString());
		oConn.rollback();
		throw e;
	}
}

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
var getImage1 = _.memoize(function(oHQ, sCID) {
	var oImage = {
		CID: sCID
	};

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

	return oImage;
}, function(oHQ, sCID) {
	return sCID;
});

var getCampaignData = _.memoize(function(oHQ, iCampaignID) {
	var oCampaign = {
		ID: iCampaignID,
		COLOR: "#FFFFFF"
	};

	if (iCampaignID) {
		var sStatement =
			"select campaign.color_code, campaign.mail_template_code, attachment.attachment_id as image " +
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

		}
	}

	return oCampaign;
}, function(oHQ, iCampaignID, sLang, bCeckAuth) {
	return iCampaignID + "-" + sLang + "-" + bCeckAuth;
});