/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.NotificationSystemSetting");
jQuery.sap.require("sap.ui.ino.application.Configuration");

(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
	jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

	function fnOnread(oDefaultData) {
		if (oDefaultData.Receivers) {
			oDefaultData.Receivers.forEach(function(oReceiver) {
				oReceiver.ROLE_NAME = sap.ui.getCore().getModel("i18n").getResourceBundle().getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ROLE_' + oReceiver.ROLE_CODE);
			});
			oDefaultData.Receivers.sort(function(oPrev, oNext) {
				if (oPrev.ROLE_NAME > oNext.ROLE_NAME) {
					return 1;
				} else if (oPrev.ROLE_NAME < oNext.ROLE_NAME) {
					return -1;
				} else {
					return 0;
				}
			});
		}
		oDefaultData.receivedRoles = oDefaultData.Receivers.filter(function(oReceiverData) {
			return oReceiverData.IS_RECEIVE_EMAIL === 1;
		}).map(function(oReceiverData) {
			return oReceiverData.ROLE_CODE;
		});
		oDefaultData.previewLang = sap.ui.ino.application.Configuration.getSystemDefaultLanguage();
		oDefaultData.previewRole = oDefaultData.receivedRoles[0];

		return oDefaultData;
	}

	function fnOnnormalizeData(oDefaultData) {
		oDefaultData.Receivers.forEach(function(oReceiverData) {
			if (oDefaultData.receivedRoles.indexOf(oReceiverData.ROLE_CODE) > -1) {
				oReceiverData.IS_RECEIVE_EMAIL = 1;
			} else {
				oReceiverData.IS_RECEIVE_EMAIL = 0;
			}
		});
		return oDefaultData;
	}

	sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.NotificationSystemSetting", {
		objectName: "sap.ino.xs.object.newnotification.NotificationSystemSetting",
		readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("NotificationSystemSetting"),
		invalidation: {
			entitySets: ["NotificationSystemSetting", "SearchNotification"]
		},
		determinations: {
			onRead: fnOnread,
			onNormalizeData: fnOnnormalizeData
		}
	});
})();