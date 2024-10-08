const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

function execute() {
	const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	try {
		const oHQ = hQuery.hQuery(oConn);
		const bUnderMaintenance = systemSettings.isUnderMaintenance();
		if (bUnderMaintenance) {
			//do not run batch jobs if setup is incomplete
			message.createMessage(
				message.MessageSeverity.Error,
				"MSG_BATCH_SYSTEM_SETUP_RUNNING",
				undefined, undefined, undefined, undefined);
			return;
		}
		const bOpenCompletedCampaign = systemSettings.getValue('sap.ino.config.OPEN_COMPLETED_CAMP_FOR_ALL_USERS', oHQ);
		if (bOpenCompletedCampaign <= 0) {
			//If the switch is not open. Return
			message.createMessage(
				message.MessageSeverity.Error,
				"MSG_BATCH_SYSTEM_SETUP_RUNNING",
				undefined, undefined, undefined, undefined);
			return;
		}
		const sSelect = "SELECT ID FROM \"SAP_INO\".\"sap.ino.db.iam::v_identity\" WHERE NAME = 'All users'";
		const aAllUserGroupID = oHQ.statement(sSelect).execute();
		const iId = Number(aAllUserGroupID[0].ID.toString());
		const procedure = oHQ.procedure("SAP_INO", "sap.ino.db.campaign::p_completed_campaign_add_participate");
		procedure.execute(iId);
		oConn.commit();
	} catch (e) {
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, e.toString());
		oConn.rollback();
		throw e;
	} finally {
		oConn.close();
	}
}