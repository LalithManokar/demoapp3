const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const Mail = $.import("sap.ino.xs.xslib", "mail");
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const Notification = $.import("sap.ino.xs.xslib.sysNotifications", "notification");
const NotificationEmail = $.import("sap.ino.xs.xslib.sysNotifications", "notificationEmail");
const NotificationItemProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationItemProcesser");
const NotificationImgProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationImgProcesser");
const NotificationsTemplateProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationsTemplateProcesser");
const NotificationPriorityRolePrcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationPriorityRolePrcesser");

var EnhancementSpot = $.import("sap.ino.xs.xslib.enhancement", "EnhancementSpot");
var notificationExtension = EnhancementSpot.get("sap.ino.xs.xslib.sysNotifications.notificationExtension");

const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function _getEmailSubjectKey(oUser) {
	if (oUser.SETTING_VALUE === 1) {
		return "MSG_NOTIFICATION_SUBJECT_Daily";
	} else if (oUser.SETTING_VALUE === 7) {
		return "MSG_NOTIFICATION_SUBJECT_Weekly";
	} else {
		return "MSG_NOTIFICATION_SUBJECT";
	}
}

function _sendNotificationMail(sContent, sEmail, oSentNotifications, aImages, sEmailSubject) {
	// 	if (sContent && oSentNotifications) {
	// 		sContent += "<p style=\"display:none\">" + JSON.stringify(oSentNotifications) + "</p>";
	// 	}
	sContent = "<html><body>" + sContent + "</html></body>";
	try {
		Mail.send(sEmail, sEmailSubject, sContent, undefined, aImages);
		oSentNotifications.MAIL_STATUS_CODE = 'SENT';
		oSentNotifications.MAIL_STATUS_REASON = 'DONE';
	} catch (e) {
		oSentNotifications.MAIL_STATUS_CODE = 'ERROR';
		oSentNotifications.MAIL_STATUS_REASON = e.toString();
		TraceWrapper.log_exception(e);
	}
}

function _sendBatchNotificationMail(sContent, sEmail, aSentNotifications, aImages, sEmailSubject) {
	// 	if (sContent && aSentNotifications) {
	// 		sContent += "<p style=\"display:none\">" + JSON.stringify(aSentNotifications) + "</p>";
	// 	}
	sContent = "<html><body>" + sContent + "</html></body>";
	try {
		Mail.send(sEmail, sEmailSubject, sContent, undefined, aImages);
		_.each(aSentNotifications, function(oSentNotifications) {
			oSentNotifications.MAIL_STATUS_CODE = !oSentNotifications.MAIL_STATUS_CODE ? 'SENT' : (oSentNotifications.MAIL_STATUS_CODE !==
				"PROCESSING" ? oSentNotifications.MAIL_STATUS_CODE :
				'SENT');
			oSentNotifications.MAIL_STATUS_REASON = oSentNotifications.MAIL_STATUS_REASON || 'DONE';
		});
	} catch (e) {
		_.each(aSentNotifications, function(oSentNotifications) {
			oSentNotifications.MAIL_STATUS_CODE = 'ERROR';
			oSentNotifications.MAIL_STATUS_REASON = e.toString();
		});
		TraceWrapper.log_exception(e);
	}
}

function _processNotificationOneByOne(oHQ, aCampDatas, aNotifications, aNotificationsSettings, oUser, oAllRolePriority) {
	var oSentNotifications = {
		IT_NOTIFICATION_STATUS_IDS: []
	};
	NotificationPriorityRolePrcesser.process(aNotificationsSettings, aNotifications, oAllRolePriority);
	_.each(aNotifications, function(oNotification) {
		var oResNoti = {
			"ID": oNotification.ID,
			"MAIL_STATUS_CODE": oNotification.MAIL_STATUS_CODE === "PROCESSING" ? CommonUtil.SKIPPED : oNotification.MAIL_STATUS_CODE,
			"MAIL_STATUS_REASON": oNotification.MAIL_STATUS_REASON || "NO CONTENT. Please check textmodule, user's language(" + oUser.LOCALE +
				") or status model."
		};
		if (oNotification.MAIL_STATUS_CODE === "PROCESSING" && oNotification.SUBTITLE) {
			var sContentData = NotificationsTemplateProcesser.getData(oHQ, oNotification, aCampDatas, aNotificationsSettings, CommonUtil.USER_SETTING_TYPE
				.IMME, oUser);
			var oImgs = NotificationImgProcesser.getData(oHQ, sContentData, oNotification.CAMPAIGN_ID);
			var sSubject = notificationExtension.processEmailSubject(oHQ, oNotification);
			if(!sSubject){
			    sSubject = TextBundle.getText("messages", "MSG_NOTIFICATION_SUBJECT", null, oUser.LOCALE);
			}
			_sendNotificationMail(oImgs.ContentData, oNotification.EMAIL, oResNoti, oImgs.aImages, sSubject);
		}
		oSentNotifications.IT_NOTIFICATION_STATUS_IDS.push(oResNoti);
	});
	oHQ.procedure("SAP_INO", "sap.ino.db.newnotification::p_notification_email_scheduled_status_update").execute(oSentNotifications);
	oHQ.getConnection().commit();
}

