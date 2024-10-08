// This service campaignmgr_responsibility.xsjs check whether the campaign manager can edit responsibility

var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var RespMessage = $.import("sap.ino.xs.object.subresponsibility", "message");
const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

var _parseRequestParamters = function(aParameter) {
	var result = {};
	_.each(aParameter, function(parameter) {
		result[parameter.name] = Number.isNaN(parameter.value * 1) ? parameter.value : Number(parameter.value);
	});
	return result;
};

var _allow = function() {
	$.response.status = 200;
	$.response.headers.set("Content-Type", "application/json");
	$.response.setBody(JSON.stringify({
		result: true
	}));
};

var _deny = function() {
	$.response.status = 500;
	$.response.headers.set("Content-Type", "application/json");
	$.response.setBody(JSON.stringify({
		result: false
	}));
};

var _privilegeCheck = function(oHQ, oParameter) {
// 	var sSelect = 'SELECT 1 AS COUNTS FROM DUMMY ' +
// 		' WHERE ' +
// 		' EXISTS(SELECT 1 FROM sys.effective_privileges WHERE USER_NAME = ? AND PRIVILEGE = \'sap.ino.xs.rest.admin.application::execute\') ' +
// 		' OR EXISTS(SELECT 1 FROM "sap.ino.db.subresponsibility::t_responsibility_stage"  AS RESP ' +
// 		' INNER JOIN "sap.ino.db.iam::t_identity" AS IDEN ON IDEN.ID = RESP.CREATED_BY_ID ' +
// 		' WHERE RESP.CODE = ? AND (IDEN.USER_NAME = ? OR RESP.IS_PUBLIC = 1)' +
// 		' AND EXISTS(SELECT 1 FROM "sap.ino.db.iam::v_object_identity_role_transitive" AS ROLES ' +
// // 		' INNER JOIN "sap.ino.db.iam::t_identity" AS IDEN ON ' +
// 		' WHERE IDEN.ID = ROLES.IDENTITY_ID  AND ROLES.OBJECT_TYPE_CODE = \'CAMPAIGN\' AND ROLES.ROLE_CODE = \'CAMPAIGN_MANAGER\' AND IDEN.USER_NAME = ?))';
		
		
	var sqlSelect = 'SELECT 1 AS COUNTS FROM DUMMY ' +
		' WHERE ' +
		' EXISTS(SELECT 1 FROM sys.effective_privileges WHERE USER_NAME = ? AND PRIVILEGE = \'sap.ino.xs.rest.admin.application::execute\') ' +
		' OR EXISTS(SELECT 1 FROM "sap.ino.db.iam::v_object_identity_role_transitive" AS ROLES ' +
		' INNER JOIN "sap.ino.db.iam::t_identity" AS IDEN ' +
		' ON IDEN.ID = ROLES.IDENTITY_ID  ' +
		' WHERE ROLES.OBJECT_TYPE_CODE = \'CAMPAIGN\' AND ROLES.ROLE_CODE = \'CAMPAIGN_MANAGER\' AND IDEN.USER_NAME = ? '+
		' AND EXISTS(SELECT 1 FROM "sap.ino.db.subresponsibility::t_responsibility_stage"  AS RESP '+
		' WHERE  ((RESP.IS_PUBLIC = 1 AND RESP.CODE= ? ) OR (IDEN.ID = RESP.CREATED_BY_ID))))';
	
	var result = oHQ.statement(sqlSelect).execute(
		$.session.getUsername(),
		$.session.getUsername(),
		oParameter.code
	);
	if (result.length < 1) {
		return false;
	}
	return true;
};

var _handleRequest = function(oParameter) {
	var oHQ = hQuery.hQuery(conn);
	if (_privilegeCheck(oHQ, oParameter)) {
		_allow();
		return;
	}
	_deny();
	oHQ.getConnection().close();
};

TraceWrapper.wrap_request_handler(function() {
	var oParameter = _parseRequestParamters($.request.parameters);
	return _handleRequest(oParameter);
});