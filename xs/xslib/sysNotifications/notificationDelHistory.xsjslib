const commonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function delHistory(oHQ) {
	var bEnableDeleteNotification = commonUtil.getSystemSetting(oHQ, "sap.ino.config.ENABLE_DELETE_NOTIFICATION_HIS");
	var nDelDaysNotification = commonUtil.getSystemSetting(oHQ, "sap.ino.config.DELETE_NOTIFICATION_WITHINDAYS") || 90;
	if (bEnableDeleteNotification && Number(bEnableDeleteNotification) > 0 && nDelDaysNotification && Number(nDelDaysNotification) > 0) {
		const sDelNotificationStatus =
			`
DELETE FROM "sap.ino.db.notification::t_notification_status"
WHERE MAIL_STATUS_CODE <> 'UNSENT' AND (NOTIFICATION_ID IN (SELECT ID
		FROM "sap.ino.db.notification::t_notification"
		WHERE EVENT_AT < ADD_DAYS(CURRENT_UTCTIMESTAMP,?)))`;
		oHQ.statement(sDelNotificationStatus).execute([0 - Number(nDelDaysNotification)]);
		
		const sDelNotification = `
DELETE FROM "sap.ino.db.notification::t_notification" AS A
		WHERE EVENT_AT < ADD_DAYS(CURRENT_UTCTIMESTAMP,?)
		    AND NOT EXISTS(SELECT 1 FROM "sap.ino.db.notification::t_notification_status"  AS B
		        WHERE B.NOTIFICATION_ID = A.ID AND B.MAIL_STATUS_CODE = 'UNSENT')`;
		oHQ.statement(sDelNotification).execute([0 - Number(nDelDaysNotification)]);
		
		const sDelNotificationStatus2 =
			`
DELETE FROM "sap.ino.db.notification::t_notification_status"
WHERE (NOTIFICATION_ID NOT IN (SELECT ID
		FROM "sap.ino.db.notification::t_notification"))`;
		oHQ.statement(sDelNotificationStatus2).execute();
	}
}