function _processNotificationGroupByActionCode(oHQ, aCampDatas, aNotifications, aNotificationsSettings, oUser, oAllSummaryTxtModuleCache,
	oAllSummaryRolePriority) {
	var sContent = "",
		oSentNotifications = {
			IT_NOTIFICATION_STATUS_IDS: []
		};
	NotificationPriorityRolePrcesser.process(aNotificationsSettings, aNotifications, oAllSummaryRolePriority, true);
	var oGroupedNotifications = _.groupBy(aNotifications, function(oNotification) {
		return oNotification.ACTION_CODE;
	});
	_.each(oGroupedNotifications, function(oGroupedNotification, sActionCode) {
		_.each(oGroupedNotification, function(oNotification) {
			if (oNotification.MAIL_STATUS_CODE === "PROCESSING") {
				sContent += (oNotification.SUBTITLE || "");
			}
			if (!oNotification.SUBTITLE) {
				oSentNotifications.IT_NOTIFICATION_STATUS_IDS.push({
					"ID": oNotification.ID,
					"MAIL_STATUS_CODE": CommonUtil.SKIPPED,
					"MAIL_STATUS_REASON": "NO CONTENT. Please check textmodule, user's language(" + oUser.LOCALE + ") or status model."
				});
			} else {
				oSentNotifications.IT_NOTIFICATION_STATUS_IDS.push({
					"ID": oNotification.ID,
					"MAIL_STATUS_CODE": oNotification.MAIL_STATUS_CODE,
					"MAIL_STATUS_REASON": oNotification.MAIL_STATUS_REASON
				});
			}
		});
	});

	if (sContent) {
		var sContentData = NotificationsTemplateProcesser.getData(oHQ, null, aCampDatas, aNotificationsSettings, CommonUtil.USER_SETTING_TYPE
			.BATCH, oUser, sContent, oAllSummaryTxtModuleCache);
		var oImgs = NotificationImgProcesser.getData(oHQ, sContentData);
		var sSubject = TextBundle.getText("messages", _getEmailSubjectKey(oUser), null, oUser.LOCALE);
		// 		NotificationPlaceholderCampImgProcesser.process(oHQ, sContentData, oNotification.CAMPAIGN_ID);
		_sendBatchNotificationMail(sContentData, aNotifications[0].EMAIL, oSentNotifications.IT_NOTIFICATION_STATUS_IDS,
			oImgs.aImages, sSubject);
	}
	oHQ.procedure("SAP_INO", "sap.ino.db.newnotification::p_notification_email_scheduled_status_update").execute(oSentNotifications);
	oHQ.getConnection().commit();
}

function _getUnprocessNotifications(oHQ, oUser, nJobId) {
	var sSelectStatement =
		`SELECT TOP ` + CommonUtil.PROCESS_COUNT +
		`
	 status.id AS id, 
	status.notification_id, 
	status.user_id, 
	rm.role_code, 
	status.status_code, 
	notification.campaign_id, 
	notification.event_at, 
	notification.notification_code, 
	notification.object_type_code, 
	notification.object_id, 
	notification.object_text, 
	notification.sub_text, 
	notification.response, 
	notification.actor_id, 
	notification.owner_id, 
	notification.involved_id, 
	notification.action_code, 
	notification.history_object_info, 
	identity.name, 
	identity.email, 
	identity.is_external,
	'PROCESSING' AS MAIL_STATUS_CODE,
	'' AS MAIL_STATUS_REASON
FROM "sap.ino.db.notification::t_notification_status" AS status
	INNER JOIN "sap.ino.db.notification::t_notification" AS notification
	ON notification.id = status.notification_id
	INNER JOIN "sap.ino.db.iam::t_identity" AS identity
	ON status.user_id = identity.id
	INNER JOIN "sap.ino.db.newnotification::t_notification_receiver_role_mapping" AS rm
	ON rm.ACTUAL_ROLE_CODE = status.ROLE_CODE
WHERE status.user_id = ?
	AND status.mail_status_code = 'PROCESSING'
	AND status.CHANGED_BY_ID = ? 
ORDER BY status.id ASC;`;
	return oHQ.statement(sSelectStatement).execute(oUser.USER_ID, nJobId);
}

