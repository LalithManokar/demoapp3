var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var message = $.import("sap.ino.xs.aof.lib", "message");
var systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

function execute() {
	var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	var oHQ = hQuery.hQuery(oConn);
	var hasError = false,
		oError;

	var bUnderMaintenance = systemSettings.isUnderMaintenance();
	if (bUnderMaintenance) {
		//do not run batch jobs if setup is incomplete
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_SYSTEM_SETUP_RUNNING",
			undefined, undefined, undefined, undefined);
		return;
	}
	try {
		var days = systemSettings.getIniValue("change_log_retention_days", oHQ);
		if(!days){
		    days = 180;
		}
		oHQ.statement('DELETE FROM "sap.ino.db.iam::t_identity_log" WHERE CREATED_AT < ADD_DAYS(CURRENT_UTCTIMESTAMP,?)').execute([0 - Number(days)]);
		oConn.commit();
	} catch (e) {
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, e.toString());
		oConn.rollback();
		oConn.close();
		throw e;
	}
	if (hasError) {
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, oError.toString());
		throw oError;
	}
}