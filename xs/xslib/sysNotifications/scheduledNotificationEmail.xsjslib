const Message = $.import("sap.ino.xs.aof.lib", "message");
const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const Notification = $.import("sap.ino.xs.xslib.sysNotifications", "notification");
const NotificationEmail = $.import("sap.ino.xs.xslib.sysNotifications", "notificationEmail");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

const NOTIFICATION_SCHEDULE_SETTING_KEY = "NOTIFICATION";
const NOTIFICATION_SCHEDULE_TYPE_KEY = "IDEA_VIEW";
const NOTIFICATION_SCHEDULE_TIME_KEY = "NEXT_TIME";
var nJobId, oUserList, oCurrentNotificationList;

var getSystemSetting = _.memoize(function(oHQ, sCode) {
	var sSelStatement =
		'SELECT VALUE FROM "sap.ino.db.basis::t_local_system_setting" WHERE CODE = ?';
	var oSystemSetting = oHQ.statement(sSelStatement).execute(sCode);
	if (!oSystemSetting || oSystemSetting.length <= 0) {
		return "";
	}
	return oSystemSetting[0].VALUE;
}, function(oHQ, sCode) {
	return sCode;
});

function execute(oHQ, oConn) {
	Message.createMessage(Message.MessageSeverity.Info, "MSG_BATCH_MAIL_STARTED");
	try {
		_getJobId(oHQ);
		_updateMailStatus(oHQ);
		_getUserList(oHQ);
		_.each(oUserList, function(oUser) {
			_getNotifications(oHQ, oUser);
			_processNotification(oHQ, oUser);
		});
		oConn.commit();
	} catch (e) {
		Message.createMessage(Message.MessageSeverity.Error, "MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY", undefined, undefined, undefined, e.toString());
		oConn.rollback();
		throw e;
	}
}

function _getJobId(oHQ) {
	var sSelStatement =
		'SELECT VALUE FROM "sap.ino.db.notification::v_notification_email_scheduled_currentseconds"';
	nJobId = Number(oHQ.statement(sSelStatement).execute()[0].VALUE.toString());
}

function _updateMailStatus(oHQ) {
	oHQ
		.procedure("SAP_INO", "sap.ino.db.notification::p_notification_email_scheduled_service")
		.execute(this.nJobId);
}

function _getUserList(oHQ) {
	var sSelectStatement =
		"SELECT DISTINCT status.USER_ID,setting.SETTING_VALUE FROM  \"sap.ino.db.notification::t_notification_status\" AS status" +
		" LEFT OUTER JOIN \"sap.ino.db.iam::t_personalize_setting\" AS setting" +
		" ON status.USER_ID = setting.IDENTITY_ID AND setting.OBJECT_TYPE_CODE = 'NOTIFICATION_KEY' AND setting.TYPE_CODE = 'NOTIFICATION'" +
		" WHERE status.CHANGED_BY_ID = ? AND status.MAIL_STATUS_CODE = 'PROCESSING'";
	oUserList = oHQ.statement(sSelectStatement).execute(this.nJobId);
}

function _getNotifications(oHQ, oUser) {
	//p_notification_email_scheduled_getlist
	// 	oCurrentNotificationList = oHQ
	// 		.procedure("SAP_INO", "sap.ino.db.notification::p_notification_email_scheduled_getlist")
	// 		.execute(oUserId.USER_ID, this.nJobId)
	// 		.ot_notifications;

	var sSelectStatement = "SELECT TOP 3000 " +
		"status.id as id, " +
		"status.notification_id, " +
		"status.user_id, " +
		"status.role_code, " +
		"status.status_code, " +
		"notification.campaign_id, " +
		"notification.event_at, " +
		"notification.notification_code, " +
		"notification.object_type_code, " +
		"notification.object_id, " +
		"notification.object_text, " +
		"notification.sub_text, " +
		"notification.response, " +
		"notification.actor_id, " +
		"notification.owner_id, " +
		"notification.involved_id, " +
		"identity.name, " +
		"identity.email, " +
		"identity.is_external, " +
		"locale.locale " +
		"FROM " +
		"\"sap.ino.db.notification::t_notification_status\" AS status " +
		"INNER JOIN " +
		"\"sap.ino.db.notification::t_notification\" AS notification " +
		"ON  " +
		" notification.id = status.notification_id " +
		"INNER JOIN " +
		"\"sap.ino.db.iam::t_identity\" AS identity " +
		"ON  " +
		"status.user_id = identity.id " +
		"left outer join " +
		"\"sap.ino.db.basis::v_user_locale\" AS locale " +
		"ON  " +
		" locale.user_id = identity.id " +
		"WHERE " +
		" status.user_id = ? AND status.mail_status_code = 'PROCESSING' " +
		" AND status.CHANGED_BY_ID = ?";
	oCurrentNotificationList = oHQ.statement(sSelectStatement).execute(oUser.USER_ID, this.nJobId);
}

