//provide some functions to accept_term.xsjs service
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var Auth = $.import("sap.ino.xs.aof.core", "authorization");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function checkLatestTerm(sTermCode, sTermChangedAt) {
	var oHQ = AOF.getHQ();
	var sCurrentTermCode = SystemSettings.getValue("sap.ino.config.TERMS_AND_CONDITIONS_TEXT", oHQ);
	if (!sCurrentTermCode) {
		return false;
	}

	if (sTermCode !== sCurrentTermCode) {
		return false;
	}

	var sSelectTerm = 'select * from "sap.ino.db.basis::t_text_module_stage" where code = ?';
	var aTermModule = oHQ.statement(sSelectTerm).execute(sTermCode);
	var sCurrentTermChangedAt = aTermModule[0].CHANGED_AT;

	if (!Date.parse(sCurrentTermChangedAt)) {
		return true;
	}

	if (sTermChangedAt !== sCurrentTermChangedAt) {
		return false;
	}

	return true;
}

function isDulicateTermAccept(sTermCode, sTermChangedAt, iUserID) {
	var oHQ = AOF.getHQ();
	var sSelect, aResult;

	if (!Date.parse(sTermChangedAt)) {
		sSelect =
			'select * from "sap.ino.db.iam::v_term_accept_history_latest" \
            where term_code = ? and user_id = ? and (TERM_ACTION_CODE IS NULL OR TERM_ACTION_CODE = 0)';
		aResult = oHQ.statement(sSelect).execute(sTermCode, iUserID);
	} else {
		sSelect =
			'select * from "sap.ino.db.iam::v_term_accept_history_latest" \
            where term_changed_at = ? and term_code = ? and user_id = ? and (TERM_ACTION_CODE IS NULL OR TERM_ACTION_CODE = 0) ';
		aResult = oHQ.statement(sSelect).execute(sTermChangedAt, sTermCode, iUserID);
	}

	return aResult.length > 0;
}

function putAcceptHistory(oSession, oParameter) {
	var vResult = {};
	var oResponse = {
		status: $.net.http.OK,
		body: vResult
	};

	function missTermChangedDate() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "The parameter should contain term_changed_date";
		return oResponse;
	}

	function missTermCode() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "The parameter should contain term_code";
		return oResponse;
	}

	function invalidTerm() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "The Term is not the latest version, please refresh browser";
		return oResponse;
	}

	if (!oParameter.TERM_CHANGED_AT || !Date.parse(oParameter.TERM_CHANGED_AT)) {
		missTermChangedDate();
		return oResponse;
	}

	if (!oParameter.TERM_CODE) {
		missTermCode();
		return oResponse;
	}

	if (!checkLatestTerm(oParameter.TERM_CODE, oParameter.TERM_CHANGED_AT)) {
		invalidTerm();
		return oResponse;
	}

	var oConn = AOF.getTransaction();
	var TermHistory = AOF.getApplicationObject("sap.ino.xs.object.iam.TermHistory");

	if (!isDulicateTermAccept(oParameter.TERM_CODE, oParameter.TERM_CHANGED_AT, Auth.getApplicationUser().ID)) {
		var oAOFResponse = TermHistory.create({
			ID: -1,
			TERM_CODE: oParameter.TERM_CODE,
			USER_ID: Auth.getApplicationUser().ID,
			TERM_ACCEPTED_AT: new Date()
		});

		oConn.commit();
	}

	return oResponse;
}