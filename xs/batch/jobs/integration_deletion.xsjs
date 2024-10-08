const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const IntegrationDelHistory = $.import("sap.ino.xs.xslib.integration", "IntegrationDelHistory");

function execute() {
	const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	const oHQ = hQuery.hQuery(oConn);
	const bUnderMaintenance = systemSettings.isUnderMaintenance();
	try {
		if (bUnderMaintenance) {
			message.createMessage(
				message.MessageSeverity.Error,
				"MSG_BATCH_SYSTEM_SETUP_RUNNING",
				undefined, undefined, undefined, undefined);
			return;
		}
		IntegrationDelHistory.delHistory(oHQ);
		oConn.commit();
	} catch (e) {
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_INTEGRATION_DEL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, e.toString());
		oConn.rollback();
		throw e;
	}
}