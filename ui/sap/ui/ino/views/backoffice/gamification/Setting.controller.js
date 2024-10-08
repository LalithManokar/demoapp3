/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.models.object.GamificationSetting");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.gamification.Setting", {
	initModel: function() {
		var oDeffered = sap.ui.ino.models.object.GamificationSetting.getGamificationSetting();
		oDeffered.done(function(oData) {
			oData.RESULT.ENABLE_GAMIFICATION = !!oData.RESULT.ENABLE_GAMIFICATION;
			oData.RESULT.ENABLE_LEADERBOARD = !!oData.RESULT.ENABLE_LEADERBOARD;
			if(oData.RESULT.PUBLISH_BADGE && oData.RESULT.PUBLISH_BADGE.length > 0 ){
			oData.RESULT.PUBLISH_BADGE = (oData.RESULT.PUBLISH_BADGE || "").split(",")
				.map(function(oItem) {
					return Number(oItem);
				})
				.sort(function(previous, next) {
					return previous - next;
				});
			} else {
			    oData.RESULT.PUBLISH_BADGE = [];
			}
			oData.RESULT.PUBLISH_BADGE_TOKEN = [];
			oData.RESULT.PUBLISH_BADGE.forEach(function(oItem) {
				var oCurrentItem = oData.RESULT.ALL_DIMENSION.filter(function(oBadge) {
					return oBadge.ID === oItem;
				});
				if (oCurrentItem && oCurrentItem.length > 0) {
					oData.RESULT.PUBLISH_BADGE_TOKEN.unshift({
						key: oItem,
						text: oCurrentItem[0].NAME
					});
				}
			});
			this.oGameModel = jQuery.extend(true, {}, oData.RESULT);
			var oModel = new sap.ui.model.json.JSONModel(oData.RESULT);
			oModel.attachPropertyChange(this.handlePageDataChanged, this);
			this.getView().setModel(oModel, 'game');
		}.bind(this));
	},

	handlePageDataChanged: function() {
		if (this.hasPendingChanges()) {
			this.getView().oSaveButton.setEnabled(true);
		} else {
			this.getView().oSaveButton.setEnabled(false);
		}
	},

	hasPendingChanges: function() {
		var oPageData = this.getView().getModel('game').getData();
		if (this.oGameModel.ENABLE_GAMIFICATION !== oPageData.ENABLE_GAMIFICATION) {
			return true;
		}
		if (this.oGameModel.ENABLE_LEADERBOARD !== oPageData.ENABLE_LEADERBOARD) {
			return true;
		}
		if (this.oGameModel.PUBLISH_BADGE.length !== oPageData.PUBLISH_BADGE.length) {
			return true;
		}
		var bResult = false;
		this.oGameModel.PUBLISH_BADGE.forEach(function(oItem) {
			if (!bResult && oPageData.PUBLISH_BADGE.filter(function(oData) {
				return Number(oItem) === Number(oData);
			}).length === 0) {
				bResult = true;
			}
		});
		return bResult;
	},

	onSavePressed: function() {
		var that = this;
		var oPayloadData = jQuery.extend(true, {}, this.getView().getModel("game").getData());
		oPayloadData.ENABLE_GAMIFICATION = oPayloadData.ENABLE_GAMIFICATION ? 1 : 0;
		oPayloadData.ENABLE_LEADERBOARD = oPayloadData.ENABLE_LEADERBOARD ? 1 : 0;
		oPayloadData.PUBLISH_BADGE = oPayloadData.PUBLISH_BADGE.join(",");
		if (oPayloadData.ENABLE_GAMIFICATION === 0) {
			oPayloadData.ENABLE_LEADERBOARD = 0;
			oPayloadData.PUBLISH_BADGE = "";
		}
		var oDeffered = sap.ui.ino.models.object.GamificationSetting.saveGamificationSetting({
			GAMIFICATION_SETTING: oPayloadData
		});
		oDeffered.done(function() {
			var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			var oMessageParameters = {
				key: "MSG_GAMIFICATION_SETTING_SAVED",
				level: sap.ui.core.MessageType.Success,
				parameters: [],
				group: "gamification_setting",
				text: oMsg.getResourceBundle().getText("MSG_GAMIFICATION_SETTING_SAVED")
			};
			var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
			var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
			oApp.removeNotificationMessages("gamification_setting");
			oApp.addNotificationMessage(oMessage);

			// disable save button
			that.getView().oSaveButton.setEnabled(false);
			if (oPayloadData.ENABLE_GAMIFICATION === 0) {
				that.getView().getModel("game").setProperty("/ENABLE_LEADERBOARD", false);
				that.getView().getModel("game").setProperty("/PUBLISH_BADGE", "");
				that.getView().getModel("game").setProperty("/PUBLISH_BADGE_TOKEN" ,[]);
			}
			that.oGameModel = jQuery.extend(true, {}, that.getView().getModel("game").getData());
		});
		oDeffered.fail(function(oResponse) {
			var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, that.getView(),
				"gamification_setting");
			if (aActionMessages && aActionMessages.length > 0) {
				sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages(aActionMessages);
			}
		});
	}
});