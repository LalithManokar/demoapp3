sap.ui.define([
    "sap/ino/vc/idea/mixins/BaseActionMixin",
    "sap/ino/vc/commons/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/Idea",
    "sap/ino/commons/models/object/RewardList",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast"
], function(BaseActionMixin, BaseController, JSONModel, Idea, RewardList, PropertyModel, Filter, FilterOperator, Sorter, MessageToast) {
	"use strict";

	/**
	 * Create Reward Action -
	 */
	var CreateActionMixin = jQuery.extend({}, BaseActionMixin);
	CreateActionMixin.onCreateReward = function(oEvent) {
		var aCustomeData = oEvent.getSource().getCustomData();
		if (!aCustomeData || aCustomeData.length === 0) {
			return;
		}
		var oParameters = this._parseCustomDatas(oEvent);
		var oDialog = this._createRewardDialog();
		this._getChildController(oDialog).setDialog(oDialog);
		var oSettings = {
			actions: ["create", "del", "executeStatusTransition"],
			nodes: ["Root"],
			invalidation: {
				entitySets: ["IdeaFull"]
			},
			continuousUse: true,
			concurrencyEnabled: true,
			readSource: {
				model: this.getDefaultODataModel()
			}
		};
		var oRewardList = new RewardList(oParameters.oKey, oSettings);
		this._getChildController(oDialog).getView().setBusy(true);
		if (!oParameters.oKey.hasOwnProperty("IDEA_ID")) {
			var that = this;
			oRewardList.getDataInitializedPromise().done(function() {
				that._getChildController(oDialog).getView().setBusy(false);
			});
		} else {
			this._handleIdeaInfo(oDialog, oRewardList, oParameters.oKey.IDEA_ID);
		}
		this._setDefaultValue(oRewardList, oParameters);
		oDialog.setModel(oRewardList, "object");
		oDialog.open();
	};

	//Dismiss Idea Reward
	CreateActionMixin.onDismissReward = function(oEvent) {
		var aCustomeData = oEvent.getSource().getCustomData();
		if (!aCustomeData || aCustomeData.length === 0) {
			return;
		}
		var oParameters = this._parseCustomDatas(oEvent);

		if (oParameters.oKey.IDEA_ID) {
			var oController = this;
			var oRequest = Idea.dismissReward(oParameters.oKey.IDEA_ID);
			oRequest.done(function() {
				var oBindingInfo = oController.getList().getBindingInfo("items");
				oController.getList().bindItems(oBindingInfo);
			});
		}
	};

	CreateActionMixin._createRewardDialog = function() {
		var oRewardDialog = this.createFragment("sap.ino.vc.idea.fragments.CreateRewardDialog", this.getView().getId());
		this.getView().addDependent(oRewardDialog);
		return oRewardDialog;
	};

	CreateActionMixin._parseCustomDatas = function(oEvent) {
		var oParameters = {
			oKey: null,
			IdeaPhaseCode: null,
			IdeaName: null,
			UnitCode: null,
			UnitText: null
		};
		var oCustomDatas = oEvent.getSource().getCustomData();
		jQuery.each(oCustomDatas, function(index, data) {
			var sKey = data.getKey();
			var sValue = data.getValue();
			if (sKey === "IdeaId") {
				oParameters.oKey = {
					IDEA_ID: data.getValue(),
					OBJECT_TYPE_CODE: "IDEA",
					OBJECT_ID: data.getValue()
				};
			} else if (sKey === "RewardListId") {
				oParameters.oKey = sValue;
			} else if (oParameters.hasOwnProperty(sKey)) {
				oParameters[sKey] = sValue;
			}
		});
		return oParameters;
	};

	CreateActionMixin._setDefaultValue = function(oRewardList, oParameters) {
		if (typeof oParameters.oKey !== "object") {
			return;
		}
		oRewardList.setProperty("/IDEA_NAME", oParameters.IdeaName);
		oRewardList.setProperty("/IDEA_PHASE_CODE", oParameters.IdeaPhaseCode);
		oRewardList.setProperty("/REWARD_UNIT_CODE", oParameters.UnitCode);
		oRewardList.setProperty("/REWARD_UNIT_TEXT", oParameters.UnitText);
	};

	CreateActionMixin._getChildController = function(oDialog) {
		return oDialog.getContent()[0].getController();
	};

	CreateActionMixin._handleIdeaInfo = function(oDialog, oRewardList, nIdeaId) {
		var that = this;
		oRewardList.getReadSourceModel().read("/IdeaFull(" + nIdeaId + ")/ContributionShare", {
			success: function(oRewards) {
				var aRewards = [];
				jQuery.each(oRewards.results || [], function(index, data) {
					aRewards.push({
						ID: oRewardList.getNextHandle(),
						AUTHOR_ID: data.AUTHOR_ID,
						REWARD_AMOUNT: data.REWARD_AMOUNT,
						REWARD_SHARE: data.REWARD_SHARE,
						CONTRIBUTION_SHARE: data.PERCENTAGE,
						IDEA_ID: data.IDEA_ID,
						EMPLOYEE_NAME: data.AUTHOR_NAME
					});
				});
				that._setIdeaDetails(oRewardList, nIdeaId, aRewards);
				that._getChildController(oDialog).getView().setBusy(false);
			},
			error: function() {
				that._getChildController(oDialog).getView().setBusy(false);
			}
		});
	};

	CreateActionMixin._setIdeaDetails = function(oRewardList, nIdeaId, oRewards) {
		oRewardList.setProperty("/IDEA_ID", nIdeaId);
		oRewardList.setProperty("/Rewards", oRewards);
		oRewardList.setProperty("/REWARD_AMOUNT_TOTAL", 0);
	};

	return CreateActionMixin;
});