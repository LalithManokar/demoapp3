const message = $.import("sap.ino.xs.aof.lib", "message");
const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

function execute() {
	const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	const oHQ = hQuery.hQuery(oConn);
	const bUnderMaintenance = systemSettings.isUnderMaintenance();
	if (bUnderMaintenance) {
		message.createMessage(message.MessageSeverity.Error, "MSG_BATCH_SYSTEM_SETUP_RUNNING", undefined, undefined, undefined, undefined);
		return;
	}
	try {
		oHQ.procedure("SAP_INO", "sap.ino.db.basis::p_clean_orphan_data").execute();
		oConn.commit();
	} catch (e) {
		message.createMessage(message.MessageSeverity.Error, "MSG_BATCH_DELETE_ORPHANS_FAILED_UNEXPECTEDLY", undefined, undefined, undefined, e.toString());
		oConn.rollback();
		throw e;
	}
}