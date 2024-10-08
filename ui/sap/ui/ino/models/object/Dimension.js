/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.Dimension");
(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
	jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

	sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.Dimension", {
		objectName: "sap.ino.xs.object.gamification.Dimension",
		readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("Dimension", {}),
		determinations: {
			onCreate: function() {
				var oData =  {
					NAME: "",
					UNIT: "",
					TECHNICAL_NAME: "",
					SCOPE: "SYSTEM",
					STATUS: 1,
					DESCRIPTION: "",
					REDEEM: 0,
					Activity: [],
					Badge: []
				};
				return oData;
			},

			onNormalizeData: function(oData) {
				if (oData.REDEEM > 0) {
					oData.Badge = [];
				}
				if (oData.Badge) {
					oData.Badge.forEach(function(oBadge) {
						if (oBadge.BADGE_VALUE) {
							oBadge.BADGE_VALUE = Number(oBadge.BADGE_VALUE);
						}
					});
				}
				if (oData.Activity) {
					oData.Activity.forEach(function(oActivity) {
						if (oActivity.CODE) {
							var activity = oData.AllActivities && oData.AllActivities.find(function(a) {
								return a.CODE === oActivity.CODE;
							});
							if (activity && !activity.PHASE_CONFIGURABLE) {
								oActivity.PHASE_CODE = null;
							}
							if (activity && !activity.TIME_CONFIGURABLE) {
								oActivity.TIME_UNIT = null;
								oActivity.WITHIN_TIME = null;
							}
				// 			if (activity && activity.TIME_CONFIGURABLE && activity.WITHIN_TIME && activity.TIME_UNIT === "D") {
				// 				oActivity.WITHIN_TIME = oActivity.WITHIN_TIME;
				// 			}
						}
					});
				}
				return oData;
			}
		},

		newActivity: function(sCode) {
			var oActivity = {
				"CODE": sCode || "",
				"PHASE_CODE": "",
				"VALUE": null,
				"TIME_UNIT": "H",
				"WITHIN_TIME": null
			};
			var iHandle = this.getNextHandle();
			oActivity.ID = iHandle;
			var oNodeArray = this.getProperty("/Activity");
			if (!oNodeArray) {
				oNodeArray = [];
				this.setProperty("/Activity", oNodeArray);
			}
			oNodeArray.push(oActivity);
			this.checkUpdate(true);
			return iHandle;
		},

		newBadge: function() {
			var oBadge = {
				"NAME": "",
				"BADGE_VALUE": null,
				"DESCRIPTION": "",
				"BADGE_ATTACHMENT_ID": null
			};
			var iHandle = this.getNextHandle();
			oBadge.ID = iHandle;
			var oNodeArray = this.getProperty("/Badge");
			if (!oNodeArray) {
				oNodeArray = [];
				this.setProperty("/Badge", oNodeArray);
			}
			oNodeArray.push(oBadge);
			this.checkUpdate(true);
			return iHandle;
		},

		addAttachment: function(oNewAttachment, nIndex) {
			oNewAttachment.ROLE_TYPE_CODE = "ATTACHMENT";
			var sPath = "/Badge/" + nIndex + "/Attachment";
			var aAttachment = this.getProperty(sPath);
			aAttachment = [];
			this.setProperty(sPath, aAttachment);
			aAttachment.unshift(oNewAttachment);
			this.checkUpdate(true);
		},

		removeAttachment: function(iId, nIndex) {
			var sPath = "/Badge/" + nIndex + "/Attachment";
			var aAttachment = jQuery.grep(this.getProperty(sPath), function(
				oAttachment) {
				return oAttachment.ID === iId;
			});
			var oDelAttachment = aAttachment && aAttachment[0];
			if (oDelAttachment) {
				this.removeChild(oDelAttachment);
			}
		}
	});
})();