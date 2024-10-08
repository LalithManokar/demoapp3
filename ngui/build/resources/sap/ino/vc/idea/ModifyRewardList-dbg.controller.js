sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/m/MessageToast",
    "sap/ino/vc/idea/RewardFormatter"],
	function(BaseController, MessageToast, RewardFormatter) {
		"use strict";
		return BaseController.extend("sap.ino.vc.idea.ModifyRewardList", {
			formatter: RewardFormatter,
			setDialog: function(oDialog) {
				this._oDialog = oDialog;
			},
			//event
			onExecuteStatusTransition: function(sStatusAction) {
				var oContorller = this;
				var oModel = oContorller.getObjectModel();
				var oActionRequest = oModel.executeStatusTransition({
					STATUS_ACTION_CODE: sStatusAction
				});
				if (oActionRequest) {
					oActionRequest.done(function() {
						MessageToast.show(oContorller.getText("OBJECT_MSG_STATUS_CHANGE_SUCCESS"));
					});
					oActionRequest.fail(function(o) {
						if (o.MESSAGES && o.MESSAGES.length > 0) {
							MessageToast.show(oContorller.getText(o.MESSAGES[0].MESSAGE_TEXT));
						}
					});
				}
			},

			onSave: function() {
				this.resetClientMessages();
				this._setRewardUnit();
				this.executeObjectAction("modify");
			},

			onDel: function(oEvent) {
				return this.executeObjectAction("del", {
					messages: {
						confirm: "MSG_DEL_CONFIRM",
						success: "MSG_DEL_SUCCESS"
					}
				});
			},

// 			onIdeaPressed: function() {
// 				var oModel = this.getObjectModel();
// 				var iId = oModel.getProperty("/IDEA_ID");
// 				this._closeDialog();
// 				this.navigateTo("idea-display", {
// 					id: iId
// 				}, true);
// 			},

			onRewardsBtnUnPublish: function() {
				this.onExecuteStatusTransition('sap.ino.config.REWARD_UNPUBLISH');
			},

			onRewardsBtnPublishAuthor: function() {
				this.onExecuteStatusTransition('sap.ino.config.REWARD_PUB_AUTHOR');
			},

			onRewardsBtnPublishCommunity: function() {
				this.onExecuteStatusTransition('sap.ino.config.REWARD_PUB_COMMUNITY');
			},

			onRewardDialogDel: function(oEvent) {
				var that = this;
				var oDelRequest = this.onDel(oEvent);
				var oDelBtn = oEvent.getSource();
				oDelRequest.done(function(oResponse) {
					if (!oResponse || !oResponse.confirmationCancelled) {
						that._closeDialog();
						return;
					}
					if (oDelBtn && jQuery.type(oDelBtn.focus) === "function") {
						oDelBtn.focus();
					}
				});
			},

			onRewardDialogCancel: function() {
				this._closeDialog();
			},

			onRewardAmoutChange: function(oEvent) {
				var nAuthorId = this._getAuthorId(oEvent);
				var nTotalAmount = this._getTotalAmount(nAuthorId, oEvent);
				this._setRewardShare(nAuthorId, nTotalAmount, oEvent);
				this._setLastRewardShare();
				this.getObjectModel().setProperty("/REWARD_AMOUNT_TOTAL", nTotalAmount);
			},

			_getAuthorId: function(oEvent) {
				var nAuthorId = -1;
				var aCustomData = oEvent.getSource().getCustomData();
				jQuery.each(aCustomData, function(index, data) {
					if (data.getKey() === "Id") {
						nAuthorId = data.getValue();
						return false;
					}
				});
				return nAuthorId;
			},

			_getTotalAmount: function(nAuthorId, oEvent) {
				var sum = 0;
				var aRewards = this.getObjectModel().getProperty("/Rewards");
				jQuery.each(aRewards, function(index, data) {
					var sValue = data.REWARD_AMOUNT;
					if (data.AUTHOR_ID === nAuthorId) {
						sValue = oEvent.getParameter("value");
					}
					if (sValue) {
						var amount = parseInt(sValue.toString().replace(/,/g, ""), 10);
						if (!isNaN(amount)) {
							sum += parseInt(amount, 10);
						}
					}
				});
				return sum;
			},

			_setRewardShare: function(nAuthorId, nTotalAmount, oEvent) {
				var nSumAmout = nTotalAmount;
				if (!nSumAmout) {
					nSumAmout = 1;
				}
				var oModel = this.getObjectModel();
				var aRewards = oModel.getProperty("/Rewards");
				jQuery.each(aRewards, function(index, data) {
					var sValue = data.REWARD_AMOUNT;
					if (data.AUTHOR_ID === nAuthorId) {
						sValue = oEvent.getParameter("value");
					}
					if (sValue) {
						var amount = parseInt(sValue.toString().replace(/,/g, ""), 10);
						if (isNaN(amount) || amount === 0) {
							amount = 0;
						} else {
							amount = Math.round(amount * 100 / nSumAmout);
						}
						oModel.setProperty("/Rewards/" + index + "/REWARD_SHARE", amount);
					}
				});
			},

			_setLastRewardShare: function() {
				var nPercentage = 0;
				var oModel = this.getObjectModel();
				var aRewards = oModel.getProperty("/Rewards");
				jQuery.each(aRewards, function(index, data) {
					if (data.REWARD_SHARE) {
						nPercentage += data.REWARD_SHARE;
					}
				});
				var nRewardLength = aRewards.length - 1;
				for (; nRewardLength >= 0; nRewardLength--) {
					if (aRewards[nRewardLength].REWARD_SHARE > 0) {
						oModel.setProperty("/Rewards/" + nRewardLength + "/REWARD_SHARE",
							100 - nPercentage + aRewards[nRewardLength].REWARD_SHARE);
						break;
					}
				}
			},

			_setRewardUnit: function() {
				var oModel = this.getObjectModel();
				var aRewards = oModel.getProperty("/Rewards");
				var sUnit = oModel.getProperty("/REWARD_UNIT_CODE");
				oModel.setProperty("/REWARD_UNIT", sUnit);
				jQuery.each(aRewards, function(index, data) {
					oModel.setProperty("/Rewards/" + index + "/REWARD_UNIT", sUnit);
				});
			},

			rewardShareFormatter: function(nRewardShare) {
				if (nRewardShare === null || nRewardShare === void 0) {
					return "";
				}
				return Math.round(parseFloat(nRewardShare * 100)) / 100 + "%";
			},

			_closeDialog: function() {
				if (this._oDialog) {
					this._oDialog.close();
					this._oDialog.destroy();
				}
			}
			//end
		});

	});