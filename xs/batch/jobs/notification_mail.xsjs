const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const notificationMail = $.import("sap.ino.xs.xslib.sysNotifications", "scheduledNotificationEmail");
const notificationsEmailSender = $.import("sap.ino.xs.xslib.sysNotifications", "notificationsEmailSender");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const commonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

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
		var bEnableNewNotification = commonUtil.getSystemSetting(oHQ, "sap.ino.config.ENABLE_NEW_NOTIFICATION");
		var bEnableNewNotificationJob = commonUtil.getSystemSetting(oHQ, "sap.ino.config.ENABLE_JOB_FOR_NEW_NOTIFICATION");
		if (bEnableNewNotification && Number(bEnableNewNotification) > 0 && bEnableNewNotificationJob && Number(bEnableNewNotificationJob) > 0) {
			notificationsEmailSender.execute(oHQ, oConn);
		} else {
			notificationMail.execute(oHQ, oConn);
		}
	} catch (e) {
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, e.toString());
		oConn.rollback();
		throw e;
	}
}