function _processNotification(oHQ, oUser, aCurrentNotificationList, aNotificationsSettings, oAllSummaryTxtModuleCache, oAllTxtModuleCache,
	oAllRolePriority, oAllSummaryRolePriority) {
	var aCampIds = _.pluck(aCurrentNotificationList, 'CAMPAIGN_ID');
	var aCampDatas = CommonUtil.getCampaignsData(oHQ, aCampIds, oUser.LOCALE);
	_processAssignExpert(aCurrentNotificationList);
	if (!oUser.SETTING_VALUE || (oUser.SETTING_VALUE && oUser.SETTING_VALUE === 0)) {
		NotificationItemProcesser.process(oHQ, aCurrentNotificationList, aCampDatas, aNotificationsSettings, CommonUtil.USER_SETTING_TYPE.IMME,
			oUser.LOCALE, oAllTxtModuleCache);
		_processNotificationOneByOne(oHQ, aCampDatas, aCurrentNotificationList, aNotificationsSettings, oUser, oAllRolePriority);
		return;
	}
	var aAuthorNotificationList = [],
		aBatchNotificationList = [];
	_.each(aCurrentNotificationList, function(oNotification) {
		if (oNotification.ACTION_CODE === CommonUtil.NOTIFY_AUTHOR) {
			aAuthorNotificationList.push(oNotification);
		} else {
			aBatchNotificationList.push(oNotification);
		}
	});
	NotificationItemProcesser.process(oHQ, aAuthorNotificationList, aCampDatas, aNotificationsSettings, CommonUtil.USER_SETTING_TYPE.IMME,
		oUser.LOCALE, oAllTxtModuleCache);
	_processNotificationOneByOne(oHQ, aCampDatas, aAuthorNotificationList, aNotificationsSettings, oUser);
	NotificationItemProcesser.process(oHQ, aBatchNotificationList, aCampDatas, aNotificationsSettings, CommonUtil.USER_SETTING_TYPE.BATCH,
		oUser.LOCALE, oAllSummaryTxtModuleCache);
	_processNotificationGroupByActionCode(oHQ, aCampDatas, aBatchNotificationList, aNotificationsSettings, oUser, oAllSummaryTxtModuleCache,
		oAllSummaryRolePriority);
}

function _processAssignExpert(aCurrentNotificationList) {
	var oGrpNotification = {};
	_.each(aCurrentNotificationList, function(oNotification) {
		if (oNotification.ACTION_CODE === 'ASSIGN_EXPERT') {
			var sKey = oNotification.ACTION_CODE + "_" + oNotification.ROLE_CODE + "_" + oNotification.USER_ID + "_" + oNotification.EVENT_AT + "_" +
				oNotification.OBJECT_TYPE_CODE +
				"_" + oNotification.OBJECT_ID;
			if (!oGrpNotification.hasOwnProperty(sKey)) {
				oNotification.HISTORY_OBJECT_INFO = oNotification.INVOLVED_ID;
				oGrpNotification[sKey] = {};
				oGrpNotification[sKey].oNoti = oNotification;
			} else {
				oNotification.MAIL_STATUS_CODE = "SKIPPED";
				oNotification.MAIL_STATUS_REASON = "It was grouped by id " + oGrpNotification[sKey].oNoti.ID;
				oGrpNotification[sKey].oNoti.HISTORY_OBJECT_INFO += ";" + oNotification.INVOLVED_ID;
			}
		}
	});
}

function process(oHQ, oUser, nJobId, aNotificationsSettings, oAllSummaryTxtModuleCache, oAllTxtModuleCache, oAllRolePriority,
	oAllSummaryRolePriority) {
	// var index = 1;
	// 	while (true) {
	var aCurrentNotificationList = _getUnprocessNotifications(oHQ, oUser, nJobId);
	if (aCurrentNotificationList && aCurrentNotificationList.length > 0) {
		_processNotification(oHQ, oUser, aCurrentNotificationList, aNotificationsSettings, oAllSummaryTxtModuleCache, oAllTxtModuleCache,
			oAllRolePriority, oAllSummaryRolePriority);
	}
	// 		if (!aCurrentNotificationList || aCurrentNotificationList.length < CommonUtil.PROCESS_COUNT || index > 3) {
	// 			break;
	// 		}
	// 		index++;
	// 	}

}