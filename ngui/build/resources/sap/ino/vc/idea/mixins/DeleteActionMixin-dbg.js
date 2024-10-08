sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/Idea",
    "sap/ino/commons/models/object/RewardList",
    "sap/ino/commons/models/object/EvaluationRequestItem",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ino/commons/application/Configuration",
    "sap/m/MessageToast"
], function(BaseController, JSONModel, Idea, RewardList, EvaluationRequestItem, PropertyModel, Configuration, MessageToast) {
	"use strict";

	/**
	 * Mixin that handles idea deletion in lists
	 * @mixin
	 */
	var DeleteActionMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	DeleteActionMixin.onDeleteIdea = function(oEvent) {
		var oSource = oEvent.getSource();
		var iIdeaId = oSource.getBindingContext("data").getProperty("ID");
		var oSettings = {
			nodes: [],
			actions: ["del"]
		};
		var that = this;
		var ppmConfig = Configuration.getSystemSettingsModel().getProperty("/sap.ino.config.PPM_INTEGRATION_ACTIVE");

		var fnDelete = function(oPropertyEvent) {
			var oPropModel = oPropertyEvent.getSource();
			var bDeleteAllowed = oPropModel.getProperty("/actions/del/enabled");
			var bHasReward = oPropModel.getProperty("/actions/del/customProperties/hasReward");
			var bIsMergedWithVote = oPropModel.getProperty("/actions/del/customProperties/isMergeedWithVote");
			var bIsMerged = oPropModel.getProperty("/actions/del/customProperties/isMerged");
			if (bHasReward) {
			    //has reward ==> can't delete
				MessageToast.show(that.getText("MSG_IDEA_HAVE_REWARD_CANNOT_DELETE"));
			} else if(!bDeleteAllowed){
			     if(bIsMerged){
			         MessageToast.show(that.getText("MSG_IDEA_MERGED_CANNOT_DELETE"));
			     }
			     else {
			    MessageToast.show(that.getText("OBJECT_MSG_DELETE_FAILED"));
			     }
			    
			} else  {
			    //EVALUATION 
			    var bHasEvaluation = oSource.getBindingContext("data").getProperty("EVALUATION_COUNT");
			    var isManager = oPropModel.getProperty("/actions/del/customProperties/isManager");
			    if( !bHasEvaluation || (bHasEvaluation && isManager) ){
			            //havn't evaluation / hava evaluation and the user is manager/coach ==>add ppm check, then delete
			            var msgConfirm = ppmConfig === "1" ? "MSG_IDEA_CAMP_MANAGER_DEL_CONFIRM_HAVE_PPM" : "MSG_DEL_CONFIRM";
			            var oDelRequest = BaseController.prototype.executeObjectAction.call(that, Idea, "del", {
							staticparameters: iIdeaId,
							messages: {
								confirm: msgConfirm,
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
								that.bindList();
							} else if (that._bindIdeas && typeof(that._bindIdeas) === "function" && that._sIdeaViewKey) {
								that._bindIdeas(that._sIdeaViewKey);
							}
						});
						oDelRequest.fail(function(oResponse) {
							if (oResponse.MESSAGES && oResponse.MESSAGES.length > 0) {
								MessageToast.show(oResponse.MESSAGES[0].MESSAGE_TEXT);
							}
						});
			            
			        }else{
			            //has evaluation and he user is submitter==> can't delete idea
			            MessageToast.show(this.getText("MSG_IDEA_DEL_FAILED_SUBMITTER_HAVE_EVALUATION"));
			        }
			    /***
				var oModel = that.getDefaultODataModel ? that.getDefaultODataModel() : that.getModel("data");
				oModel.read("/IdeaFull("+iIdeaId+")/EvaluationRequestsNumber/$count", {
					success: function(oResult) {
					    var mgrPrivilege = oPropModel.getProperty("/actions/del/customProperties/isManager"),
						oEvalReqCount = Number(oResult);
					    if(!mgrPrivilege && oEvalReqCount >= 1){
			            	MessageToast.show(that.getText("MSG_IDEA_EXISTS_EVALUATION_REQUEST"));
					        return;
					    }
						var msgConfirm = oEvalReqCount >= 1 ? "MSG_IDEA_CAMP_MANAGER_DEL_CONFIRM" : "MSG_DEL_CONFIRM";
						var oDelRequest = BaseController.prototype.executeObjectAction.call(that, Idea, "del", {
							staticparameters: iIdeaId,
							messages: {
								confirm: msgConfirm,
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
							} else if (that._bindIdeas && typeof(that._bindIdeas) === "function" && that._sIdeaViewKey) {
								// context: campaign and normal homepage
								that._bindIdeas(that._sIdeaViewKey);
							}
						});
						oDelRequest.fail(function(oResponse) {
							if (oResponse.MESSAGES && oResponse.MESSAGES.length > 0) {
								MessageToast.show(oResponse.MESSAGES[0].MESSAGE_TEXT);
							}
						});
					}
				});
				***/

			}
		};

		var oProp = new PropertyModel("sap.ino.xs.object.idea.Idea", iIdeaId, oSettings, false, fnDelete);
	};

	DeleteActionMixin.onMassDeleteReward = function(oEvent) {
		var oSource = oEvent.getSource();
		var oTable = this.getTable();
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

	DeleteActionMixin.onMassDeleteEvalReq = function(oEvent) {
		var oSource = oEvent.getSource();
		var oTable = this.getTable();
		var aSelect = oTable.getSelectedIndices();
		var aEvalReqIds = [];
		if (aSelect.length) {
			for (var i = 0; i < aSelect.length; i++) {
				aEvalReqIds.push(oTable.getContextByIndex(aSelect[i]).getProperty("ID"));
			}
		}
		var that = this;

		var oDelRequest = BaseController.prototype.executeObjectAction.call(that, EvaluationRequestItem, "bulkDeleteItems", {
			staticparameters: {
				"EVAL_REQ_ITEM_ID": aEvalReqIds
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

	return DeleteActionMixin;
});