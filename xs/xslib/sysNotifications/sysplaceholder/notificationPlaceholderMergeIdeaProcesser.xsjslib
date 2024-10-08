const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const HostUrlProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationHostUrlProcesser");

function _getData(oHQ, oNotification) {
	if (oNotification.NOTIFICATION_CODE === "IDEA_RELATION_sap.ino.config.MERGED_TARGET") {
		// source idea notification
		return _getIdeaInfo(oHQ, oNotification.INVOLVED_ID, [oNotification.OBJECT_ID]);

	} else if (oNotification.NOTIFICATION_CODE === "IDEA_RELATION_sap.ino.config.MERGED_SOURCE") {
		// leading idea notification
		return _getIdeaInfo(oHQ, oNotification.OBJECT_ID, oNotification.HISTORY_OBJECT_INFO.split(',').map(function(sIdeaId) {
			sIdeaId = sIdeaId.split("_")[0];
			return parseInt(sIdeaId, 10);
		}));
	}
}

function _getIdeaInfo(oHQ, iLeadingId, aSourceIds) {
	var sSqlLeading =
		`
    SELECT idea.id, 
	idea.name AS LEADING_IDEA_NAME, 
	status.default_text AS LEADING_IDEA_STATUS
FROM "sap.ino.db.idea::t_idea" AS idea
	INNER JOIN "sap.ino.db.status::t_status" AS status
	ON idea.status_code = status.code
    WHERE idea.ID = ? 
`;
	var sSqlSource = `
   SELECT idea.id, 
	idea.name AS SOURCE_IDEA_NAME
FROM "sap.ino.db.idea::t_idea" AS idea
WHERE 1 != 1 
`;
	var oLeadingIdea = oHQ.statement(sSqlLeading).execute(iLeadingId)[0];
	if (aSourceIds && aSourceIds.length > 0) {
		_.each(aSourceIds, function() {
			sSqlSource += ' OR idea.ID = ? ';
		});
	}
	var aSourceIdeas = oHQ.statement(sSqlSource).execute(aSourceIds);

	return {
		sourceIdeas: aSourceIdeas,
		leadingIdea: oLeadingIdea
	};
}

function _getIdeaLinkText(oHQ, sNotifiCode, iId, sIdeaName) {
	return HostUrlProcesser.getData(oHQ, true, "IDEA", iId, sNotifiCode, sIdeaName);
}

function process(oHQ, oNotification, oResult) {
	if (!oResult.sContent) {
		return;
	}
	var oData = _getData(oHQ, oNotification);
	var oNewData = {
		"LEADING_IDEA_STATUS": oData.leadingIdea.LEADING_IDEA_STATUS
	};
	oNewData.LEADING_IDEA_NAME = _getIdeaLinkText(oHQ, oNotification.notification_code, oData.leadingIdea.ID, oData.leadingIdea.LEADING_IDEA_NAME);
	oNewData.SOURCE_IDEA_NAME = "";
	oData.sourceIdeas.forEach(function(oIdea) {
		oNewData.SOURCE_IDEA_NAME += _getIdeaLinkText(oHQ, oNotification.notification_code, oIdea.ID, oIdea.SOURCE_IDEA_NAME) + ";";
	});
	if (oNewData.SOURCE_IDEA_NAME && oNewData.SOURCE_IDEA_NAME.length > 1) {
		oNewData.SOURCE_IDEA_NAME = oNewData.SOURCE_IDEA_NAME.substr(0, oNewData.SOURCE_IDEA_NAME.length - 1);
	}

	_.each(oNewData, function(sAttribute, sKey) {
		oResult.sContent = oResult.sContent.replace(CommonUtil.RegularExpression[sKey], sAttribute);
	});
}