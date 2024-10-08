// notificationPlaceholderAuthorProcesser.xsjslib
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function process(oHQ, oNotification, oResult, oIdea, sLang) {
	if (!oResult.sContent || oResult.sContent.indexOf("{{AUTHOR_") < -1 || !oIdea) {
		return;
	}
	var sSql =
		`SELECT * FROM (SELECT -1 AS IDENTITY_ID, 
	idea.id AS IDEA_ID
FROM "sap.ino.db.idea::t_idea" AS IDEA
	LEFT OUTER JOIN "sap.ino.db.idea::t_ideas_setting" AS SETTING
	ON IDEA.ID = SETTING.IDEA_ID
WHERE SETTING.IDEA_ID IS NULL

UNION

SELECT RL.IDENTITY_ID, 
	SETTING.IDEA_ID
FROM "sap.ino.db.idea::t_ideas_setting" AS SETTING
	INNER JOIN "sap.ino.db.iam::t_object_identity_role" AS RL
	ON SETTING.IDEA_ID = RL.OBJECT_ID
		AND RL.OBJECT_TYPE_CODE = 'IDEA'
WHERE ANONYMOUS_FOR = 'NONE'
	OR ((ANONYMOUS_FOR = 'ALL'
		OR ANONYMOUS_FOR = 'PARTLY')
	AND (ROLE_CODE = 'IDEA_SUBMITTER'
		OR ROLE_CODE = 'IDEA_CONTRIBUTOR'))

UNION

SELECT RL.IDENTITY_ID, 
SETTING.IDEA_ID
FROM "sap.ino.db.idea::t_idea" AS IDEA
INNER JOIN "sap.ino.db.idea::t_ideas_setting" AS SETTING
ON IDEA.ID = SETTING.IDEA_ID
INNER JOIN "sap.ino.db.iam::v_object_identity_role_transitive" AS RL
ON IDEA.CAMPAIGN_ID = RL.OBJECT_ID
	AND RL.OBJECT_TYPE_CODE = 'CAMPAIGN'
WHERE (ANONYMOUS_FOR = 'PARTLY'
AND ROLE_CODE = 'CAMPAIGN_MANAGER')
OR ANONYMOUS_FOR = 'NONE')
WHERE (IDENTITY_ID = -1 OR IDENTITY_ID = ?) AND IDEA_ID = ?
`;
	var aResult = oHQ.statement(sSql).execute([oIdea.AUTHOR_ID, oIdea.IDEA_ID]);
	if (aResult && aResult.length > 0) {
		CommonUtil.replacePlaceHolder(oResult, CommonUtil.getIdentity(oHQ, oIdea.AUTHOR_ID), "AUTHOR_");
	} else {
		var sAnonymity = CommonUtil.getCodeText("IDEA_OBJECT_TIT_IDEA_Anonymity", 'nguii18n', sLang);
		CommonUtil.replacePlaceHolder(oResult, {
			"NAME": sAnonymity,
			"FIRST_NAME": sAnonymity,
			"LAST_NAME": sAnonymity,
			"PHONE": sAnonymity,
			"MOBILE": sAnonymity,
			"EMAIL": sAnonymity
		}, "AUTHOR_");
		if (oNotification.ACTION_CODE === "SUBMIT_IDEA") {
			CommonUtil.replacePlaceHolder(oResult, {
				"NAME": sAnonymity,
				"FIRST_NAME": sAnonymity,
				"LAST_NAME": sAnonymity,
				"PHONE": sAnonymity,
				"MOBILE": sAnonymity,
				"EMAIL": sAnonymity
			}, "ACTOR_");
		}
	}
}