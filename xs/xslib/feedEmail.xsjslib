const Message = $.import("sap.ino.xs.aof.lib", "message");
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
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

function createFeedEntry(oHQ, oFeed, oCurrentData) {
	var sSubtitle = (oFeed.SUBTITLE || "");
	return "<li>" +
		sSubtitle +
		"</li>";
}

function sendFeedMail(oHQ, sContent, oCurrentData, oSentFeeds) {
	// sContent = sContent.replace(RegularExpression.CAMPAIGN_TITLE_IMAGE, "cid:CAMPAIGN_TITLE_IMAGE");

	//use callback of replace to simulate a matchAll
	var aImages = [];
	var oRegex = /src="cid:([A-Z_ ]+)"/g;

	sContent.replace(oRegex, function() {
		var oImage = getImage(oHQ, arguments[1], oCurrentData.CAMPAIGN_ID);
		if (oImage) {
			aImages.push(oImage);
		}
	});

	sContent = "<html><body>" + sContent + "</html></body>";
	try {
		Mail.send(oCurrentData.EMAIL,
			TextBundle.getText("messages", "MSG_FEED_SUBJECT", null, oCurrentData.LOCALE),
			sContent, undefined, aImages);
		oSentFeeds.IV_STATUS = 'SENT';

	} catch (e) {
		TraceWrapper.fatal("feedEmail.xsjslib--" + "\r\nEMAIL:" + oCurrentData.EMAIL + "--\r\nsContent:" + sContent);
		TraceWrapper.log_exception(e);
		oSentFeeds.IV_STATUS = 'ERROR';
	} finally {
		oHQ.procedure("SAP_INO", "sap.ino.db.feed::p_feed_email_status_update").execute(oSentFeeds.IT_FEEDS, oSentFeeds.IV_STATUS);
	}

	oHQ.getConnection().commit();
}

function handleBundleFeed(oHQ, sContent, oCurrentData, oSentFeeds) {
	var sTemplateCode = SystemSettings.getValue("sap.ino.config.FOLLOW_EMAIL_TEMPLATE", oHQ);
	var sTemplate = getTemplateData(sTemplateCode, oCurrentData.LOCALE);
	if (sTemplate && sTemplate.indexOf("{{USER_NAME}}") > -1) {
		sContent = sTemplate.replace("{{USER_NAME}}", oCurrentData.NAME).replace("{{CONTENT}}", sContent);
	} else {
		sContent = TextBundle.getText("messages", "MSG_FEED_BODY", [oCurrentData.NAME, sContent], oCurrentData.LOCALE);
	}
	sContent = sTemplate.replace("{{CONTENT}}", sContent);
	//sContent = replaceCampaignData(oHQ, sContent, oCurrentData.CAMPAIGN_ID, oCurrentData.LOCALE);
	sendFeedMail(oHQ, sContent, oCurrentData, oSentFeeds);
}

function execute(oHQ, oConn) {
	Message.createMessage(Message.MessageSeverity.Info, "MSG_BATCH_MAIL_STARTED");

	try {
		var sResult = SystemSettings.getValue("sap.ino.config.SWITCH_OFF_FEED_EMAIL", oHQ);
		if (sResult && Number(sResult) === 1) {
			oHQ.statement(
				'update "sap.ino.db.feed::t_feed_status" set mail_status_code = \'SKIPPED\', CHANGED_AT = CURRENT_UTCTIMESTAMP WHERE mail_status_code = \'UNSENT\''
			).execute();
			oConn.commit();
			return;
		}
		//load Feeds that shall be sent
		var procedure = oHQ.procedure("SAP_INO", "sap.ino.db.feed::p_feed_service_email");
		var result = procedure.execute({});
		var aFeeds = Feed.getFeedTextDataBatch(result.OT_FEEDS);
		var sContent = "";
		var oCurrentData;
		var oSentFeeds = {
			IT_FEEDS: []
		};
		if (aFeeds.length > 0) {
			oCurrentData = aFeeds[0];
		}
		var oFeed;
		for (var i = 0; i < aFeeds.length; i++) {
			oFeed = aFeeds[i];
			//if the campaign or the user has changed the content of the mail is complete and will be sent
			if ((oCurrentData.FOLLOWED_BY_ID !== oFeed.FOLLOWED_BY_ID)) {
				if (sContent !== "") {
					handleBundleFeed(oHQ, "<ul>" + sContent + "</ul>", oCurrentData, oSentFeeds);
				}

				//reset the cached data
				sContent = "";
				oCurrentData = oFeed;
				oSentFeeds = {
					IT_FEEDS: []
				};
			}

			// 			if (oFeed.FEED_CODE.indexOf('DATE_REACHED') < 0 &&
			// 				(oFeed.FEED_CODE.indexOf('STATUS_ACTION') !== 0 || oFeed.FEED_CODE.indexOf('sap.ino.config.EVA') >= 0) &&
			// 				oFeed.FEED_CODE !== 'BLOG_MAJORPUBLISH') {
			sContent += createFeedEntry(oHQ, oFeed, oCurrentData);
			oSentFeeds.IT_FEEDS.push({
				ID: oFeed.ID
			});
			//			}

		}
		if (sContent !== "") {
			handleBundleFeed(oHQ, "<ul>" + sContent + "</ul>", oCurrentData, oSentFeeds);
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

var getImage = _.memoize(function(oHQ, sCID) {
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