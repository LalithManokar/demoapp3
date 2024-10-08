var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();
var pageSize, pageIndex, campId, statusCode, phaseCode,
	sCommonSql, sIdeaSql, sCoauthorSql, sCommentSql, sVoteSql, sVolunteerSql, sRelationSql, sIdeaFormSql,
	oIdeas;

function getWhereByCondition() {
	if (phaseCode.length > 0 && statusCode.length > 0) {
		return ' AND PHASE = ? AND STATUS = ? ';
	}
	if (phaseCode.length > 0) {
		return ' AND PHASE = ? ';
	}
	if (statusCode.length > 0) {
		return ' AND STATUS = ? ';
	}
	return "";
}

function executeSql(oStatement) {
	if (phaseCode.length > 0 && statusCode.length > 0) {
		return oStatement.execute(pageSize, campId, phaseCode, statusCode, (pageIndex - 1) * pageSize);
	}
	if (phaseCode.length > 0) {
		return oStatement.execute(pageSize, campId, phaseCode, (pageIndex - 1) * pageSize);
	}
	if (statusCode.length > 0) {
		return oStatement.execute(pageSize, campId, statusCode, (pageIndex - 1) * pageSize);
	}
	return oStatement.execute(pageSize, campId, (pageIndex - 1) * pageSize);
}

function initSql() {
	sCommonSql =
		'SELECT TOP ? \
	 ID \
FROM ( \
        SELECT ROW_NUMBER() OVER(ORDER BY ID ASC) AS RN, \
			ID \
		FROM "sap.ino.db.idea.ext::v_ext_idea_community" \
		WHERE CAMPAIGN_ID = ? ';
	sCommonSql += getWhereByCondition();
	sCommonSql += ' \
	ORDER BY RN DESC\
)\
WHERE RN > ? \
	ORDER BY RN ASC ';

	sIdeaSql =
		'SELECT TOP ? \
	ID, \
NAME, \
SUBMITTER_ID, \
SUBMITTER_NAME, \
SUBMITTER_USER_NAME, \
PHASE, \
STATUS, \
RESP_NAME \
FROM( \
	SELECT ROW_NUMBER() OVER(ORDER BY ID ASC) AS RN, \
	ID, \
	NAME, \
	SUBMITTER_ID, \
	SUBMITTER_NAME, \
	SUBMITTER_USER_NAME, \
	PHASE, \
	STATUS, \
	RESP_NAME \
	FROM "sap.ino.db.idea::v_idea_community" \
	WHERE CAMPAIGN_ID = ? ';
	sIdeaSql += getWhereByCondition();
	sIdeaSql += 'ORDER BY RN DESC \
)\
WHERE RN > ? \
	ORDER BY RN ASC;';

	sCoauthorSql =
		'SELECT DISTINCT IDEA.ID, IDE.ID AS USER_ID, IDE.USER_NAME \
FROM( ' + sCommonSql + ' \
		) AS IDEA \
INNER JOIN "sap.ino.db.iam::t_object_identity_role" \
AS OBJ_R \
ON IDEA.ID = OBJ_R.OBJECT_ID \
INNER JOIN "sap.ino.db.iam::t_identity" \
AS IDE \
ON OBJ_R.IDENTITY_ID = IDE.ID \
WHERE OBJECT_TYPE_CODE = \'IDEA\' \
	AND ROLE_CODE = \'IDEA_CONTRIBUTOR\';';

	sCommentSql =
		'SELECT DISTINCT IDEA.ID, \
	IDE.ID AS USER_ID, IDE.USER_NAME, OBJ.CREATED_AT,\
	OBJ.COMMENT \
FROM ( ' + sCommonSql + ' \
	) AS IDEA \
	INNER JOIN "sap.ino.db.comment::t_comment" AS OBJ \
	ON IDEA.ID = OBJ.OBJECT_ID \
	INNER JOIN "sap.ino.db.iam::t_identity" AS IDE \
	ON OBJ.CREATED_BY_ID = IDE.ID \
WHERE OBJ.OBJECT_TYPE_CODE = \'IDEA\' \
	AND OBJ.TYPE_CODE = \'COMMUNITY_COMMENT\';';

	sVoteSql =
		'SELECT DISTINCT IDEA.ID, OBJ.CREATED_AT,\
	IDE.ID AS USER_ID, IDE.USER_NAME \
FROM ( ' + sCommonSql + ' \
	) AS IDEA \
	INNER JOIN "sap.ino.db.idea::t_vote" AS OBJ \
	ON IDEA.ID = OBJ.IDEA_ID \
	INNER JOIN "sap.ino.db.iam::t_identity" AS IDE \
	ON OBJ.USER_ID = IDE.ID;';

	sVolunteerSql =
		'\
SELECT DISTINCT IDEA.ID, \
	IDE.ID AS USER_ID, IDE.USER_NAME \
FROM ( ' + sCommonSql + ' \
	) AS IDEA \
	INNER JOIN "sap.ino.db.idea::t_volunteers" AS OBJ \
	ON IDEA.ID = OBJ.IDEA_ID \
	INNER JOIN "sap.ino.db.iam::t_identity" AS IDE \
	ON OBJ.IDENTITY_ID = IDE.ID;';

	sRelationSql =
		'SELECT DISTINCT IDEA.ID, \
    IDE.ID as IDEA_ID, \
	IDE.NAME \
FROM ( ' + sCommonSql + ' \
	) AS IDEA \
	INNER JOIN "sap.ino.db.idea::v_idea_relation" AS OBJ \
	ON IDEA.ID = OBJ.OTHER_IDEA_ID \
	INNER JOIN "sap.ino.db.idea::t_idea" AS IDE \
	ON OBJ.IDEA_ID = IDE.ID \
WHERE IDE.CAMPAIGN_ID = ? ';

	sIdeaFormSql =
		'SELECT v.idea_id as ID, \
	v.field_code, \
	c.default_text, \
	c.is_display_only,\
	c.display_text,\
	ifnull( \
		v.field_type_code, \
		\'CUSTOM_FIELD\' \
	) as type_code, \
	v.num_value, \
	v.bool_value, \
	v.text_value, \
	v.rich_text_value, \
	v.date_value \
FROM (' + sCommonSql + ') AS IDEA \
	INNER JOIN "sap.ino.db.ideaform::t_field_value" AS v \
	ON idea.id = v.idea_id \
	INNER JOIN "sap.ino.db.ideaform::t_field" AS c \
	ON v.field_code = c.code; ';
}

