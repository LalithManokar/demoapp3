sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/MessageType",
    "sap/ui/core/message/Message",
    "sap/m/MessageToast",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/object/EvaluationRequestItem",
    "sap/ino/vc/commons/BaseController"
], function(Filter, FilterOperator, Sorter, MessageType, Message, MessageToast, Configuration, EvaluationRequestItem, BaseController) {
	"use strict";

	/**
	 * @class
	 * Mixin that provides an event for user voting
	 */
	var MassActionMixin = function() {
		throw "Mixin may not be instantiated directly";
	};
	
	MassActionMixin._addForwardExpertInputHandling = function(oControl, mSettings) {
		if (!oControl) {
			return;
		}
		var that = this;
		var fnSuggestHandler = that._createSuggestHandler(mSettings.suggestion);
		oControl.attachSuggest(fnSuggestHandler, that);
	};
	
	MassActionMixin._createForwardDialog = function() {
		if (!this._oRequestForwardDialog) {
			this._oRequestForwardDialog = this.createFragment("sap.ino.vc.evaluation.fragments.RequestForward", this.getView().getId());
			this.getView().addDependent(this._oRequestForwardDialog);
		}
		return this._oRequestForwardDialog;
	};
	
	MassActionMixin._createObjectModel = function() {
		var oTable = this.getList();
		var vObjectKey = oTable.getContextByIndex(oTable.getSelectedIndex()).getProperty("ID");
		return new EvaluationRequestItem(vObjectKey, {
			actions: ["update", "del", "executeStatusTransition", "sendClarification", "forward"],
			continuousUse: true,
			readSource: {
				model: this.getDefaultODataModel()
			}
		});
	};
	
	MassActionMixin._executeStatusTransition = function(sStatusAction) {
		var that = this;
		//if (!this._oModel) {
			this._oModel = this._createObjectModel();
		//}
		var oActionRequest = this._oModel.executeStatusTransition({
			STATUS_ACTION_CODE: sStatusAction
		});
		if (oActionRequest) {
			oActionRequest.done(function() {
				MessageToast.show(that.getText("OBJECT_MSG_STATUS_CHANGE_SUCCESS"));
			});
			oActionRequest.fail(function(o) {
				if (o.MESSAGES && o.MESSAGES.length > 0) {
					MessageToast.show(that.getText(o.MESSAGES[0].MESSAGE_TEXT));
				}
			});
		}
	};

	MassActionMixin.onAccept = function() {
		this._executeStatusTransition("sap.ino.config.EVAL_REQ_ACCEPT");
	};

	MassActionMixin.onReject = function() {
		this._executeStatusTransition("sap.ino.config.EVAL_REQ_REJECT");
	};
	
	MassActionMixin.onForward = function() {
		var oRequestForwardDialog = this._createForwardDialog();
		oRequestForwardDialog.open();
		if (!this._oModel) {
			this._oModel = this._createObjectModel();
		}
		this._addForwardExpertInputHandling(this.byId("inputForwardExpert"), {
			suggestion: {
				key: "ID",
				text: "NAME",
				additionalText: "USER_NAME",
				path: "data>/SearchIdentity(searchToken='$suggestValue')/Results",
				filters: [new Filter({
					path: "ID",
					operator: FilterOperator.NE,
					value1: Configuration.getCurrentUser().USER_ID
				})],
				sorter: new Sorter("NAME")
			},
			token: {
				key: "IDENTITY_ID",
				text: "NAME"
			}
		});
	};

	MassActionMixin.onForwardClose = function() {
		if (!this._oModel) {
			this._oModel = this._createObjectModel();
		}
		this._oModel.oData.Forwards = [];
		this._oRequestForwardDialog.close();
		this.byId("inputForwardExpert").removeAllTokens();
		this.byId("txtAreaForwardReasonDes").setValue("");
		// this._oRequestForwardDialog.destroy();
	};
	
	MassActionMixin.onSubmitForward = function() {
		var that = this;
		if (!this._oModel) {
			this._oModel = this._createObjectModel();
		}
		var oForwardExpert = that.byId("inputForwardExpert").getTokens();
		var sText = that.byId("inputForwardExpert").getValue();
		if (oForwardExpert.length > 0 && !sText) {
			that._createForwardDialog();
			var iForwardID = parseInt(oForwardExpert[0].mProperties.key, 10);
			var oForwardAction = that.executeObjectAction(this._oModel, "forward", {
				parameters: {
					EXPERT_ID: iForwardID,
					COMMENT_FORWARD: that.byId("txtAreaForwardReasonDes").getValue().trim()
				},
				messages: {
					success: "EVALUATIONREQUESTS_MSG_FORWARD_SUCCESS",
					error: "EVALUATIONREQUESTS_MSG_FORWARD_FAILURE"
				}
			});
			oForwardAction.done(function() {
				that._oRequestForwardDialog.close();
				that.byId("inputForwardExpert").removeAllTokens();
				that.byId("txtAreaForwardReasonDes").setValue("");
			});
			oForwardAction.always(function() {
				that._oRequestForwardDialog.setBusy(false);
			});
		} else {
			that.setClientMessage(
				new Message({
					code: "EVALUATIONREQUESTS_MSG_FORWARD_NO_EXPERT",
					type: MessageType.Error
				}),
				that.byId("inputForwardExpert"));
			that.byId("inputForwardExpert").setValue("");
		}
	};

	MassActionMixin.onCreateEvaluation = function() {
		var oTable = this.getList();
		var iIdeaId = oTable.getContextByIndex(oTable.getSelectedIndex()).getProperty("IDEA_ID");
		this.navigateTo("evaluation-create", {
			query: {
				ideaId: iIdeaId
			}
		});
	};

	MassActionMixin.onMassDelete = function(oEvent) {
		var oSource = oEvent.getSource();
		var oTable = this.getList();
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
				that.bindList();
			}
		});
	};
	
	MassActionMixin.resetActionState = function(){
	    var that = this;
	    var aButtons = ["sapInoAcceptBtn", "sapInoRejectBtn", "sapInoFowardBtn", "sapInoCreateBtn", "sapInoMassDeleteBtn"];
        jQuery.each(aButtons, function (iIdx, sElementID) {
            var oBtn = that.byId(sElementID);
            if (oBtn) {
                oBtn.setEnabled(false);
            }
        });
	};

	return MassActionMixin;
});