function _processNotification(oHQ, oUser) {
	var aNotifications = Notification.getNotificationTextDataBatch(oCurrentNotificationList);
	if (!oUser.SETTING_VALUE || (oUser.SETTING_VALUE && oUser.SETTING_VALUE === 0)) {
		_processNotificationGroupByCampaignId(oHQ, aNotifications);
	} else {
		_processNotificationGroupByTypeCode(oHQ, aNotifications, oUser);
	}
}

function _processNotificationGroupByCampaignId(oHQ, aNotifications) {
	var sContent = "",
		oSentNotifications = {
			IT_NOTIFICATION_STATUS_IDS: []
		};
	var oGroupedNotifications = _.groupBy(aNotifications, function(aNotification) {
		return aNotification.CAMPAIGN_ID;
	});
	_.each(oGroupedNotifications, function(oGroupedNotification, nCampaignId) {
		_.each(oGroupedNotification, function(oNotification) {
			if (oNotification.RESPONSE) {
				NotificationEmail.handleSingleNotification(oHQ, oNotification);
				return true;
			}
			if(oNotification.NOTIFICATION_CODE === 'IDEA_DELETED'){
		        sContent += NotificationEmail.createNotificationIdeaDeletedEntry(oHQ, oNotification);
		    }else{
			    sContent += NotificationEmail.createNotificationEntry(oHQ, oNotification, true);
		    }
			oSentNotifications.IT_NOTIFICATION_STATUS_IDS.push({
				"ID": oNotification.ID
			});
		});

		if (sContent) {
			NotificationEmail.handleBundleNotification(oHQ, "<ul>" + sContent + "</ul>", {
				NAME: oGroupedNotification[0].NAME,
				LOCALE: oGroupedNotification[0].LOCALE,
				CAMPAIGN_ID: nCampaignId,
				EMAIL: aNotifications[0].EMAIL
			}, oSentNotifications, "sap.ino.db.notification::p_notification_email_scheduled_status_update");
		}
	});
}

function _processNotificationGroupByTypeCode(oHQ, aNotifications, oUser) {
	var sContent = "",
		oSentNotifications = {
			IT_NOTIFICATION_STATUS_IDS: []
		};
	var oGroupedNotifications = _.groupBy(aNotifications, function(aNotification) {
		return aNotification.OBJECT_TYPE_CODE;
	});
	_.each(oGroupedNotifications, function(oGroupedNotification, sTypeCode) {
		sContent += "<h3>" + sTypeCode + "</h3><ul>";
		_.each(oGroupedNotification, function(oNotification) {
			sContent += NotificationEmail.createNotificationEntry(oHQ, oNotification, true);
			oSentNotifications.IT_NOTIFICATION_STATUS_IDS.push({
				"ID": oNotification.ID
			});
		});
		sContent += "</ul>";
	});

	if (sContent) {
		_handleBundleNotification(oHQ, sContent, {
			NAME: aNotifications[0].NAME,
			LOCALE: aNotifications[0].LOCALE,
			EMAIL: aNotifications[0].EMAIL
		}, oSentNotifications, oUser);
	}
}

