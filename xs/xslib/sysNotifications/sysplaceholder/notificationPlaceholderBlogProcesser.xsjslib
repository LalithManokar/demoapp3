// notificationPlaceholderBlogProcesser.xsjslib
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function process(oHQ, oNotification, oResult, sLang) {
	if (!oResult.sContent || oResult.sContent.indexOf("{{CONTENT}}") < -1) {
		return;
	}
	var sSql =
		`SELECT SHORT_DESCRIPTION as CONTENT
FROM "sap.ino.db.blog::t_blog"
WHERE ID = ?;
`;
	var aResult = oHQ.statement(sSql).execute([oNotification.INVOLVED_ID]);
	if (aResult && aResult.length > 0) {
		CommonUtil.replacePlaceHolder(oResult, {
			"CONTENT": aResult[0].CONTENT
		});
	} else {
		CommonUtil.replacePlaceHolder(oResult, {
			"CONTENT": ""
		});
	}
}