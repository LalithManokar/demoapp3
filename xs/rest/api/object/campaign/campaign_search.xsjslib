var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();
var pageSize, pageIndex, campType, lanType,
	campStarDateOp, campStarDateFrom, campStarDateTo, campEndDateOp, campEndDateFrom, campEndDateTo,
	campSubmissionStarDateOp, campSubmissionStarDateFrom, campSubmissionStarDateTo, campSubmissionEndDateOp, campSubmissionEndDateFrom,
	campSubmissionEndDateTo,
	sCommonSql, oCamps, aTagNames;

const CAMPAIGN_TYPE = {
	all: 0,
	exclude_darft: 1
};

const DATE_OPERATOR = {
	equal: 0,
	gte: 1,
	lte: 2,
	between: 3
};

function getTagNamsSql() {
	if (aTagNames && aTagNames.length > 0) {
		return ' , ' +
			'  ( ' +
			' 	SELECT COUNT(1) ' +
			' 	FROM "sap.ino.db.tag::t_object_tag" AS t_tag ' +
			' 		INNER JOIN "sap.ino.db.tag::t_tag" AS tag ' +
			' 		ON t_tag.TAG_ID = tag.id ' +
			' 	WHERE t_tag.OBJECT_ID = CAMP.ID ' +
			"	AND t_tag.OBJECT_TYPE_CODE = 'CAMPAIGN' " +
			' 		AND (' +
			getTagNamesConditionSql() +
			') ' +
			' 	) AS C1 ';
	}
	return '';
}

function getConditionSql() {
	var sCondition = "";
	if (campType === CAMPAIGN_TYPE.exclude_darft) {
		sCondition += " AND CAMP.STATUS_CODE <> 'sap.ino.config.CAMP_DRAFT' ";
	}
	sCondition += getStartConditionSql();
	sCondition += getSubmissionConditionSql();

	return sCondition;
}

function getStartConditionSql() {
	var sCondition = "";

	switch (campStarDateOp) {
		case DATE_OPERATOR.equal:
			sCondition += " AND CAMP.VALID_FROM = ? ";
			break;
		case DATE_OPERATOR.gte:
			sCondition += " AND CAMP.VALID_FROM >= ? ";
			break;
		case DATE_OPERATOR.lte:
			sCondition += " AND CAMP.VALID_FROM <= ? ";
			break;
		case DATE_OPERATOR.between:
			sCondition += " AND CAMP.VALID_FROM >= ? AND CAMP.VALID_FROM <= ? ";
			break;
		default:
			break;
	}

	switch (campEndDateOp) {
		case DATE_OPERATOR.equal:
			sCondition += " AND CAMP.VALID_TO = ? ";
			break;
		case DATE_OPERATOR.gte:
			sCondition += " AND CAMP.VALID_TO >= ? ";
			break;
		case DATE_OPERATOR.lte:
			sCondition += " AND CAMP.VALID_TO <= ? ";
			break;
		case DATE_OPERATOR.between:
			sCondition += " AND CAMP.VALID_TO >= ? AND CAMP.VALID_TO <= ? ";
			break;
		default:
			break;
	}

	return sCondition;
}

function getSubmissionConditionSql() {
	var sCondition = "";

	switch (campSubmissionStarDateOp) {
		case DATE_OPERATOR.equal:
			sCondition += " AND CAMP.SUBMIT_FROM = ? ";
			break;
		case DATE_OPERATOR.gte:
			sCondition += " AND CAMP.SUBMIT_FROM >= ? ";
			break;
		case DATE_OPERATOR.lte:
			sCondition += " AND CAMP.SUBMIT_FROM <= ? ";
			break;
		case DATE_OPERATOR.between:
			sCondition += " AND CAMP.SUBMIT_FROM >= ? AND CAMP.SUBMIT_FROM <= ? ";
			break;
		default:
			break;
	}

	switch (campSubmissionEndDateOp) {
		case DATE_OPERATOR.equal:
			sCondition += " AND CAMP.SUBMIT_TO = ? ";
			break;
		case DATE_OPERATOR.gte:
			sCondition += " AND CAMP.SUBMIT_TO >= ? ";
			break;
		case DATE_OPERATOR.lte:
			sCondition += " AND CAMP.SUBMIT_TO <= ? ";
			break;
		case DATE_OPERATOR.between:
			sCondition += " AND CAMP.SUBMIT_TO >= ? AND CAMP.SUBMIT_TO <= ? ";
			break;
		default:
			break;
	}

	return sCondition;
}

