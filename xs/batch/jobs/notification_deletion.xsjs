const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const message = $.import("sap.ino.xs.aof.lib", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const notificationDelHistory = $.import("sap.ino.xs.xslib.sysNotifications", "notificationDelHistory");

function execute() {
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
		notificationDelHistory.delHistory(oHQ);
		oConn.commit();
	} catch (e) {
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_NOTIFICATION_DEL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, e.toString());
		oConn.rollback();
		throw e;
	}
}