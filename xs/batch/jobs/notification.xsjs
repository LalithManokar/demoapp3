const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const commonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function execute() {
	const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	const oHQ = hQuery.hQuery(oConn);
	try {
		const bUnderMaintenance = systemSettings.isUnderMaintenance();
		if (bUnderMaintenance) {
			//do not run batch jobs if setup is incomplete
			message.createMessage(
				message.MessageSeverity.Error,
				"MSG_BATCH_SYSTEM_SETUP_RUNNING",
				undefined, undefined, undefined, undefined);
			return;
		}
		var procedure;
		var bEnableNewNotification = commonUtil.getSystemSetting(oHQ, "sap.ino.config.ENABLE_NEW_NOTIFICATION");
		var bEnableNewNotificationJob = commonUtil.getSystemSetting(oHQ, "sap.ino.config.ENABLE_JOB_FOR_NEW_NOTIFICATION");
		if (bEnableNewNotification && Number(bEnableNewNotification) > 0 && bEnableNewNotificationJob && Number(bEnableNewNotificationJob) > 0) {
			procedure = oHQ.procedure("SAP_INO", "sap.ino.db.newnotification::p_notification_service");
		} else {
			procedure = oHQ.procedure("SAP_INO", "sap.ino.db.notification::p_notification_service");
		}
		procedure.execute({});
		oConn.commit();
	} catch (e) {
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, e.toString());
		oConn.rollback();
		throw e;
	}
}