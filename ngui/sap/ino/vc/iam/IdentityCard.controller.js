sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/ino/vc/commons/mixins/MailMixin",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/application/Configuration",
    "sap/m/MessageToast",
    "sap/ui/Device",
    "sap/ino/controls/QuickViewGroupDimension"
], function(BaseController, MailMixin, JSONModel, Configuration, MessageToast, Device, QuickViewGroupDimension) {
	"use strict";

	var oFormatter = {};
	jQuery.extend(oFormatter, BaseController.prototype.formatter);

	oFormatter.generateMailURL = function(sMailAddress) {
		var oContent = this.oView.getController().createMailContent();

		if (oContent) {
			//sap.m.URLHelper is a namescpace and can't be required in the define
			return sap.m.URLHelper.normalizeEmail(sMailAddress, oContent.subject, oContent.body);
		} else {
			return sap.m.URLHelper.normalizeEmail(sMailAddress);
		}
	};

	return BaseController.extend("sap.ino.vc.iam.IdentityCard", jQuery.extend({}, MailMixin, {
		formatter: oFormatter,
		open: function(oControl, iId) {
			var that = this;
			var oView = that.getView();
			var oIdentityCard;
			if (Device && Device.system && Device.system.phone) {
				oIdentityCard = oView.byId("identityCardPhone");
			} else {
				oIdentityCard = oView.byId("identityCard");
			}
			that._iUserId = iId;
			// prevent empty column in place of scrollbar in some cases
			/*if (oIdentityCard && oIdentityCard._oPopover && oIdentityCard.getWidth()) {
                oIdentityCard._oPopover.setContentWidth(oIdentityCard.getWidth());
            }*/
			that._oIdentityModel = new JSONModel();
			if (Configuration.getUserProfileByTextURL(iId)) {
				that._oIdentityModel.loadData(Configuration.getUserProfileByTextURL(iId), {
					"USER_ID": iId
				}, true, "GET");
				that._oIdentityModel.attachRequestCompleted(null, function() {
					var indentityData = that._oIdentityModel.getData();
					indentityData.ENABLE_GAMIFICATION = that.getView().getModel("config").getProperty("/ENABLE_GAMIFICATION") === 1 ? true : false;
					indentityData.ENABLE_LEADERBOARD = that.getView().getModel("config").getProperty("/ENABLE_LEADERBOARD") === 1 ? true : false;
					indentityData.CURRENT_USER_ID = Configuration.getCurrentUser().USER_ID;
					indentityData.QUERY_USER_ID = that._iUserId;
					that._oIdentityModel.setData(indentityData);
					oView.setModel(that._oIdentityModel, "identityData");
					if (indentityData.ENABLE_GAMIFICATION) {
						that.constructGamificationDimension(that._oIdentityModel, oView);
					}
					jQuery.sap.delayedCall(0, that, function() {
						if (Device.system.phone) {
							oIdentityCard.open();
						} else {
							oIdentityCard.openBy(oControl);
						}
					});
				});
			}
		},

		onClose: function() {
			// only called on phone
			if (Device.system.phone) {
				var oIdentityCardDialog = this.getView().byId("identityCardPhone");
				oIdentityCardDialog.close();
			}
		},
		onPressNavigateToLeaderBoard: function(oEvent) {
			var oController = this.getView().getController();
			oController.navigateTo("leaderboard");
		},
		constructGamificationDimension: function(oModel, oView) {
			var oCardView, oQuickViewDimensionCtrl, sImageUrl, sStartLevel, sEndLevel, iDiffPointsBTlvl, iPointsToNextLvl, currentPointsBWBadge;
			if (Device.system.phone) {
				oCardView = oView.getContent()[1];
				oQuickViewDimensionCtrl = oCardView.getContent()[0];
			} else {
				oCardView = oView.getContent()[0];
				oQuickViewDimensionCtrl = oCardView.getPages()[0];
			}
			var aDimensions = oModel.getData().GAMIFICATION_INFO;
			oQuickViewDimensionCtrl.removeAllDimensionGroups();
			if (!Array.isArray(aDimensions)) {
				return;
			}
			var bSameUser = true;
			if (oModel.getData().CURRENT_USER_ID !== oModel.getData().QUERY_USER_ID) {
				bSameUser = false;
			}
			for (var i = 0; i < aDimensions.length; i++) {
				sStartLevel = "";
				sEndLevel = "";
				iDiffPointsBTlvl = 0;
				iPointsToNextLvl = 0;
				sImageUrl = "";
				currentPointsBWBadge = 0;
				if (JSON.stringify(aDimensions[i].BADGE) !== "{}") {
					sStartLevel = aDimensions[i].BADGE.currentBadge.NAME;
					sEndLevel = !aDimensions[i].BADGE.nextBadge.NAME ? "" : aDimensions[i].BADGE.nextBadge.NAME;

					if (aDimensions[i].BADGE.nextBadge.NAME && aDimensions[i].BADGE.currentBadge.NAME) {
						iDiffPointsBTlvl = aDimensions[i].BADGE.nextBadge.BADGE_VALUE - aDimensions[i].BADGE.currentBadge.BADGE_VALUE;
					}
					if (aDimensions[i].BADGE.nextBadge.NAME && !aDimensions[i].BADGE.currentBadge.NAME) {
						iDiffPointsBTlvl = aDimensions[i].BADGE.nextBadge.BADGE_VALUE;
					}
					if (!aDimensions[i].BADGE.nextBadge.NAME && aDimensions[i].BADGE.currentBadge.NAME) {
						iDiffPointsBTlvl = aDimensions[i].BADGE.currentBadge.BADGE_VALUE;
					}

					iPointsToNextLvl = aDimensions[i].BADGE.nextBadge.NAME ? aDimensions[i].BADGE.nextBadge.BADGE_VALUE - parseInt(aDimensions[i].TOTAL,
						10) : 0;

					if (JSON.stringify(aDimensions[i].BADGE.currentBadge) !== "{}" && aDimensions[i].BADGE.currentBadge.Attachment.length > 0) {
						sImageUrl = Configuration.getAttachmentTitleImageDownloadURL(aDimensions[i].BADGE.currentBadge.Attachment[0].ATTACHMENT_ID);
					}
					if (JSON.stringify(aDimensions[i].BADGE.currentBadge) !== "{}") {
						var iDiffTotalBWBadge = parseInt(aDimensions[i].TOTAL, 10) - aDimensions[i].BADGE.currentBadge.BADGE_VALUE;
						currentPointsBWBadge = iDiffTotalBWBadge > 0 ? iDiffTotalBWBadge : parseInt(aDimensions[i].TOTAL, 10);
					} else {
						currentPointsBWBadge = parseInt(aDimensions[i].TOTAL, 10);
					}
				}
				if (sImageUrl) {
					oQuickViewDimensionCtrl.addDimensionGroup(new QuickViewGroupDimension({
						heading: aDimensions[i].NAME,
						headingIcon: sImageUrl,
						totalPoints: parseInt(aDimensions[i].TOTAL, 10),
						pointsToNextLevel: iPointsToNextLvl,
						startLevel: sStartLevel, //aDimensions[i].currentBadge.NAME,
						nextLevel: sEndLevel, //aDimensions[i].nextBadge.NAME,
						currentPointsBWBadge: currentPointsBWBadge,
						diffPointsToNextLevel: iDiffPointsBTlvl,
						dimensionUnit: aDimensions[i].UNIT,
						redeemPoints: aDimensions[i].TOTAL_FOR_REDEEM,
						redeemEnabled: !!aDimensions[i].REDEEM,
						showOnlyDimension: !bSameUser
					}));
				} else if (bSameUser) {
					oQuickViewDimensionCtrl.addDimensionGroup(new QuickViewGroupDimension({
						heading: aDimensions[i].NAME,
						headingIcon: sImageUrl,
						totalPoints: parseInt(aDimensions[i].TOTAL, 10),
						pointsToNextLevel: iPointsToNextLvl,
						startLevel: sStartLevel, //aDimensions[i].currentBadge.NAME,
						nextLevel: sEndLevel, //aDimensions[i].nextBadge.NAME,
						currentPointsBWBadge: currentPointsBWBadge,
						diffPointsToNextLevel: iDiffPointsBTlvl,
						dimensionUnit: aDimensions[i].UNIT,
						redeemPoints: aDimensions[i].TOTAL_FOR_REDEEM,
						redeemEnabled: !!aDimensions[i].REDEEM,
						showOnlyDimension: !bSameUser
					}));
				}
			}

		}
	}));
});