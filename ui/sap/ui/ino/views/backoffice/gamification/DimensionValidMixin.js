/*!
 * @copyright@
 */

jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.declare("sap.ui.ino.views.backoffice.gamification.DimensionValidMixin");

(function() {
	sap.ui.ino.views.backoffice.gamification.DimensionValidMixin = {
		valid: function() {
			var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
			var oMsgModel = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			var sKey = "gamification";
			oApp.removeNotificationMessages(sKey);
			if (!this._validActivity(oApp, oMsgModel, sKey) || !this._validBadge(oApp, oMsgModel, sKey)) {
				return false;
			}
			return true;
		},

		_validActivity: function(oApp, oMsgModel, sKey) {
			var oModel = this.getModel();
			var aActivities = oModel.getProperty("/Activity");
			var aAllActivities = this.getView().getInspector().getModel("AllActivities").getProperty("/"),
				oCurrentActivity, bResult = true;
			if (!aActivities || aActivities.length === 0) {
			    	var oMsgMissing = new sap.ui.ino.application.Message({
						group: sKey,
						level: sap.ui.core.MessageType.Error,
						text: oMsgModel.getResourceBundle().getText("MSG_GAMIFICATION_ACTIVITY_MISSING")
					});
					oApp.addNotificationMessage(oMsgMissing);
					return false;
			}
			if (aActivities && aActivities.length > 0) {
				aActivities.forEach(function(oActivity) {
					if (!oActivity.CODE) {
						var oMsg = new sap.ui.ino.application.Message({
							group: sKey,
							level: sap.ui.core.MessageType.Error,
							text: oMsgModel.getResourceBundle().getText("MSG_GAMIFICATION_ACTIVITY_CODE_MISSING")
						});
						oApp.addNotificationMessage(oMsg);
						bResult = false;
						return false;
					}
					if (!oActivity.VALUE || (oActivity.VALUE && (isNaN(Number(oActivity.VALUE)) || !(/^-?[1-9]\d*$/.test(oActivity.VALUE))))) {
						oMsg = new sap.ui.ino.application.Message({
							group: sKey,
							level: sap.ui.core.MessageType.Error,
							text: oMsgModel.getResourceBundle().getText("MSG_GAMIFICATION_ACTIVITY_VALUE_INVALID")
						});
						oApp.addNotificationMessage(oMsg);
						bResult = false;
						return false;
					}
					oCurrentActivity = aAllActivities.find(function(a) {
						return a.CODE === oActivity.CODE;
					});
					if (oCurrentActivity && oCurrentActivity.PHASE_CONFIGURABLE && !oActivity.PHASE_CODE) {
						oMsg = new sap.ui.ino.application.Message({
							group: sKey,
							level: sap.ui.core.MessageType.Error,
							text: oMsgModel.getResourceBundle().getText("MSG_GAMIFICATION_PHASE_CODE_MISSING")
						});
						oApp.addNotificationMessage(oMsg);
						bResult = false;
						return false;
					}
					if (oCurrentActivity && oCurrentActivity.TIME_CONFIGURABLE && (!oActivity.WITHIN_TIME || isNaN(Number(oActivity.WITHIN_TIME)) || !(/^[1-9]\d*$/.test(oActivity.WITHIN_TIME)))) {
						oMsg = new sap.ui.ino.application.Message({
							group: sKey,
							level: sap.ui.core.MessageType.Error,
							text: oMsgModel.getResourceBundle().getText("MSG_GAMIFICATION_WITHIN_TIME_INVALID")
						});
						oApp.addNotificationMessage(oMsg);
						bResult = false;
						return false;
					}

				});
			}
			return bResult;
		},

		_validBadge: function(oApp, oMsgModel, sKey) {
			var oModel = this.getModel(),
				bResult = true;
			var redeem = oModel.getProperty("/REDEEM");
			var aBadges = oModel.getProperty("/Badge");
			if ((!redeem || Number(redeem) < 1) && aBadges && aBadges.length > 0) {
				aBadges.forEach(function(oBadge) {
					if (!oBadge.BADGE_VALUE || (oBadge.BADGE_VALUE && (isNaN(Number(oBadge.BADGE_VALUE)) || !(/^[1-9]\d*$/.test(oBadge.BADGE_VALUE))))) {
						var oMsg = new sap.ui.ino.application.Message({
							group: sKey,
							level: sap.ui.core.MessageType.Error,
							text: oMsgModel.getResourceBundle().getText("MSG_GAMIFICATION_BADGE_VALUE_INVALID", [oBadge.NAME])
						});
						oApp.addNotificationMessage(oMsg);
						bResult = false;
						return false;
					}
				});
			}
			return bResult;
		}
	};
}());