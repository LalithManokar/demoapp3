const Message = $.import("sap.ino.xs.aof.lib", "message");
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const NotificationsProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationsProcesser");
const NotificationSummaryTextmoduleProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationSummaryTextmoduleProcesser");
const NotificationTextmoduleProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationTextmoduleProcesser");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function execute(oHQ, oConn) {
	Message.createMessage(Message.MessageSeverity.Info, "MSG_BATCH_MAIL_STARTED");
	try {
		var nJobId = CommonUtil.generateJobId(oHQ),
			oAllSummaryTxtModuleCache = {},
			oAllTxtModuleCache = {},
			oAllRolePriority = {},
			oAllSummaryRolePriority = {};
		CommonUtil.updateMailStatus(oHQ, nJobId);
		var oUserList = CommonUtil.getUserList(oHQ, nJobId);
		if (oUserList && oUserList.length > 0) {
			var aNotificationsSettings = CommonUtil.getAllNotificationSettings(oHQ);
			NotificationTextmoduleProcesser.parseData(oHQ, aNotificationsSettings, oAllRolePriority);
			NotificationSummaryTextmoduleProcesser.parseData(oHQ, aNotificationsSettings, oAllSummaryTxtModuleCache, oAllSummaryRolePriority);
			_.each(oUserList, function(oUser) {
				oUser.LOCALE = oUser.LOCALE || oUser.SLOCALE;
				NotificationsProcesser.process(oHQ, oUser, nJobId, aNotificationsSettings, oAllSummaryTxtModuleCache, oAllTxtModuleCache,
					oAllRolePriority, oAllSummaryRolePriority);
			});
		}
		oConn.commit();
	} catch (e) {
		Message.createMessage(Message.MessageSeverity.Error, "MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY", undefined, undefined, undefined, e.toString());
		oConn.rollback();
		throw e;
	}
	
}