function getTagNamesConditionSql() {
	if (aTagNames && aTagNames.length > 0) {
		var sTagConditions = ' tag.NAME = ? ';
		for (var index = 1; index < aTagNames.length; index++) {
			sTagConditions += ' OR tag.NAME = ? '
		}
		return sTagConditions;
	}
	return '';
}

function getSqlInput() {
	var aInputParam = [];
	getTagNamsSqlInput(aInputParam);
	aInputParam.push(lanType);
	getStartSqlInput(aInputParam);
	getSubmissionSqlInput(aInputParam);
	aInputParam.push(pageSize);
	aInputParam.push(pageSize * (pageIndex - 1));
	return aInputParam;
}

function getStartSqlInput(aInputParam) {
	switch (campStarDateOp) {
		case DATE_OPERATOR.equal:
		case DATE_OPERATOR.gte:
		case DATE_OPERATOR.lte:
			aInputParam.push(campStarDateFrom);
			break;
		case DATE_OPERATOR.between:
			aInputParam.push(campStarDateFrom);
			aInputParam.push(campStarDateTo);
			break;
		default:
			break;
	}

	switch (campEndDateOp) {
		case DATE_OPERATOR.equal:
		case DATE_OPERATOR.gte:
		case DATE_OPERATOR.lte:
			aInputParam.push(campEndDateFrom);
			break;
		case DATE_OPERATOR.between:
			aInputParam.push(campEndDateFrom);
			aInputParam.push(campEndDateTo);
			break;
		default:
			break;
	}
}

function getSubmissionSqlInput(aInputParam) {
	switch (campSubmissionStarDateOp) {
		case DATE_OPERATOR.equal:
		case DATE_OPERATOR.gte:
		case DATE_OPERATOR.lte:
			aInputParam.push(campSubmissionStarDateFrom);
			break;
		case DATE_OPERATOR.between:
			aInputParam.push(campSubmissionStarDateFrom);
			aInputParam.push(campSubmissionStarDateTo);
			break;
		default:
			break;
	}

	switch (campSubmissionEndDateOp) {
		case DATE_OPERATOR.equal:
		case DATE_OPERATOR.gte:
		case DATE_OPERATOR.lte:
			aInputParam.push(campSubmissionEndDateFrom);
			break;
		case DATE_OPERATOR.between:
			aInputParam.push(campSubmissionEndDateFrom);
			aInputParam.push(campSubmissionEndDateTo);
			break;
		default:
			break;
	}
}

function getTagNamsSqlInput(aInputParam) {
	if (aTagNames && aTagNames.length > 0) {
		for (var index = 0; index < aTagNames.length; index++) {
			aInputParam.push(aTagNames[index]);
		}
	}
}

function initSql() {
	sCommonSql =
		`
SELECT  
    ID, 
	VALID_FROM, 
	VALID_TO, 
	SUBMIT_FROM, 
	SUBMIT_TO, 
	NAME
FROM (
		SELECT ROW_NUMBER() OVER(PARTITION BY CAMP.ID ORDER BY CAMP.ID ASC) AS RN, 
			CAMP.ID, 
			CAMP.VALID_FROM, 
			CAMP.VALID_TO, 
			CAMP.SUBMIT_FROM, 
			CAMP.SUBMIT_TO, 
			CAMP_T.NAME, 
			CAMP_T.LANG `;
	sCommonSql += getTagNamsSql();
	sCommonSql +=
		`
		FROM "sap.ino.db.campaign::t_campaign" AS CAMP
			INNER JOIN "sap.ino.db.campaign::t_campaign_t" AS CAMP_T
			ON CAMP.ID = CAMP_T.CAMPAIGN_ID  
	    `;
	sCommonSql += `	
	    WHERE CAMP_T.LANG = ? 
    `;
	sCommonSql += getConditionSql();
	sCommonSql += `
	)
WHERE RN = 1 
    `;
	if (aTagNames && aTagNames.length > 0) {
		sCommonSql += " AND C1 = " + aTagNames.length;
	}
	sCommonSql += `
	ORDER BY ID ASC
	LIMIT ?
	OFFSET ? ;
	`;
}

function getDataFromDB() {
	oCamps = oHQ.statement(sCommonSql).execute(getSqlInput());
}

