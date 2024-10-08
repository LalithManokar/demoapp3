sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObjectChange",
    "sap/ino/vc/commons/BaseController",
    "sap/ino/vc/idea/mixins/CreateRewardActionMixin",
    "sap/ino/vc/idea/RewardFormatter",
    "sap/m/GroupHeaderListItem"
], function(ApplicationObjectChange,
	BaseController,
	CreateRewardActionMixin,
	RewardFormatter,
	GroupHeaderListItem
) {
	"use strict";

	var oFormatter = {};
	oFormatter = jQuery.extend(oFormatter, RewardFormatter);
	// Format the header of the Rewards Phase group
	oFormatter.formatGroupHeader = function(oGroup) {
		return new GroupHeaderListItem({
			title: this.getText("REWARDS_LBL_IDEA_PHASE") + oFormatter.ideaPhase(oGroup.ideaPhaseCode),
			upperCase: false
		});
	};

	return BaseController.extend("sap.ino.vc.idea.Rewards", jQuery.extend({}, CreateRewardActionMixin, {
		formatter: oFormatter,
		// Use group order as key and map group order to phase code
		// in order to format the group header later on
		grouper: function(oContext) {
			return {
				key: oContext.getProperty("GROUP_ORDER"),
				ideaPhaseCode: oContext.getProperty("IDEA_PHASE_CODE")
			};
		},
		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			this._initHandleRewardsAOChange();
		},

		/*onExit: function() {
			var that = this;
			BaseController.prototype.onExit.apply(this, arguments);
			that._aResizeEvalList.forEach(function(fnResizeEvalList) {
				that.detachListControlResized(fnResizeEvalList);
			});
		},*/

		onItemPress: function(oEvent) {
			this.getView().getController().onCreateReward(oEvent);
		},

		/**
		 * Update the evaluation lists, once an evaluation is
		 * created, deleted, status changed or submitted.
		 */
		_initHandleRewardsAOChange: function() {
			var that = this;

			var fnAOChangeListener = function(oEvent) {
				// if (oEvent.getParameter("object").getMetadata().getName() === "sap.ino.commons.models.object.RewardList"
				// && that && that.getView().byId("rewardsList")) {
				if (that && that.getView().byId("rewardsList")) {
					var fnRebindList = function(oList) {
						if (oList) {
							var oBindingInfo = oList.getBindingInfo("items");
							oList.bindItems(oBindingInfo);
						}
					};

					var sAction = oEvent && oEvent.getParameter("actionName");
					if (sAction && ["create", "del", "submit", "modifyAndSubmit", "executeStatusTransition", "bulkDeleteRewards", "changeAuthorStatic"].indexOf(sAction) > -1) {
						var oChangeRequest = oEvent.getParameter("changeRequest");
						if ((sAction && ["del", "submit", "modifyAndSubmit", "create"].indexOf(sAction) > -1) || oChangeRequest) {
							fnRebindList(that.getView().byId("rewardsList"));
						}
					}
				}
			};

			ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Create, fnAOChangeListener);
			ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Del, fnAOChangeListener);
			ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Action, fnAOChangeListener);
		},

		onEmployeePressed: function(oEvent) {
			oEvent.preventDefault();
			var oSource = oEvent.getSource();
			if (oSource) {

				var iIdentityId = oSource.getBindingContext("data") &&
					oSource.getBindingContext("data").getProperty("EMPLOYEE_ID");
				if (iIdentityId !== undefined && !this.oIdentityCardView) {
					this.oIdentityCardView = sap.ui.xmlview({
						viewName: "sap.ino.vc.iam.IdentityCard"
					});
					this.getView().addDependent(this.oIdentityCardView);
				}
				if (this.oIdentityCardView && this.oIdentityCardView.getController()) {
					this.oIdentityCardView.getController().open(oSource, iIdentityId);
				}
			}
		}
	}));
});