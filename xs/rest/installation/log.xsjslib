(function(exports) {
	"use strict";
	$.import("sap.ino.xs.xslib", "hQuery");
	var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
	var common = $.import("sap.ino.xs.rest.installation", "common");
	const oConn = $.hdb.getConnection({
		"sqlcc": "sap.ino.xs.rest.installation::installation_dbuser"
	});
	const oHQ = $.sap.ino.xs.xslib.hQuery.hQuery(oConn);

	function log(oReqBody) {
		try {
			if (oReqBody.msg && oReqBody.msg.length > 4000) {
				oReqBody.msg = oReqBody.msg.substr(0, 4000);
			}
			var duVersion = common.getDuVersion(), nRunningTime = 1;
			var aRunningTime = oHQ.statement('SELECT RUNNING_TIME FROM "SAP_INO"."sap.ino.db.installation::t_installation_log" as logger WHERE logger.VERSION = ? AND logger.VERSION_SP = ? AND logger.VERSION_PATCH = ? AND logger.ACTION_CODE = \'WORK_DONE\'')
			    .execute(duVersion.version, duVersion.version_sp, duVersion.version_patch);
		    if(aRunningTime && aRunningTime.length > 0){
		        nRunningTime = Number(aRunningTime[0].RUNNING_TIME) + 1;
		    }
			var sSQL =
				'INSERT INTO "SAP_INO"."sap.ino.db.installation::t_installation_log" SELECT "SAP_INO"."sap.ino.db.installation::s_installation_log".NEXTVAL,?,?,?,CURRENT_UTCTIMESTAMP,?,?,?,? FROM DUMMY';
			oHQ.statement(sSQL).execute(duVersion.version, duVersion.version_sp, duVersion.version_patch, oReqBody.actionCode, oReqBody.status,
				oReqBody.msg, nRunningTime);
			oConn.commit();
		} catch (ex) {
		    TraceWrapper.log_exception(ex);
			return {
				success: false,
				msg: TraceWrapper.stringify_exception(ex)
			};
		}
		return {
			success: true
		};
	}

	function getLastSteps() {
		var duVersion = common.getDuVersion();
		var sSQL =
			'SELECT ' +
			'   LG.ACTION_CODE, ' +
			'	LG.status,  ' +
			'	LG.MESSAGE  ' +
			'FROM ( ' +
			'		SELECT ' +
			'           ROW_NUMBER() OVER (PARTITION BY logger.ACTION_CODE ORDER BY logger.TIME DESC) ROW_ORDER, ' +
			'		    logger.ACTION_CODE,  ' +
			'			logger.status,  ' +
			'			logger.MESSAGE ' +
			'		FROM ' +
			'           "sap.ino.db.installation::t_installation_log" AS logger ' +
			'		WHERE logger.VERSION = ? AND logger.VERSION_SP = ? AND logger.VERSION_PATCH = ? AND logger.ACTION_CODE != \'WORK_DONE\'' +
			'		AND logger.RUNNING_TIME = (SELECT MAX(RUNNING_TIME) FROM  "sap.ino.db.installation::t_installation_log" WHERE VERSION = ? AND VERSION_SP = ? AND VERSION_PATCH = ?)' +
			'	) AS LG ' +
			'WHERE LG.ROW_ORDER = 1;';
		var result = oHQ.statement(sSQL).execute(duVersion.version, duVersion.version_sp, duVersion.version_patch, duVersion.version, duVersion.version_sp, duVersion.version_patch);
		return {
			success: true,
			data: result
		};
	}

	exports.log = log;
	exports.getLastSteps = getLastSteps;
}(this));