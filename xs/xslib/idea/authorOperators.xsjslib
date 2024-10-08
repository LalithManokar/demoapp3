(function(exports) {
	"use strict";

    const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
    var oMsg = $.import("sap.ino.xs.aof.lib", "message");
	var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	var oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn).setSchema('SAP_INO');

	function responseError(sMsg) {
		return {
			success: false,
			msg: sMsg
		};
	}

	function getAuthorList(reqBody) {
		if (!reqBody.CampaignId || !_.isInteger(reqBody.CampaignId)) {
			return responseError(oMsg.PARAM_MISSING_CAMPAIGN_ID);
		}
		if (!reqBody.OriginAuthorId || !_.isInteger(reqBody.OriginAuthorId)) {
			return responseError(oMsg.PARAM_MISSING_ORIGIN_AUTHOR_ID);
		}
		var sSQL =
			`
SELECT DISTINCT I.ID, 
	I.NAME
FROM "sap.ino.db.iam::t_identity" AS I
	INNER JOIN "sap.ino.db.iam::v_object_identity_role_transitive" AS RO
	ON I.ID = RO.IDENTITY_ID
WHERE OBJECT_ID = ? AND I.ID != ?
	AND ROLE_CODE = 'CAMPAIGN_USER'
	AND OBJECT_TYPE_CODE = 'CAMPAIGN';
`;
		var result = oHQ.statement(sSQL).execute(reqBody.CampaignId, reqBody.OriginAuthorId);
		return {
			success: true,
			data: {
				participants: result
			}
		};
	}

	function preCheck(reqBody) {
		if (!reqBody.IdeaId || !_.isInteger(reqBody.IdeaId)) {
			return responseError(oMsg.PARAM_MISSING_IDEA_ID);
		}

		var sSQL =
			`
SELECT (
		SELECT 1
		FROM "sap.ino.db.evaluation::t_evaluation"
		WHERE IDEA_ID = I.ID
			AND CREATED_BY_ID = I.CREATED_BY_ID
	) AS SelfEvaluationCount, 
	(
		SELECT 1
		FROM "sap.ino.db.reward::t_reward_list" AS L
			INNER JOIN "sap.ino.db.reward::t_reward" AS RE
			ON L.ID = RE.REWARD_LIST_ID
		WHERE L.IDEA_ID = I.ID
			AND RE.AUTHOR_ID = I.CREATED_BY_ID
			AND RE.DOWNLOAD_COUNT > 0
	) AS RewardCount
FROM "sap.ino.db.idea::t_idea" AS I
WHERE ID = ?;
`;
		var result = oHQ.statement(sSQL).execute(reqBody.IdeaId);
		return {
			success: true,
			data: {
				reward: result.length > 0 && result[0].EV > 0,
				selEvaluation: result.length > 0 && result[0].RW > 0
			}
		};
	}

	function changeAuthor(reqBody) {
		if (!reqBody.CampaignId || !_.isInteger(reqBody.CampaignId)) {
			return responseError(oMsg.PARAM_MISSING_CAMPAIGN_ID);
		}
		if (!reqBody.IdeaId || !_.isInteger(reqBody.IdeaId)) {
			return responseError(oMsg.PARAM_MISSING_IDEA_ID);
		}
		if (!reqBody.AuthorId || !_.isInteger(reqBody.AuthorId)) {
			return responseError(oMsg.PARAM_MISSING_AUTHOR_ID);
		}
		if (!reqBody.hasOwnProperty("reward")) {
			return responseError(oMsg.PARAM_MISSING_REWARD_SIGN);
		}
		if (!reqBody.hasOwnProperty("selEvaluation")) {
			return responseError(oMsg.PARAM_MISSING_SELF_EVALUATION_SIGN);
		}
	}

	exports.preCheck = preCheck;
	exports.getAuthorList = getAuthorList;
}(this));