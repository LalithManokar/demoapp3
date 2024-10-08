sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ino/commons/models/object/RewardList",
    "sap/ino/vc/commons/BaseController"
], function(JSONModel, PropertyModel, RewardList, BaseController) {
	"use strict";

	var MassActionMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	MassActionMixin.onMassDelete = function(oEvent) {
		var oSource = oEvent.getSource();
		var oTable = this.getList();
		var aRewardId = [];
		var aRewardListId = [];
		var aSelect = oTable.getSelectedIndices();
		if (aSelect.length) {
			for (var i = 0; i < aSelect.length; i++) {
				aRewardId.push(oTable.getContextByIndex(aSelect[i]).getProperty("ID"));
				if (aRewardListId.indexOf(oTable.getContextByIndex(aSelect[i]).getProperty("REWARD_LIST_ID")) === -1) {
					aRewardListId.push(oTable.getContextByIndex(aSelect[i]).getProperty("REWARD_LIST_ID"));
				}
			}
		}
		var that = this;

		var oDelRequest = BaseController.prototype.executeObjectAction.call(that, RewardList, "bulkDeleteRewards", {
			staticparameters: {
				"REWARD_ID": aRewardId,
				"REWARD_LIST_ID": aRewardListId
			},
			messages: {
				confirm: "MSG_DEL_CONFIRM",
				success: "MSG_DEL_SUCCESS"
			}
		});
		oDelRequest.done(function(oResponse) {
			if (oResponse && oResponse.confirmationCancelled === true) {
				if (oSource && jQuery.type(oSource.focus) === "function") {
					oSource.focus();
				}
				return;
			}
			if (that.bindList && typeof(that.bindList) === "function") {
				// context: idea list (campaign / all)
				that.bindList();
			}
		});
	};

	MassActionMixin.resetActionState = function() {
		var that = this;
		var aButtons = ["sapInoMassExportBtn", "sapInoMassDeleteBtn"];
		jQuery.each(aButtons, function(iIdx, sElementID) {
			var oBtn = that.byId(sElementID);
			if (oBtn) {
				oBtn.setEnabled(false);
			}
		});
	};

	return MassActionMixin;
});