function initParam(oRequest) {
	pageIndex = oRequest.Parameters.PAGE_INDEX;
	pageSize = oRequest.Parameters.PAGE_SIZE;
	campType = oRequest.Parameters.CAMPAIGN_TYPE || 0;
	lanType = oRequest.Parameters.LANG || 'en';

	campStarDateOp = oRequest.Parameters.CAMPAIGN_START_DATE_OPERATOR;
	campEndDateOp = oRequest.Parameters.CAMPAIGN_END_DATE_OPERATOR;
	campStarDateFrom = oRequest.Parameters.CAMPAIGN_START_DATE_FROM;
	campStarDateTo = oRequest.Parameters.CAMPAIGN_START_DATE_TO;
	campEndDateFrom = oRequest.Parameters.CAMPAIGN_END_DATE_FROM;
	campEndDateTo = oRequest.Parameters.CAMPAIGN_END_DATE_TO;

	campSubmissionStarDateOp = oRequest.Parameters.CAMPAIGN_SUBMISSION_START_DATE_OPERATOR;
	campSubmissionEndDateOp = oRequest.Parameters.CAMPAIGN_SUBMISSION_END_DATE_OPERATOR;
	campSubmissionStarDateFrom = oRequest.Parameters.CAMPAIGN_SUBMISSION_START_DATE_FROM;
	campSubmissionStarDateTo = oRequest.Parameters.CAMPAIGN_SUBMISSION_START_DATE_TO;
	campSubmissionEndDateFrom = oRequest.Parameters.CAMPAIGN_SUBMISSION_END_DATE_FROM;
	campSubmissionEndDateTo = oRequest.Parameters.CAMPAIGN_SUBMISSION_END_DATE_TO;

	aTagNames = oRequest.Parameters.TAG_NAME;
}

function checkParam() {
	if (!Number.isInteger(campType) || !Number.isInteger(pageIndex) || !Number.isInteger(pageSize)) {
		throw new Error();
	}

	if (Number.isInteger(campStarDateOp) && (Number(campStarDateOp) < 0 || Number(campStarDateOp) > 3)) {
		throw new Error();
	}
	if (Number.isInteger(campEndDateOp) && (Number(campEndDateOp) < 0 || Number(campEndDateOp) > 3)) {
		throw new Error();
	}

	if (Number.isInteger(campSubmissionStarDateOp) && (Number(campSubmissionStarDateOp) < 0 || Number(campSubmissionStarDateOp) > 3)) {
		throw new Error();
	}
	if (Number.isInteger(campSubmissionEndDateOp) && (Number(campSubmissionEndDateOp) < 0 || Number(campSubmissionEndDateOp) > 3)) {
		throw new Error();
	}

	if (campStarDateOp < 3 && Number.isNaN(Date.parse(campStarDateFrom))) {
		throw new Error();
	}
	if (campStarDateOp === 3 && (Number.isNaN(Date.parse(campStarDateFrom)) || Number.isNaN(Date.parse(campStarDateTo)))) {
		throw new Error();
	}
	if (campEndDateOp < 3 && Number.isNaN(Date.parse(campEndDateFrom))) {
		throw new Error();
	}
	if (campEndDateOp === 3 && (Number.isNaN(Date.parse(campEndDateFrom)) || Number.isNaN(Date.parse(campEndDateTo)))) {
		throw new Error();
	}

	if (campSubmissionStarDateOp < 3 && Number.isNaN(Date.parse(campSubmissionStarDateFrom))) {
		throw new Error();
	}
	if (campSubmissionStarDateOp === 3 && (Number.isNaN(Date.parse(campSubmissionStarDateFrom)) || Number.isNaN(Date.parse(
		campSubmissionStarDateTo)))) {
		throw new Error();
	}
	if (campSubmissionEndDateOp < 3 && Number.isNaN(Date.parse(campSubmissionEndDateFrom))) {
		throw new Error();
	}
	if (campSubmissionEndDateOp === 3 && (Number.isNaN(Date.parse(campSubmissionEndDateFrom)) || Number.isNaN(Date.parse(
		campSubmissionEndDateTo)))) {
		throw new Error();
	}
	if (aTagNames && !Array.isArray(aTagNames)) {
		throw new Error();
	}
}

function checkParamRange() {
	if (pageIndex <= 0 || pageSize <= 0) {
		throw new Error();
	}
}

function campaign_search(oRequest, oResponse) {
	try {
		util.getSessionUser(oRequest); //get user
	} catch (e) {
		$.response.status = 403;
		util.handlError(oResponse, oRequest, "The UserID you input doesn't exist.", $.response);
		return false;
	}
	initParam(oRequest);
	try {
		checkParam();
	} catch (e) {
		$.response.status = 403;
		util.handlError(oResponse, oRequest, "Miss params.", $.response);
		return false;
	}
	try {
		checkParamRange();
	} catch (e) {
		$.response.status = 403;
		util.handlError(oResponse, oRequest, "Params is out of range.", $.response);
		return false;
	}
	initSql();
	getDataFromDB();
	oResponse = util.get_inf(oRequest, oResponse, undefined, oCamps);
	util.send_mes(oResponse);
	oConn.commit();
}