function getIdeas() {
	oIdeas = executeSql(oHQ.statement(sIdeaSql));
}

function getCoauthor() {
	var oResult = executeSql(oHQ.statement(sCoauthorSql));
	_.each(oIdeas, function(idea) {
		idea.COAUTHOR = _.where(oResult, {
			"ID": idea.ID
		});
		idea.COAUTHOR = _.map(idea.COAUTHOR, function(data) {
			return {
				"USER_ID": data.USER_ID,
				"USER_NAME": data.USER_NAME
			};
		});
	});
}

function getComments() {
	var oResult = executeSql(oHQ.statement(sCommentSql));
	_.each(oIdeas, function(idea) {
		idea.COMMENTS = _.where(oResult, {
			"ID": idea.ID
		});
		idea.COMMENTS = _.map(idea.COMMENTS, function(data) {
			return {
				"USER_ID": data.USER_ID,
				"USER_NAME": data.USER_NAME,
				"CREATED_AT": data.CREATED_AT,
				"COMMENT": data.COMMENT
			};
		});
	});
}

function getVotes() {
	var oResult = executeSql(oHQ.statement(sVoteSql));
	_.each(oIdeas, function(idea) {
		idea.VOTES = _.where(oResult, {
			"ID": idea.ID
		});
		idea.VOTES = _.map(idea.VOTES, function(data) {
			return {
				"USER_ID": data.USER_ID,
				"USER_NAME": data.USER_NAME,
				"CREATED_AT": data.CREATED_AT
			};
		});
	});
}

function getVolunteers() {
	var oResult = executeSql(oHQ.statement(sVolunteerSql));
	_.each(oIdeas, function(idea) {
		idea.VOLUNTEERS = _.where(oResult, {
			"ID": idea.ID
		});
		idea.VOLUNTEERS = _.map(idea.VOLUNTEERS, function(data) {
			return {
				"USER_ID": data.USER_ID,
				"USER_NAME": data.USER_NAME
			};
		});
	});
}

