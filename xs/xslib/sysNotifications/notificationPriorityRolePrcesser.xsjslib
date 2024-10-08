// notificationPriorityRolePrcesser.xjslib
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const NotificationNotifyAuthorTextmoduleProcesser = $.import("sap.ino.xs.xslib.sysNotifications",
	"notificationNotifyAuthorTextmoduleProcesser");
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function findHighRole(oGroupedNotification, aRoles) {
	var sRole = void 0;
	_.each(aRoles, function(role) {
		var oRole = _.find(oGroupedNotification, function(item) {
			return item.ROLE_CODE === role;
		});
		if (oRole && !sRole) {
			sRole = role;
		}
	});
// 	if (!sRole && aRoles && aRoles.length > 0) {
// 		sRole = aRoles[0];
// 	}
	return sRole;
}

function process(aNotificationsSettings, aNotifications, oAllRolePriority, bSummary) {
	var oGroupedNotifications = _.groupBy(aNotifications, function(oNotification) {
		return oNotification.NOTIFICATION_ID + "_" + oNotification.USER_ID;
	});
	_.each(oGroupedNotifications, function(oGroupedNotification, sGrpKey) {
		var oNotification = oGroupedNotification[0],
			sRole = void 0,
			aRoles = void 0;
		if (oNotification.CAMPAIGN_ID) {
			if (oNotification.ACTION_CODE === "CHANGE_STATUS" && !bSummary) {
				var sTxtCode = NotificationNotifyAuthorTextmoduleProcesser.getTxtModuleCode(undefined, oNotification, aNotificationsSettings,
					undefined);
				if (sTxtCode) {
					aRoles = oAllRolePriority[sTxtCode];
					if (aRoles && aRoles.length > 0) {
						sRole = findHighRole(oGroupedNotification, aRoles);
					}
				}
			} else if (bSummary) {
				aRoles = oAllRolePriority[oNotification.ACTION_CODE];
				if (aRoles && aRoles.length > 0) {
					sRole = findHighRole(oGroupedNotification, aRoles);
				}
			} else {
				var aCampSetting = _.filter(aNotificationsSettings.OT_CAMP_SETTINGS, function(oCampSetting) {
					return oCampSetting.ACTION_CODE === oNotification.ACTION_CODE && oCampSetting.CAMPAIGN_ID === oNotification.CAMPAIGN_ID;
				});
				if (aCampSetting && aCampSetting.length > 0 && oAllRolePriority[aCampSetting[0].TEXT_MODULE_CODE] && oAllRolePriority[aCampSetting[0].TEXT_MODULE_CODE]
					.length > 0) {
					aRoles = oAllRolePriority[aCampSetting[0].TEXT_MODULE_CODE];
					sRole = findHighRole(oGroupedNotification, aRoles);
				}
			}
		}
		if (oGroupedNotification.length > 1) {
			_.each(aNotifications, function(oNotifi) {
				if (oNotifi.NOTIFICATION_ID + "_" + oNotifi.USER_ID === sGrpKey) {
					if (sRole && oNotifi.ROLE_CODE !== sRole) {
						oNotifi.MAIL_STATUS_CODE = CommonUtil.SKIPPED;
						oNotifi.MAIL_STATUS_REASON = "lower priority of role than " + sRole;
					}
				}
			});
		}
	});
}