function _handleBundleNotification(oHQ, sContent, oCurrentData, oSentNotifications, oUser) {
	var sTemplate = NotificationEmail.getTemplateData(getSystemSetting(oHQ, "sap.ino.config.NOTIFICATION_MAIL_TEMPLATE_CODE"), oCurrentData.LOCALE);
	if (sTemplate && sTemplate.indexOf("{{USER_NAME}}") > -1) {
		sContent = sTemplate.replace("{{USER_NAME}}", oCurrentData.NAME).replace("{{CONTENT}}", sContent);
	} else {
		sContent = TextBundle.getText("messages", "MSG_NOTIFICATION_BODY", [oCurrentData.NAME, sContent], oCurrentData.LOCALE);
	}
	var sSubjectKey;
	switch (oUser.SETTING_VALUE) {
		case 1:
			sSubjectKey = "MSG_NOTIFICATION_SUBJECT_Daily";
			break;
		case 7:
			sSubjectKey = "MSG_NOTIFICATION_SUBJECT_Weekly";
			break;
		default:
			sSubjectKey = "MSG_NOTIFICATION_SUBJECT";
	}
	NotificationEmail.sendNotificationMail(oHQ, sContent, oCurrentData, oSentNotifications,
		"sap.ino.db.notification::p_notification_email_scheduled_status_update",
		TextBundle.getText("messages", sSubjectKey, null, oCurrentData.LOCALE));
}

function _updateScheduledTimeForUser(oHQ) {
	var sSelStatement =
		"SELECT ID,IDENTITY_ID,OBJECT_TYPE_CODE,SETTING_VALUE,TYPE_CODE FROM " +
		"\"sap.ino.db.iam::t_personalize_setting\" WHERE OBJECT_TYPE_CODE = ? OR OBJECT_TYPE_CODE = ?";
	var oList = oHQ.statement(sSelStatement).execute([NOTIFICATION_SCHEDULE_TYPE_KEY, NOTIFICATION_SCHEDULE_TIME_KEY]);
	var oSettings = oList;
	var oTypeList = _.where(oSettings, {
		OBJECT_TYPE_CODE: NOTIFICATION_SCHEDULE_TYPE_KEY
	});
	var oTimeList = _.where(oSettings, {
			OBJECT_TYPE_CODE: NOTIFICATION_SCHEDULE_TIME_KEY
		}),
		oNewTimeList = [],
		oUpdateTimeList = [],
		oTimeSetting;
	_.each(oTypeList,
		function(oType) {
			oTimeSetting = _.where(oTimeList, {
				IDENTITY_ID: oType.IDENTITY_ID
			});
			oTimeSetting = oTimeSetting[0];
			if (oTimeSetting) {
				if (Number(oTimeSetting.SETTING_VALUE) < nJobId + oType.SETTING_VALUE * 24 * 60 * 60) {
					oUpdateTimeList.push({
						ID: oTimeSetting.ID,
						IDENTITY_ID: oTimeSetting.IDENTITY_ID,
						OBJECT_TYPE_CODE: oTimeSetting.OBJECT_TYPE_CODE,
						SETTING_VALUE: Number(oTimeSetting.SETTING_VALUE) + oType.SETTING_VALUE * 24 * 60 * 60,
						TYPE_CODE: oTimeSetting.TYPE_CODE
					});
				}
			} else {
				oNewTimeList.push({
					IDENTITY_ID: oType.IDENTITY_ID,
					OBJECT_TYPE_CODE: NOTIFICATION_SCHEDULE_TIME_KEY,
					SETTING_VALUE: nJobId + oType.SETTING_VALUE * 24 * 60 * 60,
					TYPE_CODE: NOTIFICATION_SCHEDULE_SETTING_KEY
				});
			}
			oTimeSetting = null;
		});
	if (oUpdateTimeList.length > 0) {
		oHQ.table("SAP_INO", "sap.ino.db.iam::t_personalize_setting").upsert(oUpdateTimeList);
	}
	_.each(oNewTimeList, function(oNewTime) {
		oHQ.statement(
			'INSERT INTO "sap.ino.db.iam::t_personalize_setting"(ID,IDENTITY_ID,OBJECT_TYPE_CODE,SETTING_VALUE,TYPE_CODE) ' +
			'SELECT "sap.ino.db.iam::s_personalize_setting".nextval,' +
			oNewTime.IDENTITY_ID + ',\'' +
			oNewTime.OBJECT_TYPE_CODE + '\',' +
			oNewTime.SETTING_VALUE + ',\'' +
			oNewTime.TYPE_CODE + '\' FROM DUMMY'
		).execute();
	});
}