function getRelations() {
	function exeSqlSelf(oStatement) {
		if (phaseCode.length > 0 && statusCode.length > 0) {
			return oStatement.execute(pageSize, campId, phaseCode, statusCode, (pageIndex - 1) * pageSize, campId);
		}
		if (phaseCode.length > 0) {
			return oStatement.execute(pageSize, campId, phaseCode, (pageIndex - 1) * pageSize, campId);
		}
		if (statusCode.length > 0) {
			return oStatement.execute(pageSize, campId, statusCode, (pageIndex - 1) * pageSize, campId);
		}

		return oStatement.execute(pageSize, campId, (pageIndex - 1) * pageSize, campId);
	}
	var oResult = exeSqlSelf(oHQ.statement(sRelationSql));
	_.each(oIdeas, function(idea) {
		idea.RELATIONS = _.where(oResult, {
			"ID": idea.ID
		});
		idea.RELATIONS = _.map(idea.RELATIONS, function(data) {
			return {
				"ID": data.IDEA_ID,
				"NAME": data.NAME
			};
		});
	});
}

function getIdeaForms() {
	var oResult = executeSql(oHQ.statement(sIdeaFormSql));
	_.each(oIdeas, function(idea) {
		idea.CUSTOM_FORM = _.where(oResult, {
			"ID": idea.ID,
			"TYPE_CODE": "CUSTOM_FIELD"
		});
		idea.CUSTOM_FORM = _.map(idea.CUSTOM_FORM, function(data) {
			return {
				"DEFAULT_TEXT": data.DEFAULT_TEXT,
				"FIELD_CODE": data.FIELD_CODE,
				"FIELD_VALUE": "" + (data.NUM_VALUE || "") + (data.BOOL_VALUE || "") + (data.TEXT_VALUE || "") + (data.RICH_TEXT_VALUE || "") + (data.DATE_VALUE || ""),
				"IS_DISPLAY_ONLY":data.IS_DISPLAY_ONLY,
				"DISPLAY_TEXT":data.DISPLAY_TEXT				
				
			};
		});
		idea.ADMIN_FORM = _.where(oResult, {
			"ID": idea.ID,
			"TYPE_CODE": "ADMIN_FIELD"
		});
		idea.ADMIN_FORM = _.map(idea.ADMIN_FORM, function(data) {
			return {
				"DEFAULT_TEXT": data.DEFAULT_TEXT,
				"FIELD_CODE": data.FIELD_CODE,
				"FIELD_VALUE": "" + (data.NUM_VALUE || "") + (data.BOOL_VALUE || "") + (data.TEXT_VALUE || "") + (data.RICH_TEXT_VALUE || "") + (data.DATE_VALUE || ""),
				"IS_DISPLAY_ONLY":data.IS_DISPLAY_ONLY,
				"DISPLAY_TEXT":data.DISPLAY_TEXT				
			};
		});
	});
}

function getDataFromDB() {
	getIdeas();
	getCoauthor();
	getComments();
	getVotes();
	getVolunteers();
	getRelations();
	getIdeaForms();
}

function idea_search(oRequest, oResponse) {
	try {
		util.getSessionUser(oRequest); //get user
	} catch (e) {
		$.response.status = 403;
		util.handlError(oResponse, oRequest, "The UserID you input doesn't exist.", $.response);
		return false;
	}

	campId = oRequest.Parameters.CAMPAIGN_ID;
	pageIndex = oRequest.Parameters.PAGE_INDEX || 1;
	pageSize = oRequest.Parameters.PAGE_SIZE || 1000;
	statusCode = oRequest.Parameters.STATUS_CODE || "";
	phaseCode = oRequest.Parameters.PHASE_CODE || "";

	if (!Number.isInteger(campId) || !Number.isInteger(pageIndex) || !Number.isInteger(pageSize)) {
		throw new Error();
	}

	initSql();
	getDataFromDB();
	oResponse = util.get_inf(oRequest, oResponse, undefined, oIdeas);
	util.send_mes(oResponse);
	oConn.commit();
}